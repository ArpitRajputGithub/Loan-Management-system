"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKycSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(100),
    lastName: zod_1.z.string().min(1).max(100),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(10).max(10),
    dateOfBirth: zod_1.z.string().optional(),
    aadhaarNumber: zod_1.z.string().length(12).optional(),
    panNumber: zod_1.z.string().length(10).regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
    addressLine1: zod_1.z.string().optional(),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    pincode: zod_1.z.string().length(6).optional(),
    employmentType: zod_1.z.enum(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS']).optional(),
    monthlyIncome: zod_1.z.number().positive().optional(),
    companyName: zod_1.z.string().optional(),
    bankAccountNumber: zod_1.z.string().optional(),
    bankIfscCode: zod_1.z.string().optional(),
    bankName: zod_1.z.string().optional(),
    creditScore: zod_1.z.number().min(300).max(900).optional(),
});
exports.updateKycSchema = zod_1.z.object({
    kycStatus: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED']),
    aadhaarVerified: zod_1.z.boolean().optional(),
    panVerified: zod_1.z.boolean().optional(),
    kycRejectionReason: zod_1.z.string().optional(),
});
//# sourceMappingURL=customer.validation.js.map