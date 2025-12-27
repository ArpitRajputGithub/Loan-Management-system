"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marginCallService = void 0;
const database_1 = __importDefault(require("../../config/database"));
// LTV Thresholds (can be made configurable per loan product)
const LTV_THRESHOLDS = {
    SAFE: 60,
    WARNING: 70,
    MARGIN_CALL: 75,
    LIQUIDATION: 85,
};
exports.marginCallService = {
    // Generate unique call number
    generateCallNumber() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `MC-${timestamp}-${random}`;
    },
    // Calculate current LTV for a loan
    async calculateLTV(loanId) {
        const loan = await database_1.default.loan.findUnique({
            where: { id: loanId },
            include: { collaterals: true },
        });
        if (!loan)
            throw new Error('Loan not found');
        const collateralValue = loan.collaterals.reduce((sum, c) => sum + c.currentValue, 0);
        const outstandingAmount = loan.outstandingPrincipal + loan.outstandingInterest;
        const ltv = collateralValue > 0 ? (outstandingAmount / collateralValue) * 100 : 100;
        return { ltv: Math.round(ltv * 100) / 100, collateralValue, outstandingAmount };
    },
    // Check and create margin calls for all active loans
    async checkAllLoans() {
        const activeLoans = await database_1.default.loan.findMany({
            where: { status: 'ACTIVE' },
            include: { collaterals: true },
        });
        const marginCalls = [];
        for (const loan of activeLoans) {
            const { ltv, collateralValue, outstandingAmount } = await this.calculateLTV(loan.id);
            if (ltv >= LTV_THRESHOLDS.MARGIN_CALL) {
                // Check if there's already a pending margin call
                const existingCall = await database_1.default.marginCall.findFirst({
                    where: {
                        loanId: loan.id,
                        status: { in: ['PENDING', 'NOTIFIED'] },
                    },
                });
                if (!existingCall) {
                    const shortfallAmount = Math.round(outstandingAmount - (collateralValue * LTV_THRESHOLDS.SAFE / 100));
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + 3); // 3 days to top up
                    const marginCall = await database_1.default.marginCall.create({
                        data: {
                            callNumber: this.generateCallNumber(),
                            loanId: loan.id,
                            triggerLtv: LTV_THRESHOLDS.MARGIN_CALL,
                            currentLtv: ltv,
                            shortfallAmount,
                            dueDate,
                        },
                    });
                    marginCalls.push(marginCall);
                }
            }
        }
        return marginCalls;
    },
    async getAll(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = status ? { status: status } : {};
        const [marginCalls, total] = await Promise.all([
            database_1.default.marginCall.findMany({
                where,
                include: {
                    loan: {
                        include: {
                            loanApplication: {
                                include: { user: { select: { id: true, name: true, email: true } } },
                            },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.default.marginCall.count({ where }),
        ]);
        return {
            marginCalls,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },
    async getByLoanId(loanId) {
        return database_1.default.marginCall.findMany({
            where: { loanId },
            orderBy: { createdAt: 'desc' },
        });
    },
    async resolve(id, topUpAmount) {
        return database_1.default.marginCall.update({
            where: { id },
            data: {
                status: 'TOPPED_UP',
                topUpAmount,
                resolvedAt: new Date(),
            },
        });
    },
    async markNotified(id) {
        return database_1.default.marginCall.update({
            where: { id },
            data: { status: 'NOTIFIED' },
        });
    },
    async getStats() {
        const [pending, notified, resolved, total] = await Promise.all([
            database_1.default.marginCall.count({ where: { status: 'PENDING' } }),
            database_1.default.marginCall.count({ where: { status: 'NOTIFIED' } }),
            database_1.default.marginCall.count({ where: { status: { in: ['TOPPED_UP', 'RESOLVED'] } } }),
            database_1.default.marginCall.count(),
        ]);
        return { pending, notified, resolved, total };
    },
    getLtvThresholds() {
        return LTV_THRESHOLDS;
    },
};
//# sourceMappingURL=marginCall.service.js.map