import { z } from 'zod';

// Holding schema for pledging mutual funds
const holdingSchema = z.object({
    fundName: z.string().min(1),
    fundType: z.enum(['EQUITY', 'DEBT', 'HYBRID']),
    isin: z.string().min(10).max(12),
    folioNumber: z.string().optional(),
    units: z.number().positive(),
    nav: z.number().positive(),
    registrar: z.enum(['CAMS', 'KFINTECH', 'MFCENTRAL']).optional(),
});

// Create Credit Line Schema - with holdings to pledge
export const createCreditLineSchema = z.object({
    interestRate: z.number().min(0).max(30),
    holdings: z.array(holdingSchema).min(1, 'At least one holding must be pledged'),
});

// Activate Credit Line Schema
export const activateCreditLineSchema = z.object({
    // No additional fields needed, just the ID from params
});

// Add Collateral to Credit Line Schema (for adding more later)
export const addCollateralSchema = z.object({
    fundName: z.string().min(1),
    fundType: z.enum(['EQUITY', 'DEBT', 'HYBRID']),
    isin: z.string().min(10).max(12),
    folioNumber: z.string().optional(),
    units: z.number().positive(),
    nav: z.number().positive(),
    registrar: z.enum(['CAMS', 'KFINTECH', 'MFCENTRAL']).optional(),
});

// Update CreditLine LTV thresholds (for admin)
export const updateLtvThresholdsSchema = z.object({
    warningThreshold: z.number().min(0).max(1).optional(),
    marginCallThreshold: z.number().min(0).max(1).optional(),
    liquidationThreshold: z.number().min(0).max(1).optional(),
});

export type HoldingInput = z.infer<typeof holdingSchema>;
export type CreateCreditLineInput = z.infer<typeof createCreditLineSchema>;
export type AddCollateralInput = z.infer<typeof addCollateralSchema>;

