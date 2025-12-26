import { z } from 'zod';

export const createCollateralSchema = z.object({
    loanApplicationId: z.string().uuid('Invalid loan application ID'),
    fundName: z.string().min(3),
    fundType: z.enum(['EQUITY', 'DEBT', 'HYBRID']),
    isin: z.string().length(12, 'ISIN must be 12 characters'),
    folioNumber: z.string().optional(),
    units: z.number().positive(),
    nav: z.number().positive(),
    registrar: z.enum(['CAMS', 'KFINTECH', 'MFCENTRAL']).default('CAMS'),
});

export const updateNavSchema = z.object({
    nav: z.number().positive('NAV must be positive'),
});

export type CreateCollateralInput = z.infer<typeof createCollateralSchema>;
export type UpdateNavInput = z.infer<typeof updateNavSchema>;
