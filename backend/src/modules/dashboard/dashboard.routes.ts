import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import prisma from '../../config/database';
import { calculateLtv } from '../../utils/ltv.calculator';

const router = Router();

router.use(authenticate);

/**
 * GET /api/v1/dashboard/stats
 * Returns aggregated metrics for NBFC operations dashboard.
 */
router.get('/stats', authorize('ADMIN'), async (req, res, next) => {
    try {
        // Get aggregate statistics
        const [
            applicationStats,
            loanStats,
            activeLoans,
            totalDisbursed,
            recentApplications,
        ] = await Promise.all([
            // Application counts by status
            prisma.loanApplication.groupBy({
                by: ['status'],
                _count: { id: true },
            }),

            // Loan counts by status
            prisma.loan.groupBy({
                by: ['status'],
                _count: { id: true },
            }),

            // Active loans with collateral for LTV calculation
            prisma.loan.findMany({
                where: { status: 'ACTIVE' },
                include: { collaterals: true },
            }),

            // Total disbursed amount
            prisma.loan.aggregate({
                _sum: { principal: true },
            }),

            // Recent applications
            prisma.loanApplication.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true } },
                    loanProduct: { select: { name: true } },
                },
            }),
        ]);

        // Calculate at-risk loans (LTV > 75%)
        const atRiskLoans = activeLoans.filter(loan => {
            const collateralValue = loan.collaterals.reduce((sum, c) => sum + c.currentValue, 0);
            const ltv = calculateLtv({
                currentCollateralValue: collateralValue,
                outstandingAmount: loan.outstandingPrincipal + loan.outstandingInterest,
            });
            return ltv.status !== 'SAFE';
        });

        // Total AUM (collateral value under management)
        const totalAum = await prisma.collateral.aggregate({
            where: { lienStatus: 'MARKED' },
            _sum: { currentValue: true },
        });

        res.json({
            success: true,
            data: {
                applications: {
                    byStatus: applicationStats.reduce((acc, s) => {
                        acc[s.status] = s._count.id;
                        return acc;
                    }, {} as Record<string, number>),
                },
                loans: {
                    byStatus: loanStats.reduce((acc, s) => {
                        acc[s.status] = s._count.id;
                        return acc;
                    }, {} as Record<string, number>),
                    activeCount: activeLoans.length,
                    atRiskCount: atRiskLoans.length,
                    totalDisbursed: totalDisbursed._sum.principal || 0,
                },
                aum: totalAum._sum.currentValue || 0,
                recentApplications,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
