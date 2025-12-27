export declare const marginCallService: {
    generateCallNumber(): string;
    calculateLTV(loanId: string): Promise<{
        ltv: number;
        collateralValue: number;
        outstandingAmount: number;
    }>;
    checkAllLoans(): Promise<{
        status: import(".prisma/client").$Enums.MarginCallStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        dueDate: Date;
        callNumber: string;
        triggerLtv: import("@prisma/client-runtime-utils").Decimal;
        currentLtv: import("@prisma/client-runtime-utils").Decimal;
        shortfallAmount: number;
        topUpAmount: number | null;
        resolvedAt: Date | null;
    }[]>;
    getAll(page?: number, limit?: number, status?: string): Promise<{
        marginCalls: ({
            loan: {
                loanApplication: {
                    user: {
                        name: string;
                        email: string;
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
                };
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
            };
        } & {
            status: import(".prisma/client").$Enums.MarginCallStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            loanId: string;
            dueDate: Date;
            callNumber: string;
            triggerLtv: import("@prisma/client-runtime-utils").Decimal;
            currentLtv: import("@prisma/client-runtime-utils").Decimal;
            shortfallAmount: number;
            topUpAmount: number | null;
            resolvedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getByLoanId(loanId: string): Promise<{
        status: import(".prisma/client").$Enums.MarginCallStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        dueDate: Date;
        callNumber: string;
        triggerLtv: import("@prisma/client-runtime-utils").Decimal;
        currentLtv: import("@prisma/client-runtime-utils").Decimal;
        shortfallAmount: number;
        topUpAmount: number | null;
        resolvedAt: Date | null;
    }[]>;
    resolve(id: string, topUpAmount: number): Promise<{
        status: import(".prisma/client").$Enums.MarginCallStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        dueDate: Date;
        callNumber: string;
        triggerLtv: import("@prisma/client-runtime-utils").Decimal;
        currentLtv: import("@prisma/client-runtime-utils").Decimal;
        shortfallAmount: number;
        topUpAmount: number | null;
        resolvedAt: Date | null;
    }>;
    markNotified(id: string): Promise<{
        status: import(".prisma/client").$Enums.MarginCallStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        loanId: string;
        dueDate: Date;
        callNumber: string;
        triggerLtv: import("@prisma/client-runtime-utils").Decimal;
        currentLtv: import("@prisma/client-runtime-utils").Decimal;
        shortfallAmount: number;
        topUpAmount: number | null;
        resolvedAt: Date | null;
    }>;
    getStats(): Promise<{
        pending: number;
        notified: number;
        resolved: number;
        total: number;
    }>;
    getLtvThresholds(): {
        SAFE: number;
        WARNING: number;
        MARGIN_CALL: number;
        LIQUIDATION: number;
    };
};
//# sourceMappingURL=marginCall.service.d.ts.map