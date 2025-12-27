"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const database_1 = __importDefault(require("../../config/database"));
const ltv_calculator_1 = require("../../utils/ltv.calculator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * GET /api/v1/dashboard/stats
 * Returns aggregated metrics for NBFC operations dashboard.
 */
router.get('/stats', (0, auth_middleware_1.authorize)('ADMIN'), async (req, res, next) => {
    try {
        // Get aggregate statistics
        const [applicationStats, loanStats, activeLoans, totalDisbursed, recentApplications,] = await Promise.all([
            // Application counts by status
            database_1.default.loanApplication.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
            // Loan counts by status
            database_1.default.loan.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
            // Active loans with collateral for LTV calculation
            database_1.default.loan.findMany({
                where: { status: 'ACTIVE' },
                include: { collaterals: true },
            }),
            // Total disbursed amount
            database_1.default.loan.aggregate({
                _sum: { principal: true },
            }),
            // Recent applications
            database_1.default.loanApplication.findMany({
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
            const ltv = (0, ltv_calculator_1.calculateLtv)({
                currentCollateralValue: collateralValue,
                outstandingAmount: loan.outstandingPrincipal + loan.outstandingInterest,
            });
            return ltv.status !== 'SAFE';
        });
        // Total AUM (collateral value under management)
        const totalAum = await database_1.default.collateral.aggregate({
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
                    }, {}),
                },
                loans: {
                    byStatus: loanStats.reduce((acc, s) => {
                        acc[s.status] = s._count.id;
                        return acc;
                    }, {}),
                    activeCount: activeLoans.length,
                    atRiskCount: atRiskLoans.length,
                    totalDisbursed: totalDisbursed._sum.principal || 0,
                },
                aum: totalAum._sum.currentValue || 0,
                recentApplications,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map