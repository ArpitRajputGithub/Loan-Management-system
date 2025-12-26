import { z } from 'zod';

// Base schema without refinements for partial
const baseLoanProductSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    interestRate: z.number().min(0).max(50, 'Interest rate must be between 0 and 50'),
    processingFeePercent: z.number().min(0).max(10),
    minAmount: z.number().int().positive(),
    maxAmount: z.number().int().positive(),
    minTenureMonths: z.number().int().min(1).max(120),
    maxTenureMonths: z.number().int().min(1).max(120),
    equityLtv: z.number().min(0).max(1),
    debtLtv: z.number().min(0).max(1),
});

// Create schema with validations
export const createLoanProductSchema = baseLoanProductSchema.refine(
    data => data.minAmount < data.maxAmount,
    { message: 'minAmount must be less than maxAmount', path: ['minAmount'] }
).refine(
    data => data.minTenureMonths <= data.maxTenureMonths,
    { message: 'minTenureMonths must be <= maxTenureMonths', path: ['minTenureMonths'] }
);

// Update schema uses partial of base
export const updateLoanProductSchema = baseLoanProductSchema.partial();

export type CreateLoanProductInput = z.infer<typeof createLoanProductSchema>;
export type UpdateLoanProductInput = z.infer<typeof updateLoanProductSchema>;
