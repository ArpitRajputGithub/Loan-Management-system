import { z } from 'zod';
export declare const createLoanApplicationSchema: z.ZodObject<{
    loanProductId: z.ZodString;
    productId: z.ZodOptional<z.ZodString>;
    requestedAmount: z.ZodNumber;
    selectedTenure: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    loanProductId: string;
    requestedAmount: number;
    selectedTenure: number;
    productId?: string | undefined;
}, {
    loanProductId: string;
    requestedAmount: number;
    selectedTenure: number;
    productId?: string | undefined;
}>;
export declare const updateLoanApplicationSchema: z.ZodObject<{
    requestedAmount: z.ZodOptional<z.ZodNumber>;
    selectedTenure: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    requestedAmount?: number | undefined;
    selectedTenure?: number | undefined;
}, {
    requestedAmount?: number | undefined;
    selectedTenure?: number | undefined;
}>;
export declare const approveLoanApplicationSchema: z.ZodObject<{
    approvedAmount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    approvedAmount: number;
}, {
    approvedAmount: number;
}>;
export declare const rejectLoanApplicationSchema: z.ZodObject<{
    rejectionReason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rejectionReason: string;
}, {
    rejectionReason: string;
}>;
export type CreateLoanApplicationInput = z.infer<typeof createLoanApplicationSchema>;
export type UpdateLoanApplicationInput = z.infer<typeof updateLoanApplicationSchema>;
export type ApproveLoanApplicationInput = z.infer<typeof approveLoanApplicationSchema>;
export type RejectLoanApplicationInput = z.infer<typeof rejectLoanApplicationSchema>;
//# sourceMappingURL=loanApplications.schema.d.ts.map