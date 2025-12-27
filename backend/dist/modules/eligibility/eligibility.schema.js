"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eligibilityCheckSchema = void 0;
const zod_1 = require("zod");
/**
 * Eligibility Check Schema
 * This is 1Fi's CORE user flow - check credit limit with PAN + mobile
 */
exports.eligibilityCheckSchema = zod_1.z.object({
    pan: zod_1.z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
    mobile: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
});
//# sourceMappingURL=eligibility.schema.js.map