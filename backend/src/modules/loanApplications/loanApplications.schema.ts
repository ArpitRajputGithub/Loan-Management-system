import { z } from 'zod';

export const createLoanApplicationSchema = z.object({
    loanProductId: z.string().uuid('Invalid loan product ID'),
    productId: z.string().uuid('Invalid product ID').optional(), // 1Fi shopping product
    requestedAmount: z.number().int().positive('Amount must be positive'),
    selectedTenure: z.number().int().min(1).max(120, 'Tenure must be 1-120 months'),
});

export const updateLoanApplicationSchema = z.object({
    requestedAmount: z.number().int().positive().optional(),
    selectedTenure: z.number().int().min(1).max(120).optional(),
});

export const approveLoanApplicationSchema = z.object({
    approvedAmount: z.number().int().positive('Approved amount must be positive'),
});

export const rejectLoanApplicationSchema = z.object({
    rejectionReason: z.string().min(10, 'Please provide a detailed rejection reason'),
});

export type CreateLoanApplicationInput = z.infer<typeof createLoanApplicationSchema>;
export type UpdateLoanApplicationInput = z.infer<typeof updateLoanApplicationSchema>;
export type ApproveLoanApplicationInput = z.infer<typeof approveLoanApplicationSchema>;
export type RejectLoanApplicationInput = z.infer<typeof rejectLoanApplicationSchema>;
