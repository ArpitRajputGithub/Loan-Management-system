import { z } from 'zod';

export const createCustomerSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(10),
    dateOfBirth: z.string().optional(),
    aadhaarNumber: z.string().length(12).optional(),
    panNumber: z.string().length(10).regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().length(6).optional(),
    employmentType: z.enum(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS']).optional(),
    monthlyIncome: z.number().positive().optional(),
    companyName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankIfscCode: z.string().optional(),
    bankName: z.string().optional(),
    creditScore: z.number().min(300).max(900).optional(),
});

export const updateKycSchema = z.object({
    kycStatus: z.enum(['PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED']),
    aadhaarVerified: z.boolean().optional(),
    panVerified: z.boolean().optional(),
    kycRejectionReason: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateKycInput = z.infer<typeof updateKycSchema>;
