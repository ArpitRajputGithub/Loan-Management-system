import { z } from 'zod';

// Create Tranche (Withdrawal) Schema
export const createTrancheSchema = z.object({
    amount: z.number().int().positive().min(1000),
    purpose: z.string().optional(),
});

// Pay Tranche Schema
export const payTrancheSchema = z.object({
    amount: z.number().int().positive(),
});

export type CreateTrancheInput = z.infer<typeof createTrancheSchema>;
export type PayTrancheInput = z.infer<typeof payTrancheSchema>;
