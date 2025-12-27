import { LoanApplicationStatus } from '@prisma/client';
import { CreateLoanApplicationInput, UpdateLoanApplicationInput, ApproveLoanApplicationInput, RejectLoanApplicationInput } from './loanApplications.schema';
export declare class LoanApplicationService {
    /**
     * Get all loan applications with optional filters
     */
    findAll(filters: {
        status?: LoanApplicationStatus;
        userId?: string;
        partnerId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        applications: ({
            user: {
                name: string;
                email: string;
                id: string;
            };
            loanProduct: {
                name: string;
                id: string;
                interestRate: import("@prisma/client-runtime-utils").Decimal;
            };
            partner: {
                name: string;
                id: string;
            } | null;
            product: {
                name: string;
                id: string;
                price: number;
            } | null;
            collaterals: {
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
            }[];
        } & {
            status: import(".prisma/client").$Enums.LoanApplicationStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            loanProductId: string;
            productId: string | null;
            requestedAmount: number;
            selectedTenure: number;
            approvedAmount: number | null;
            rejectionReason: string | null;
            userId: string;
            partnerId: string | null;
            applicationNumber: string;
            createdVia: import(".prisma/client").$Enums.ApplicationSource;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Get application by ID with full details
     */
    findById(id: string): Promise<{
        user: {
            name: string;
            email: string;
            phone: string | null;
            id: string;
        };
        loanProduct: {
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
        };
        partner: {
            name: string;
            id: string;
        } | null;
        product: {
            name: string;
            status: import(".prisma/client").$Enums.ProductStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string;
            brand: string | null;
            price: number;
            imageUrl: string | null;
            availableTenures: number[];
            stockQuantity: number;
        } | null;
        collaterals: {
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
        }[];
        loan: {
            status: import(".prisma/client").$Enums.LoanStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            interestRate: import("@prisma/client-runtime-utils").Decimal;
            principal: number;
            tenureMonths: number;
            emiAmount: number;
            loanApplicationId: string;
            loanNumber: string;
            outstandingPrincipal: number;
            outstandingInterest: number;
            disbursedAt: Date;
            closedAt: Date | null;
            nextEmiDate: Date | null;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.LoanApplicationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanProductId: string;
        productId: string | null;
        requestedAmount: number;
        selectedTenure: number;
        approvedAmount: number | null;
        rejectionReason: string | null;
        userId: string;
        partnerId: string | null;
        applicationNumber: string;
        createdVia: import(".prisma/client").$Enums.ApplicationSource;
    }>;
    /**
     * Create a new loan application
     */
    create(input: CreateLoanApplicationInput, userId: string, partnerId?: string): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
        };
        loanProduct: {
            name: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            price: number;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.LoanApplicationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanProductId: string;
        productId: string | null;
        requestedAmount: number;
        selectedTenure: number;
        approvedAmount: number | null;
        rejectionReason: string | null;
        userId: string;
        partnerId: string | null;
        applicationNumber: string;
        createdVia: import(".prisma/client").$Enums.ApplicationSource;
    }>;
    /**
     * Update a draft application
     */
    update(id: string, input: UpdateLoanApplicationInput, userId: string): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
        };
        loanProduct: {
            name: string;
            id: string;
        };
    } & {
        status: import(".prisma/client").$Enums.LoanApplicationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanProductId: string;
        productId: string | null;
        requestedAmount: number;
        selectedTenure: number;
        approvedAmount: number | null;
        rejectionReason: string | null;
        userId: string;
        partnerId: string | null;
        applicationNumber: string;
        createdVia: import(".prisma/client").$Enums.ApplicationSource;
    }>;
    /**
     * Submit application for review
     */
    submit(id: string, userId: string): Promise<{
        status: import(".prisma/client").$Enums.LoanApplicationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanProductId: string;
        productId: string | null;
        requestedAmount: number;
        selectedTenure: number;
        approvedAmount: number | null;
        rejectionReason: string | null;
        userId: string;
        partnerId: string | null;
        applicationNumber: string;
        createdVia: import(".prisma/client").$Enums.ApplicationSource;
    }>;
    /**
     * Move to under review (Admin)
     */
    review(id: string): Promise<{
        status: import(".prisma/client").$Enums.LoanApplicationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanProductId: string;
        productId: string | null;
        requestedAmount: number;
        selectedTenure: number;
        approvedAmount: number | null;
        rejectionReason: string | null;
        userId: string;
        partnerId: string | null;
        applicationNumber: string;
        createdVia: import(".prisma/client").$Enums.ApplicationSource;
    }>;
    /**
     * Approve application (Admin)
     */
    approve(id: string, input: ApproveLoanApplicationInput, adminUserId?: string): Promise<{
        status: import(".prisma/client").$Enums.LoanApplicationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanProductId: string;
        productId: string | null;
        requestedAmount: number;
        selectedTenure: number;
        approvedAmount: number | null;
        rejectionReason: string | null;
        userId: string;
        partnerId: string | null;
        applicationNumber: string;
        createdVia: import(".prisma/client").$Enums.ApplicationSource;
    }>;
    /**
     * Reject application (Admin)
     */
    reject(id: string, input: RejectLoanApplicationInput, adminUserId?: string): Promise<{
        status: import(".prisma/client").$Enums.LoanApplicationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanProductId: string;
        productId: string | null;
        requestedAmount: number;
        selectedTenure: number;
        approvedAmount: number | null;
        rejectionReason: string | null;
        userId: string;
        partnerId: string | null;
        applicationNumber: string;
        createdVia: import(".prisma/client").$Enums.ApplicationSource;
    }>;
    /**
     * Disburse loan - creates Loan record and links collaterals
     */
    disburse(id: string): Promise<{
        status: import(".prisma/client").$Enums.LoanStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        interestRate: import("@prisma/client-runtime-utils").Decimal;
        principal: number;
        tenureMonths: number;
        emiAmount: number;
        loanApplicationId: string;
        loanNumber: string;
        outstandingPrincipal: number;
        outstandingInterest: number;
        disbursedAt: Date;
        closedAt: Date | null;
        nextEmiDate: Date | null;
    }>;
    /**
     * Validate state transition
     */
    private validateTransition;
}
export declare const loanApplicationService: LoanApplicationService;
//# sourceMappingURL=loanApplications.service.d.ts.map