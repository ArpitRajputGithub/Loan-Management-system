import { z } from 'zod';
export declare const createLoanProductSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    interestRate: z.ZodNumber;
    processingFeePercent: z.ZodNumber;
    minAmount: z.ZodNumber;
    maxAmount: z.ZodNumber;
    minTenureMonths: z.ZodNumber;
    maxTenureMonths: z.ZodNumber;
    equityLtv: z.ZodNumber;
    debtLtv: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    interestRate: number;
    processingFeePercent: number;
    minAmount: number;
    maxAmount: number;
    minTenureMonths: number;
    maxTenureMonths: number;
    equityLtv: number;
    debtLtv: number;
    description?: string | undefined;
}, {
    name: string;
    interestRate: number;
    processingFeePercent: number;
    minAmount: number;
    maxAmount: number;
    minTenureMonths: number;
    maxTenureMonths: number;
    equityLtv: number;
    debtLtv: number;
    description?: string | undefined;
}>, {
    name: string;
    interestRate: number;
    processingFeePercent: number;
    minAmount: number;
    maxAmount: number;
    minTenureMonths: number;
    maxTenureMonths: number;
    equityLtv: number;
    debtLtv: number;
    description?: string | undefined;
}, {
    name: string;
    interestRate: number;
    processingFeePercent: number;
    minAmount: number;
    maxAmount: number;
    minTenureMonths: number;
    maxTenureMonths: number;
    equityLtv: number;
    debtLtv: number;
    description?: string | undefined;
}>, {
    name: string;
    interestRate: number;
    processingFeePercent: number;
    minAmount: number;
    maxAmount: number;
    minTenureMonths: number;
    maxTenureMonths: number;
    equityLtv: number;
    debtLtv: number;
    description?: string | undefined;
}, {
    name: string;
    interestRate: number;
    processingFeePercent: number;
    minAmount: number;
    maxAmount: number;
    minTenureMonths: number;
    maxTenureMonths: number;
    equityLtv: number;
    debtLtv: number;
    description?: string | undefined;
}>;
export declare const updateLoanProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    interestRate: z.ZodOptional<z.ZodNumber>;
    processingFeePercent: z.ZodOptional<z.ZodNumber>;
    minAmount: z.ZodOptional<z.ZodNumber>;
    maxAmount: z.ZodOptional<z.ZodNumber>;
    minTenureMonths: z.ZodOptional<z.ZodNumber>;
    maxTenureMonths: z.ZodOptional<z.ZodNumber>;
    equityLtv: z.ZodOptional<z.ZodNumber>;
    debtLtv: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    interestRate?: number | undefined;
    processingFeePercent?: number | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    minTenureMonths?: number | undefined;
    maxTenureMonths?: number | undefined;
    equityLtv?: number | undefined;
    debtLtv?: number | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    interestRate?: number | undefined;
    processingFeePercent?: number | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    minTenureMonths?: number | undefined;
    maxTenureMonths?: number | undefined;
    equityLtv?: number | undefined;
    debtLtv?: number | undefined;
}>;
export type CreateLoanProductInput = z.infer<typeof createLoanProductSchema>;
export type UpdateLoanProductInput = z.infer<typeof updateLoanProductSchema>;
//# sourceMappingURL=loanProducts.schema.d.ts.map