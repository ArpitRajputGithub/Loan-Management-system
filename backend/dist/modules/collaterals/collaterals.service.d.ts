import { CreateCollateralInput, UpdateNavInput } from './collaterals.schema';
/**
 * Collateral Service
 * Manages mutual fund collaterals and NAV-based valuations.
 */
export declare class CollateralService {
    /**
     * Get collaterals by loan application
     */
    findByApplication(loanApplicationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanApplicationId: string;
        loanId: string | null;
        fundName: string;
        fundType: import(".prisma/client").$Enums.FundType;
        isin: string;
        folioNumber: string | null;
        units: import("@prisma/client-runtime-utils").Decimal;
        nav: import("@prisma/client-runtime-utils").Decimal;
        pledgedValue: number;
        currentValue: number;
        ltvApplied: import("@prisma/client-runtime-utils").Decimal;
        eligibleAmount: number;
        registrar: import(".prisma/client").$Enums.Registrar;
        lienStatus: import(".prisma/client").$Enums.LienStatus;
        lienReference: string | null;
    }[]>;
    /**
     * Get collaterals by loan
     */
    findByLoan(loanId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanApplicationId: string;
        loanId: string | null;
        fundName: string;
        fundType: import(".prisma/client").$Enums.FundType;
        isin: string;
        folioNumber: string | null;
        units: import("@prisma/client-runtime-utils").Decimal;
        nav: import("@prisma/client-runtime-utils").Decimal;
        pledgedValue: number;
        currentValue: number;
        ltvApplied: import("@prisma/client-runtime-utils").Decimal;
        eligibleAmount: number;
        registrar: import(".prisma/client").$Enums.Registrar;
        lienStatus: import(".prisma/client").$Enums.LienStatus;
        lienReference: string | null;
    }[]>;
    /**
     * Get all collaterals with optional filters
     */
    findAll(filters: {
        loanApplicationId?: string;
        loanId?: string;
        lienStatus?: string;
    }): Promise<({
        loanApplication: {
            status: import(".prisma/client").$Enums.LoanApplicationStatus;
            applicationNumber: string;
        };
        loan: {
            status: import(".prisma/client").$Enums.LoanStatus;
            loanNumber: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanApplicationId: string;
        loanId: string | null;
        fundName: string;
        fundType: import(".prisma/client").$Enums.FundType;
        isin: string;
        folioNumber: string | null;
        units: import("@prisma/client-runtime-utils").Decimal;
        nav: import("@prisma/client-runtime-utils").Decimal;
        pledgedValue: number;
        currentValue: number;
        ltvApplied: import("@prisma/client-runtime-utils").Decimal;
        eligibleAmount: number;
        registrar: import(".prisma/client").$Enums.Registrar;
        lienStatus: import(".prisma/client").$Enums.LienStatus;
        lienReference: string | null;
    })[]>;
    /**
     * Add collateral to a loan application
     */
    create(input: CreateCollateralInput, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanApplicationId: string;
        loanId: string | null;
        fundName: string;
        fundType: import(".prisma/client").$Enums.FundType;
        isin: string;
        folioNumber: string | null;
        units: import("@prisma/client-runtime-utils").Decimal;
        nav: import("@prisma/client-runtime-utils").Decimal;
        pledgedValue: number;
        currentValue: number;
        ltvApplied: import("@prisma/client-runtime-utils").Decimal;
        eligibleAmount: number;
        registrar: import(".prisma/client").$Enums.Registrar;
        lienStatus: import(".prisma/client").$Enums.LienStatus;
        lienReference: string | null;
    }>;
    /**
     * Update NAV for a collateral and recalculate eligible amount
     */
    updateNav(id: string, input: UpdateNavInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanApplicationId: string;
        loanId: string | null;
        fundName: string;
        fundType: import(".prisma/client").$Enums.FundType;
        isin: string;
        folioNumber: string | null;
        units: import("@prisma/client-runtime-utils").Decimal;
        nav: import("@prisma/client-runtime-utils").Decimal;
        pledgedValue: number;
        currentValue: number;
        ltvApplied: import("@prisma/client-runtime-utils").Decimal;
        eligibleAmount: number;
        registrar: import(".prisma/client").$Enums.Registrar;
        lienStatus: import(".prisma/client").$Enums.LienStatus;
        lienReference: string | null;
    }>;
    /**
     * Request lien release (after loan closure)
     */
    requestRelease(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanApplicationId: string;
        loanId: string | null;
        fundName: string;
        fundType: import(".prisma/client").$Enums.FundType;
        isin: string;
        folioNumber: string | null;
        units: import("@prisma/client-runtime-utils").Decimal;
        nav: import("@prisma/client-runtime-utils").Decimal;
        pledgedValue: number;
        currentValue: number;
        ltvApplied: import("@prisma/client-runtime-utils").Decimal;
        eligibleAmount: number;
        registrar: import(".prisma/client").$Enums.Registrar;
        lienStatus: import(".prisma/client").$Enums.LienStatus;
        lienReference: string | null;
    }>;
    /**
     * Complete lien release (admin action)
     */
    completeRelease(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanApplicationId: string;
        loanId: string | null;
        fundName: string;
        fundType: import(".prisma/client").$Enums.FundType;
        isin: string;
        folioNumber: string | null;
        units: import("@prisma/client-runtime-utils").Decimal;
        nav: import("@prisma/client-runtime-utils").Decimal;
        pledgedValue: number;
        currentValue: number;
        ltvApplied: import("@prisma/client-runtime-utils").Decimal;
        eligibleAmount: number;
        registrar: import(".prisma/client").$Enums.Registrar;
        lienStatus: import(".prisma/client").$Enums.LienStatus;
        lienReference: string | null;
    }>;
}
export declare const collateralService: CollateralService;
//# sourceMappingURL=collaterals.service.d.ts.map