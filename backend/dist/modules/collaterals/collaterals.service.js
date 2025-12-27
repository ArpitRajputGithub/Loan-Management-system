"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collateralService = exports.CollateralService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const ltv_calculator_1 = require("../../utils/ltv.calculator");
/**
 * Collateral Service
 * Manages mutual fund collaterals and NAV-based valuations.
 */
class CollateralService {
    /**
     * Get collaterals by loan application
     */
    async findByApplication(loanApplicationId) {
        return database_1.default.collateral.findMany({
            where: { loanApplicationId },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Get collaterals by loan
     */
    async findByLoan(loanId) {
        return database_1.default.collateral.findMany({
            where: { loanId },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Get all collaterals with optional filters
     */
    async findAll(filters) {
        const where = {};
        if (filters.loanApplicationId)
            where.loanApplicationId = filters.loanApplicationId;
        if (filters.loanId)
            where.loanId = filters.loanId;
        if (filters.lienStatus)
            where.lienStatus = filters.lienStatus;
        return database_1.default.collateral.findMany({
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
    async create(input, userId) {
        // Verify application exists and belongs to user
        const application = await database_1.default.loanApplication.findUnique({
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
        const eligibleAmount = (0, ltv_calculator_1.calculateEligibleAmount)(currentValue, ltv);
        return database_1.default.collateral.create({
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
    async updateNav(id, input) {
        const collateral = await database_1.default.collateral.findUnique({
            where: { id },
        });
        if (!collateral) {
            throw new Error('Collateral not found');
        }
        // Calculate new current value
        const currentValue = Math.round(Number(collateral.units) * input.nav);
        const eligibleAmount = (0, ltv_calculator_1.calculateEligibleAmount)(currentValue, Number(collateral.ltvApplied));
        return database_1.default.collateral.update({
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
    async requestRelease(id) {
        const collateral = await database_1.default.collateral.findUnique({
            where: { id },
            include: { loan: true },
        });
        if (!collateral) {
            throw new Error('Collateral not found');
        }
        if (!collateral.loan || collateral.loan.status !== 'CLOSED') {
            throw new Error('Can only release collateral for closed loans');
        }
        return database_1.default.collateral.update({
            where: { id },
            data: { lienStatus: 'RELEASE_REQUESTED' },
        });
    }
    /**
     * Complete lien release (admin action)
     */
    async completeRelease(id) {
        const collateral = await database_1.default.collateral.findUnique({
            where: { id },
        });
        if (!collateral) {
            throw new Error('Collateral not found');
        }
        if (collateral.lienStatus !== 'RELEASE_REQUESTED') {
            throw new Error('Release must be requested first');
        }
        return database_1.default.collateral.update({
            where: { id },
            data: { lienStatus: 'RELEASED' },
        });
    }
}
exports.CollateralService = CollateralService;
exports.collateralService = new CollateralService();
//# sourceMappingURL=collaterals.service.js.map