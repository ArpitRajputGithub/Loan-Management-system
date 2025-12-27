import { CreateLoanProductInput, UpdateLoanProductInput } from './loanProducts.schema';
/**
 * Loan Products Service
 * Manages loan product configurations and rules.
 */
export declare class LoanProductService {
    /**
     * Get all loan products (optionally filter by status)
     */
    findAll(includeInactive?: boolean): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.LoanProductStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        interestRate: import("@prisma/client-runtime-utils").Decimal;
        processingFeePercent: import("@prisma/client-runtime-utils").Decimal;
        minAmount: number;
        maxAmount: number;
        minTenureMonths: number;
        maxTenureMonths: number;
        equityLtv: import("@prisma/client-runtime-utils").Decimal;
        debtLtv: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    /**
     * Get a loan product by ID
     */
    findById(id: string): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.LoanProductStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        interestRate: import("@prisma/client-runtime-utils").Decimal;
        processingFeePercent: import("@prisma/client-runtime-utils").Decimal;
        minAmount: number;
        maxAmount: number;
        minTenureMonths: number;
        maxTenureMonths: number;
        equityLtv: import("@prisma/client-runtime-utils").Decimal;
        debtLtv: import("@prisma/client-runtime-utils").Decimal;
    }>;
    /**
     * Create a new loan product
     */
    create(input: CreateLoanProductInput): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.LoanProductStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        interestRate: import("@prisma/client-runtime-utils").Decimal;
        processingFeePercent: import("@prisma/client-runtime-utils").Decimal;
        minAmount: number;
        maxAmount: number;
        minTenureMonths: number;
        maxTenureMonths: number;
        equityLtv: import("@prisma/client-runtime-utils").Decimal;
        debtLtv: import("@prisma/client-runtime-utils").Decimal;
    }>;
    /**
     * Update a loan product
     */
    update(id: string, input: UpdateLoanProductInput): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.LoanProductStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        interestRate: import("@prisma/client-runtime-utils").Decimal;
        processingFeePercent: import("@prisma/client-runtime-utils").Decimal;
        minAmount: number;
        maxAmount: number;
        minTenureMonths: number;
        maxTenureMonths: number;
        equityLtv: import("@prisma/client-runtime-utils").Decimal;
        debtLtv: import("@prisma/client-runtime-utils").Decimal;
    }>;
    /**
     * Toggle product status (Active/Inactive)
     * We don't delete products - just deactivate them
     */
    toggleStatus(id: string): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.LoanProductStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        interestRate: import("@prisma/client-runtime-utils").Decimal;
        processingFeePercent: import("@prisma/client-runtime-utils").Decimal;
        minAmount: number;
        maxAmount: number;
        minTenureMonths: number;
        maxTenureMonths: number;
        equityLtv: import("@prisma/client-runtime-utils").Decimal;
        debtLtv: import("@prisma/client-runtime-utils").Decimal;
    }>;
}
export declare const loanProductService: LoanProductService;
//# sourceMappingURL=loanProducts.service.d.ts.map