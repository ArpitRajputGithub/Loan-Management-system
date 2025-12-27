"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanProductService = exports.LoanProductService = void 0;
const database_1 = __importDefault(require("../../config/database"));
/**
 * Loan Products Service
 * Manages loan product configurations and rules.
 */
class LoanProductService {
    /**
     * Get all loan products (optionally filter by status)
     */
    async findAll(includeInactive = false) {
        return database_1.default.loanProduct.findMany({
            where: includeInactive ? {} : { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Get a loan product by ID
     */
    async findById(id) {
        const product = await database_1.default.loanProduct.findUnique({
            where: { id },
        });
        if (!product) {
            throw new Error('Loan product not found');
        }
        return product;
    }
    /**
     * Create a new loan product
     */
    async create(input) {
        return database_1.default.loanProduct.create({
            data: {
                name: input.name,
                description: input.description,
                interestRate: input.interestRate,
                processingFeePercent: input.processingFeePercent,
                minAmount: input.minAmount,
                maxAmount: input.maxAmount,
                minTenureMonths: input.minTenureMonths,
                maxTenureMonths: input.maxTenureMonths,
                equityLtv: input.equityLtv,
                debtLtv: input.debtLtv,
            },
        });
    }
    /**
     * Update a loan product
     */
    async update(id, input) {
        // Check if product exists
        await this.findById(id);
        return database_1.default.loanProduct.update({
            where: { id },
            data: input,
        });
    }
    /**
     * Toggle product status (Active/Inactive)
     * We don't delete products - just deactivate them
     */
    async toggleStatus(id) {
        const product = await this.findById(id);
        return database_1.default.loanProduct.update({
            where: { id },
            data: {
                status: product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            },
        });
    }
}
exports.LoanProductService = LoanProductService;
exports.loanProductService = new LoanProductService();
//# sourceMappingURL=loanProducts.service.js.map