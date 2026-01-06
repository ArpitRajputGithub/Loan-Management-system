import prisma from '../../config/database';
import { TrancheStatus, TrancheTransactionType } from '@prisma/client';
import { CreateTrancheInput, PayTrancheInput } from './tranches.schema';
import { creditLineService } from '../creditLines/creditLines.service';

class TrancheService {
    /**
     * Generate unique tranche number
     */
    private async generateTrancheNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const count = await prisma.tranche.count();
        const sequence = (count + 1).toString().padStart(5, '0');
        return `TR-${year}-${sequence}`;
    }

    /**
     * Get tranche by ID
     */
    async getById(id: string) {
        return prisma.tranche.findUnique({
            where: { id },
            include: {
                creditLine: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    /**
     * Get all tranches for a credit line
     */
    async getByCreditLineId(creditLineId: string) {
        return prisma.tranche.findMany({
            where: { creditLineId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Create a new tranche (withdrawal from credit line)
     */
    async create(creditLineId: string, input: CreateTrancheInput) {
        const creditLine = await prisma.creditLine.findUnique({
            where: { id: creditLineId },
        });

        if (!creditLine) {
            throw new Error('Credit line not found');
        }

        if (creditLine.status !== 'ACTIVE') {
            throw new Error(`Cannot withdraw from credit line in ${creditLine.status} status`);
        }

        if (input.amount > creditLine.availableLimit) {
            throw new Error(
                `Insufficient available limit. Available: ₹${creditLine.availableLimit}, Requested: ₹${input.amount}`
            );
        }

        const trancheNumber = await this.generateTrancheNumber();

        // Create tranche and update credit line in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the tranche
            const tranche = await tx.tranche.create({
                data: {
                    trancheNumber,
                    creditLineId,
                    principalAmount: input.amount,
                    outstandingPrincipal: input.amount,
                    interestRate: creditLine.interestRate,
                    status: 'ACTIVE',
                    disbursedAt: new Date(),
                    purpose: input.purpose,
                },
            });

            // Create disbursement transaction
            await tx.trancheTransaction.create({
                data: {
                    trancheId: tranche.id,
                    type: 'DISBURSEMENT',
                    amount: input.amount,
                    principalComponent: input.amount,
                    interestComponent: 0,
                    balanceAfter: input.amount,
                    reference: `Disbursement for ${trancheNumber}`,
                },
            });

            // Update credit line
            await tx.creditLine.update({
                where: { id: creditLineId },
                data: {
                    utilizedAmount: { increment: input.amount },
                    availableLimit: { decrement: input.amount },
                },
            });

            return tranche;
        });

        // Update LTV on credit line
        await creditLineService.updateCreditLineAggregates(creditLineId);

        return result;
    }

    /**
     * Make a payment against a tranche
     */
    async makePayment(trancheId: string, input: PayTrancheInput) {
        const tranche = await prisma.tranche.findUnique({
            where: { id: trancheId },
            include: { creditLine: true },
        });

        if (!tranche) {
            throw new Error('Tranche not found');
        }

        if (tranche.status !== 'ACTIVE') {
            throw new Error('This tranche is already closed');
        }

        const totalOutstanding = tranche.outstandingPrincipal + tranche.accruedInterest;

        if (input.amount > totalOutstanding) {
            throw new Error(
                `Payment amount exceeds outstanding balance. Outstanding: ₹${totalOutstanding}`
            );
        }

        // Split payment: interest first, then principal
        let interestPayment = Math.min(input.amount, tranche.accruedInterest);
        let principalPayment = input.amount - interestPayment;

        const newOutstandingPrincipal = tranche.outstandingPrincipal - principalPayment;
        const newAccruedInterest = tranche.accruedInterest - interestPayment;

        const isFullRepayment = newOutstandingPrincipal <= 0 && newAccruedInterest <= 0;

        // Update tranche and create transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create payment transaction
            await tx.trancheTransaction.create({
                data: {
                    trancheId,
                    type: isFullRepayment ? 'FULL_REPAYMENT' :
                        principalPayment > 0 ? 'PRINCIPAL_PAYMENT' : 'INTEREST_PAYMENT',
                    amount: input.amount,
                    principalComponent: principalPayment,
                    interestComponent: interestPayment,
                    balanceAfter: newOutstandingPrincipal,
                    reference: isFullRepayment
                        ? `Full repayment for ${tranche.trancheNumber}`
                        : `Payment for ${tranche.trancheNumber}`,
                },
            });

            // Update tranche
            const updatedTranche = await tx.tranche.update({
                where: { id: trancheId },
                data: {
                    outstandingPrincipal: Math.max(0, newOutstandingPrincipal),
                    accruedInterest: Math.max(0, newAccruedInterest),
                    paidInterest: { increment: interestPayment },
                    status: isFullRepayment ? 'CLOSED' : 'ACTIVE',
                    closedAt: isFullRepayment ? new Date() : null,
                },
            });

            // Update credit line
            await tx.creditLine.update({
                where: { id: tranche.creditLineId },
                data: {
                    utilizedAmount: { decrement: principalPayment },
                    availableLimit: { increment: principalPayment },
                    accruedInterest: { decrement: interestPayment },
                },
            });

            return updatedTranche;
        });

        // Update LTV
        await creditLineService.updateCreditLineAggregates(tranche.creditLineId);

        return result;
    }

    /**
     * Accrue daily interest on a tranche
     */
    async accrueInterest(trancheId: string) {
        const tranche = await prisma.tranche.findUnique({
            where: { id: trancheId },
        });

        if (!tranche || tranche.status !== 'ACTIVE') {
            return null;
        }

        // Daily interest = (Outstanding × Annual Rate) / 365
        const dailyInterest = Math.round(
            (tranche.outstandingPrincipal * Number(tranche.interestRate)) / 100 / 365
        );

        await prisma.tranche.update({
            where: { id: trancheId },
            data: {
                accruedInterest: { increment: dailyInterest },
            },
        });

        // Also update credit line
        await prisma.creditLine.update({
            where: { id: tranche.creditLineId },
            data: {
                accruedInterest: { increment: dailyInterest },
            },
        });

        return dailyInterest;
    }

    /**
     * Accrue interest on all active tranches (daily job)
     */
    async accrueInterestOnAllActiveTranches() {
        const activeTranches = await prisma.tranche.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
        });

        let totalInterestAccrued = 0;
        for (const tranche of activeTranches) {
            const interest = await this.accrueInterest(tranche.id);
            if (interest) {
                totalInterestAccrued += interest;
            }
        }

        return {
            tranchesProcessed: activeTranches.length,
            totalInterestAccrued,
        };
    }

    /**
     * Get transaction history for a tranche
     */
    async getTransactions(trancheId: string) {
        return prisma.trancheTransaction.findMany({
            where: { trancheId },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export const trancheService = new TrancheService();
