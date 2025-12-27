import { LoanStatus } from '@prisma/client';
/**
 * Loans Service
 * Manages active loans, EMI payments, and LTV monitoring.
 */
export declare class LoanService {
    findAll(filters: {
        status?: LoanStatus;
        page?: number;
        limit?: number;
    }): Promise<{
        loans: {
            totalCollateralValue: number;
            ltvStatus: import("../../utils/ltv.calculator").LtvResult;
            loanApplication: {
                user: {
                    name: string;
                    email: string;
                    id: string;
                };
                product: {
                    name: string;
                    id: string;
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
            };
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
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        emiSchedule: {
            installmentNumber: number;
            dueDate: Date;
            emiAmount: number;
            principalComponent: number;
            interestComponent: number;
            outstandingAfter: number;
        }[];
        totalCollateralValue: number;
        ltvStatus: import("../../utils/ltv.calculator").LtvResult;
        loanApplication: {
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
        };
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
        order: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            loanId: string;
            orderNumber: string;
            quantity: number;
            shippingAddress: import("@prisma/client/runtime/client").JsonValue;
            deliveryStatus: import(".prisma/client").$Enums.DeliveryStatus;
            trackingNumber: string | null;
            estimatedDelivery: Date | null;
            deliveredAt: Date | null;
        } | null;
        transactions: {
            type: import(".prisma/client").$Enums.TransactionType;
            id: string;
            createdAt: Date;
            loanId: string;
            amount: number;
            principalComponent: number;
            interestComponent: number;
            balanceAfter: number;
            reference: string | null;
        }[];
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
    recordEmiPayment(id: string, amount: number): Promise<{
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
    closeLoan(id: string): Promise<({
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
    }) | null>;
}
export declare const loanService: LoanService;
//# sourceMappingURL=loans.service.d.ts.map