import prisma from '../../config/database';
import { CreateCollateralInput, UpdateNavInput } from './collaterals.schema';
import { calculateEligibleAmount } from '../../utils/ltv.calculator';

/**
 * Collateral Service
 * Manages mutual fund collaterals and NAV-based valuations.
 */
export class CollateralService {

    /**
     * Get collaterals by loan application
     */
    async findByApplication(loanApplicationId: string) {
        return prisma.collateral.findMany({
            where: { loanApplicationId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get collaterals by loan
     */
    async findByLoan(loanId: string) {
        return prisma.collateral.findMany({
            where: { loanId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get all collaterals with optional filters
     */
    async findAll(filters: { loanApplicationId?: string; loanId?: string; lienStatus?: string }) {
        const where: any = {};
        if (filters.loanApplicationId) where.loanApplicationId = filters.loanApplicationId;
        if (filters.loanId) where.loanId = filters.loanId;
        if (filters.lienStatus) where.lienStatus = filters.lienStatus;

        return prisma.collateral.findMany({
            where,
            include: {
                loanApplication: { select: { applicationNumber: true, status: true } },
                loan: { select: { loanNumber: true, status: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Add collateral to a loan application
     */
    async create(input: CreateCollateralInput, userId: string) {
        // Verify application exists and belongs to user
        const application = await prisma.loanApplication.findUnique({
            where: { id: input.loanApplicationId },
            include: { loanProduct: true },
        });

        if (!application) {
            throw new Error('Loan application not found');
        }

        if (application.userId !== userId) {
            throw new Error('Not authorized to add collateral to this application');
        }

        if (application.status !== 'DRAFT') {
            throw new Error('Can only add collateral to DRAFT applications');
        }

        // Calculate values
        const pledgedValue = Math.round(input.units * input.nav);
        const currentValue = pledgedValue;

        // Determine LTV based on fund type
        const ltv = input.fundType === 'EQUITY'
            ? Number(application.loanProduct.equityLtv)
            : input.fundType === 'DEBT'
                ? Number(application.loanProduct.debtLtv)
                : (Number(application.loanProduct.equityLtv) + Number(application.loanProduct.debtLtv)) / 2;

        const eligibleAmount = calculateEligibleAmount(currentValue, ltv);

        return prisma.collateral.create({
            data: {
                loanApplicationId: input.loanApplicationId,
                fundName: input.fundName,
                fundType: input.fundType,
                isin: input.isin,
                folioNumber: input.folioNumber,
                units: input.units,
                nav: input.nav,
                pledgedValue,
                currentValue,
                ltvApplied: ltv,
                eligibleAmount,
                registrar: input.registrar,
                lienStatus: 'PENDING',
            },
        });
    }

    /**
     * Update NAV for a collateral and recalculate eligible amount
     */
    async updateNav(id: string, input: UpdateNavInput) {
        const collateral = await prisma.collateral.findUnique({
            where: { id },
        });

        if (!collateral) {
            throw new Error('Collateral not found');
        }

        // Calculate new current value
        const currentValue = Math.round(Number(collateral.units) * input.nav);
        const eligibleAmount = calculateEligibleAmount(currentValue, Number(collateral.ltvApplied));

        return prisma.collateral.update({
            where: { id },
            data: {
                nav: input.nav,
                currentValue,
                eligibleAmount,
            },
        });
    }

    /**
     * Request lien release (after loan closure)
     */
    async requestRelease(id: string) {
        const collateral = await prisma.collateral.findUnique({
            where: { id },
            include: { loan: true },
        });

        if (!collateral) {
            throw new Error('Collateral not found');
        }

        if (!collateral.loan || collateral.loan.status !== 'CLOSED') {
            throw new Error('Can only release collateral for closed loans');
        }

        return prisma.collateral.update({
            where: { id },
            data: { lienStatus: 'RELEASE_REQUESTED' },
        });
    }

    /**
     * Complete lien release (admin action)
     */
    async completeRelease(id: string) {
        const collateral = await prisma.collateral.findUnique({
            where: { id },
        });

        if (!collateral) {
            throw new Error('Collateral not found');
        }

        if (collateral.lienStatus !== 'RELEASE_REQUESTED') {
            throw new Error('Release must be requested first');
        }

        return prisma.collateral.update({
            where: { id },
            data: { lienStatus: 'RELEASED' },
        });
    }
}

export const collateralService = new CollateralService();
