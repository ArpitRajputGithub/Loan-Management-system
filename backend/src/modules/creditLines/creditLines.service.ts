import prisma from '../../config/database';
import { CreditLineStatus, FundType, LienStatus, Registrar } from '@prisma/client';
import { CreateCreditLineInput, AddCollateralInput } from './creditLines.schema';

// LTV Thresholds
const LTV_THRESHOLDS = {
    EQUITY: 0.50,      // 50% for equity funds
    DEBT: 0.80,        // 80% for debt funds
    HYBRID: 0.65,      // 65% for hybrid funds
    WARNING: 0.70,     // Warning at 70% LTV
    MARGIN_CALL: 0.85, // Margin call at 85% LTV
    LIQUIDATION: 0.95, // Liquidation at 95% LTV
};

class CreditLineService {
    /**
     * Generate unique credit line number
     */
    private async generateCreditLineNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const count = await prisma.creditLine.count();
        const sequence = (count + 1).toString().padStart(5, '0');
        return `CL-${year}-${sequence}`;
    }

    /**
     * Get credit line for current user
     */
    async getByUserId(userId: string) {
        return prisma.creditLine.findUnique({
            where: { userId },
            include: {
                collaterals: true,
                tranches: {
                    include: {
                        transactions: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                marginCalls: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    /**
     * Get credit line by ID
     */
    async getById(id: string) {
        return prisma.creditLine.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, pan: true },
                },
                collaterals: true,
                tranches: {
                    include: { transactions: true },
                    orderBy: { createdAt: 'desc' },
                },
                marginCalls: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    /**
     * Get all credit lines (admin)
     */
    async getAll(page: number = 1, limit: number = 20, status?: CreditLineStatus) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};

        const [creditLines, total] = await Promise.all([
            prisma.creditLine.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    _count: { select: { collaterals: true, tranches: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.creditLine.count({ where }),
        ]);

        return {
            data: creditLines,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Create a new credit line for user with pledged holdings
     */
    async create(userId: string, input: CreateCreditLineInput) {
        // Check if user already has a credit line
        const existing = await prisma.creditLine.findUnique({
            where: { userId },
        });

        if (existing) {
            throw new Error('User already has a credit line');
        }

        // Calculate sanctioned limit from holdings
        let totalCollateralValue = 0;
        let totalEligibleAmount = 0;

        const collateralsData = input.holdings.map((holding) => {
            const currentValue = Math.round(holding.units * holding.nav);
            const ltvApplied = LTV_THRESHOLDS[holding.fundType as keyof typeof LTV_THRESHOLDS] || 0.50;
            const eligibleAmount = Math.round(currentValue * ltvApplied);

            totalCollateralValue += currentValue;
            totalEligibleAmount += eligibleAmount;

            return {
                fundName: holding.fundName,
                fundType: holding.fundType as FundType,
                isin: holding.isin,
                folioNumber: holding.folioNumber,
                units: holding.units,
                nav: holding.nav,
                pledgedValue: currentValue,
                currentValue,
                ltvApplied,
                eligibleAmount,
                registrar: (holding.registrar as Registrar) || 'CAMS',
                lienStatus: 'PENDING' as LienStatus,
            };
        });

        const sanctionedLimit = totalEligibleAmount;
        const creditLineNumber = await this.generateCreditLineNumber();

        // Create credit line and collaterals in a transaction
        const creditLine = await prisma.$transaction(async (tx) => {
            // Create credit line
            const cl = await tx.creditLine.create({
                data: {
                    creditLineNumber,
                    userId,
                    sanctionedLimit,
                    availableLimit: sanctionedLimit,
                    interestRate: input.interestRate,
                    totalCollateralValue,
                    totalEligibleAmount,
                    status: 'PENDING',
                },
            });

            // Create all collaterals
            await tx.collateral.createMany({
                data: collateralsData.map((c) => ({
                    ...c,
                    creditLineId: cl.id,
                })),
            });

            return cl;
        });

        // Return with collaterals
        return prisma.creditLine.findUnique({
            where: { id: creditLine.id },
            include: {
                collaterals: true,
            },
        });
    }

    /**
     * Add collateral to credit line
     */
    async addCollateral(creditLineId: string, input: AddCollateralInput) {
        const creditLine = await prisma.creditLine.findUnique({
            where: { id: creditLineId },
        });

        if (!creditLine) {
            throw new Error('Credit line not found');
        }

        // Calculate values
        const currentValue = Math.round(input.units * input.nav);
        const ltvApplied = LTV_THRESHOLDS[input.fundType as keyof typeof LTV_THRESHOLDS] || 0.50;
        const eligibleAmount = Math.round(currentValue * ltvApplied);

        // Create collateral
        const collateral = await prisma.collateral.create({
            data: {
                creditLineId,
                fundName: input.fundName,
                fundType: input.fundType as FundType,
                isin: input.isin,
                folioNumber: input.folioNumber,
                units: input.units,
                nav: input.nav,
                pledgedValue: currentValue,
                currentValue,
                ltvApplied,
                eligibleAmount,
                registrar: (input.registrar as Registrar) || 'CAMS',
                lienStatus: 'PENDING',
            },
        });

        // Update credit line aggregates
        await this.updateCreditLineAggregates(creditLineId);

        return collateral;
    }

    /**
     * Update aggregated values on credit line
     */
    async updateCreditLineAggregates(creditLineId: string) {
        const collaterals = await prisma.collateral.findMany({
            where: { creditLineId, lienStatus: { not: 'RELEASED' } },
        });

        const totalCollateralValue = collaterals.reduce(
            (sum, c) => sum + c.currentValue,
            0
        );
        const totalEligibleAmount = collaterals.reduce(
            (sum, c) => sum + c.eligibleAmount,
            0
        );

        const creditLine = await prisma.creditLine.findUnique({
            where: { id: creditLineId },
        });

        const currentLtv = totalCollateralValue > 0
            ? (creditLine?.utilizedAmount || 0) / totalCollateralValue
            : null;

        await prisma.creditLine.update({
            where: { id: creditLineId },
            data: {
                totalCollateralValue,
                totalEligibleAmount,
                currentLtv,
            },
        });
    }

    /**
     * Activate credit line (after collateral is pledged)
     */
    async activate(creditLineId: string) {
        const creditLine = await prisma.creditLine.findUnique({
            where: { id: creditLineId },
            include: { collaterals: true },
        });

        if (!creditLine) {
            throw new Error('Credit line not found');
        }

        if (creditLine.status !== 'PENDING') {
            throw new Error(`Cannot activate credit line in ${creditLine.status} status`);
        }

        if (creditLine.collaterals.length === 0) {
            throw new Error('Cannot activate credit line without collateral');
        }

        // Mark liens as MARKED
        await prisma.collateral.updateMany({
            where: { creditLineId, lienStatus: 'PENDING' },
            data: { lienStatus: 'MARKED', lienMarkedAt: new Date() },
        });

        // Activate credit line
        return prisma.creditLine.update({
            where: { id: creditLineId },
            data: {
                status: 'ACTIVE',
                activatedAt: new Date(),
            },
        });
    }

    /**
     * Freeze credit line (for margin call)
     */
    async freeze(creditLineId: string, reason?: string) {
        const creditLine = await prisma.creditLine.findUnique({
            where: { id: creditLineId },
        });

        if (!creditLine) {
            throw new Error('Credit line not found');
        }

        if (creditLine.status !== 'ACTIVE') {
            throw new Error(`Cannot freeze credit line in ${creditLine.status} status`);
        }

        return prisma.creditLine.update({
            where: { id: creditLineId },
            data: { status: 'FROZEN' },
        });
    }

    /**
     * Unfreeze credit line
     */
    async unfreeze(creditLineId: string) {
        const creditLine = await prisma.creditLine.findUnique({
            where: { id: creditLineId },
        });

        if (!creditLine || creditLine.status !== 'FROZEN') {
            throw new Error('Credit line not found or not frozen');
        }

        return prisma.creditLine.update({
            where: { id: creditLineId },
            data: { status: 'ACTIVE' },
        });
    }

    /**
     * Close credit line (after full repayment)
     */
    async close(creditLineId: string) {
        const creditLine = await prisma.creditLine.findUnique({
            where: { id: creditLineId },
            include: { tranches: { where: { status: 'ACTIVE' } } },
        });

        if (!creditLine) {
            throw new Error('Credit line not found');
        }

        if (creditLine.tranches.length > 0) {
            throw new Error('Cannot close credit line with active tranches');
        }

        if (creditLine.utilizedAmount > 0) {
            throw new Error('Cannot close credit line with outstanding balance');
        }

        // Release all liens
        await prisma.collateral.updateMany({
            where: { creditLineId },
            data: { lienStatus: 'RELEASED' },
        });

        return prisma.creditLine.update({
            where: { id: creditLineId },
            data: { status: 'CLOSED' },
        });
    }

    /**
     * Update NAV for all collaterals (called by daily job)
     */
    async updateCollateralNAV(creditLineId: string, collateralId: string, newNav: number) {
        const collateral = await prisma.collateral.findUnique({
            where: { id: collateralId },
        });

        if (!collateral || collateral.creditLineId !== creditLineId) {
            throw new Error('Collateral not found');
        }

        const currentValue = Math.round(Number(collateral.units) * newNav);
        const eligibleAmount = Math.round(currentValue * Number(collateral.ltvApplied));

        await prisma.collateral.update({
            where: { id: collateralId },
            data: { nav: newNav, currentValue, eligibleAmount },
        });

        // Update aggregates
        await this.updateCreditLineAggregates(creditLineId);

        return collateral;
    }

    /**
     * Check LTV and create margin call if needed
     */
    async checkLtvAndCreateMarginCall(creditLineId: string) {
        const creditLine = await prisma.creditLine.findUnique({
            where: { id: creditLineId },
        });

        if (!creditLine || creditLine.status !== 'ACTIVE') {
            return null;
        }

        const currentLtv = Number(creditLine.currentLtv || 0);

        if (currentLtv >= LTV_THRESHOLDS.MARGIN_CALL) {
            // Calculate shortfall
            const targetLtv = 0.60; // Bring back to 60% LTV
            const targetOutstanding = creditLine.totalCollateralValue * targetLtv;
            const shortfallAmount = creditLine.utilizedAmount - targetOutstanding;

            const callNumber = `MC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

            const marginCall = await prisma.creditLineMarginCall.create({
                data: {
                    callNumber,
                    creditLineId,
                    triggerLtv: currentLtv,
                    currentLtv,
                    shortfallAmount: Math.round(shortfallAmount),
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    status: 'PENDING',
                },
            });

            // Freeze the credit line
            await this.freeze(creditLineId);

            return marginCall;
        }

        return null;
    }
}

export const creditLineService = new CreditLineService();
