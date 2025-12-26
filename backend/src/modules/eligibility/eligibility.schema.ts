import { z } from 'zod';

/**
 * Eligibility Check Schema
 * This is 1Fi's CORE user flow - check credit limit with PAN + mobile
 */
export const eligibilityCheckSchema = z.object({
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
});

export type EligibilityCheckInput = z.infer<typeof eligibilityCheckSchema>;
