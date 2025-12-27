import { z } from 'zod';
/**
 * Eligibility Check Schema
 * This is 1Fi's CORE user flow - check credit limit with PAN + mobile
 */
export declare const eligibilityCheckSchema: z.ZodObject<{
    pan: z.ZodString;
    mobile: z.ZodString;
}, "strip", z.ZodTypeAny, {
    pan: string;
    mobile: string;
}, {
    pan: string;
    mobile: string;
}>;
export type EligibilityCheckInput = z.infer<typeof eligibilityCheckSchema>;
//# sourceMappingURL=eligibility.schema.d.ts.map