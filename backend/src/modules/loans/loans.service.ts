import prisma from '../../config/database';
import { LoanStatus } from '@prisma/client';
import { generateEmiSchedule } from '../../utils/emi.calculator';
import { calculateLtv } from '../../utils/ltv.calculator';

/**
 * Loans Service
 * Manages active loans, EMI payments, and LTV monitoring.
 */
export class LoanService {

    async findAll(filters: { status?: LoanStatus; page?: number; limit?: number }) {
        const { status, page = 1, limit = 20 } = filters;

        const where: any = {};
        if (status) where.status = status;

        const [loans, total] = await Promise.all([
            prisma.loan.findMany({
                where,
                include: {
                    loanApplication: {
                        include: {
                            user: { select: { id: true, name: true, email: true } },
                            product: { select: { id: true, name: true } },
                        },
                    },
                    collaterals: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.loan.count({ where }),
        ]);

        // Add LTV status to each loan
        const loansWithLtv = loans.map(loan => {
            const totalCollateralValue = loan.collaterals.reduce(
                (sum, c) => sum + c.currentValue, 0
            );
            const ltvStatus = calculateLtv({
                currentCollateralValue: totalCollateralValue,
                outstandingAmount: loan.outstandingPrincipal + loan.outstandingInterest,
            });

            return {
                ...loan,
                totalCollateralValue,
                ltvStatus,
            };
        });

        return {
            loans: loansWithLtv,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async findById(id: string) {
        const loan = await prisma.loan.findUnique({
            where: { id },
            include: {
                loanApplication: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true } },
                        loanProduct: true,
                        product: true,
                    },
                },
                collaterals: true,
                transactions: { orderBy: { createdAt: 'desc' } },
                order: true,
            },
        });

        if (!loan) {
            throw new Error('Loan not found');
        }

        // Calculate EMI schedule
        const emiSchedule = generateEmiSchedule(
            loan.principal,
            Number(loan.interestRate),
            loan.tenureMonths,
            loan.disbursedAt
        );

        // Calculate LTV
        const totalCollateralValue = loan.collaterals.reduce(
            (sum, c) => sum + c.currentValue, 0
        );
        const ltvStatus = calculateLtv({
            currentCollateralValue: totalCollateralValue,
            outstandingAmount: loan.outstandingPrincipal + loan.outstandingInterest,
        });

        return {
            ...loan,
            emiSchedule,
            totalCollateralValue,
            ltvStatus,
        };
    }

    async recordEmiPayment(id: string, amount: number) {
        const loan = await prisma.loan.findUnique({ where: { id } });

        if (!loan) throw new Error('Loan not found');
        if (loan.status !== 'ACTIVE') throw new Error('Loan is not active');

        // Split payment between interest and principal
        const interestPortion = Math.min(amount, loan.outstandingInterest);
        const principalPortion = amount - interestPortion;

        const newOutstandingPrincipal = Math.max(0, loan.outstandingPrincipal - principalPortion);
        const newOutstandingInterest = Math.max(0, loan.outstandingInterest - interestPortion);

        // Update loan and create transaction
        return prisma.$transaction(async (tx) => {
            const updatedLoan = await tx.loan.update({
                where: { id },
                data: {
                    outstandingPrincipal: newOutstandingPrincipal,
                    outstandingInterest: newOutstandingInterest,
                    nextEmiDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });

            await tx.loanTransaction.create({
                data: {
                    loanId: id,
                    type: 'EMI_PAYMENT',
                    amount,
                    principalComponent: principalPortion,
                    interestComponent: interestPortion,
                    balanceAfter: newOutstandingPrincipal + newOutstandingInterest,
                },
            });

            return updatedLoan;
        });
    }

    async closeLoan(id: string) {
        const loan = await prisma.loan.findUnique({
            where: { id },
            include: { collaterals: true },
        });

        if (!loan) throw new Error('Loan not found');
        if (loan.status !== 'ACTIVE') throw new Error('Loan is not active');

        if (loan.outstandingPrincipal > 0 || loan.outstandingInterest > 0) {
            throw new Error('Cannot close loan with outstanding balance');
        }

        return prisma.$transaction(async (tx) => {
            // Update loan status
            await tx.loan.update({
                where: { id },
                data: {
                    status: 'CLOSED',
                    closedAt: new Date(),
                },
            });

            // Mark collaterals as release requested
            await tx.collateral.updateMany({
                where: { loanId: id },
                data: { lienStatus: 'RELEASE_REQUESTED' },
            });

            return tx.loan.findUnique({
                where: { id },
                include: { collaterals: true },
            });
        });
    }
}

export const loanService = new LoanService();
