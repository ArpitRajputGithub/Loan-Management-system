"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLoanProductSchema = exports.createLoanProductSchema = void 0;
const zod_1 = require("zod");
// Base schema without refinements for partial
const baseLoanProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Name must be at least 3 characters'),
    description: zod_1.z.string().optional(),
    interestRate: zod_1.z.number().min(0).max(50, 'Interest rate must be between 0 and 50'),
    processingFeePercent: zod_1.z.number().min(0).max(10),
    minAmount: zod_1.z.number().int().positive(),
    maxAmount: zod_1.z.number().int().positive(),
    minTenureMonths: zod_1.z.number().int().min(1).max(120),
    maxTenureMonths: zod_1.z.number().int().min(1).max(120),
    equityLtv: zod_1.z.number().min(0).max(1),
    debtLtv: zod_1.z.number().min(0).max(1),
});
// Create schema with validations
exports.createLoanProductSchema = baseLoanProductSchema.refine(data => data.minAmount < data.maxAmount, { message: 'minAmount must be less than maxAmount', path: ['minAmount'] }).refine(data => data.minTenureMonths <= data.maxTenureMonths, { message: 'minTenureMonths must be <= maxTenureMonths', path: ['minTenureMonths'] });
// Update schema uses partial of base
exports.updateLoanProductSchema = baseLoanProductSchema.partial();
//# sourceMappingURL=loanProducts.schema.js.map