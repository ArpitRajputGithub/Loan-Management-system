"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNavSchema = exports.createCollateralSchema = void 0;
const zod_1 = require("zod");
exports.createCollateralSchema = zod_1.z.object({
    loanApplicationId: zod_1.z.string().uuid('Invalid loan application ID'),
    fundName: zod_1.z.string().min(3),
    fundType: zod_1.z.enum(['EQUITY', 'DEBT', 'HYBRID']),
    isin: zod_1.z.string().length(12, 'ISIN must be 12 characters'),
    folioNumber: zod_1.z.string().optional(),
    units: zod_1.z.number().positive(),
    nav: zod_1.z.number().positive(),
    registrar: zod_1.z.enum(['CAMS', 'KFINTECH', 'MFCENTRAL']).default('CAMS'),
});
exports.updateNavSchema = zod_1.z.object({
    nav: zod_1.z.number().positive('NAV must be positive'),
});
//# sourceMappingURL=collaterals.schema.js.map