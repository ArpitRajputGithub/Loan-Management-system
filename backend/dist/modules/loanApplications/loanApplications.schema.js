"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectLoanApplicationSchema = exports.approveLoanApplicationSchema = exports.updateLoanApplicationSchema = exports.createLoanApplicationSchema = void 0;
const zod_1 = require("zod");
exports.createLoanApplicationSchema = zod_1.z.object({
    loanProductId: zod_1.z.string().uuid('Invalid loan product ID'),
    productId: zod_1.z.string().uuid('Invalid product ID').optional(), // 1Fi shopping product
    requestedAmount: zod_1.z.number().int().positive('Amount must be positive'),
    selectedTenure: zod_1.z.number().int().min(1).max(120, 'Tenure must be 1-120 months'),
});
exports.updateLoanApplicationSchema = zod_1.z.object({
    requestedAmount: zod_1.z.number().int().positive().optional(),
    selectedTenure: zod_1.z.number().int().min(1).max(120).optional(),
});
exports.approveLoanApplicationSchema = zod_1.z.object({
    approvedAmount: zod_1.z.number().int().positive('Approved amount must be positive'),
});
exports.rejectLoanApplicationSchema = zod_1.z.object({
    rejectionReason: zod_1.z.string().min(10, 'Please provide a detailed rejection reason'),
});
//# sourceMappingURL=loanApplications.schema.js.map