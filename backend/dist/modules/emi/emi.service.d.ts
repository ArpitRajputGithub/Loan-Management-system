interface EMIBreakdown {
    installmentNo: number;
    dueDate: Date;
    emiAmount: number;
    principalAmount: number;
    interestAmount: number;
    openingBalance: number;
    closingBalance: number;
}
export declare const emiService: {
    calculateEMI(principal: number, annualRate: number, tenureMonths: number): number;
    generateSchedule(principal: number, annualRate: number, tenureMonths: number, disbursedAt: Date): EMIBreakdown[];
    createScheduleForLoan(loanId: string): Promise<{
        status: import(".prisma/client").$Enums.EmiStatus;
        id: string;
        createdAt: Date;
        emiAmount: number;
        loanId: string;
        installmentNo: number;
        dueDate: Date;
        principalAmount: number;
        interestAmount: number;
        paidAmount: number;
        paidAt: Date | null;
    }[]>;
    getScheduleByLoanId(loanId: string): Promise<{
        status: import(".prisma/client").$Enums.EmiStatus;
        id: string;
        createdAt: Date;
        emiAmount: number;
        loanId: string;
        installmentNo: number;
        dueDate: Date;
        principalAmount: number;
        interestAmount: number;
        paidAmount: number;
        paidAt: Date | null;
    }[]>;
    markEmiAsPaid(emiId: string, paidAmount: number): Promise<{
        status: import(".prisma/client").$Enums.EmiStatus;
        id: string;
        createdAt: Date;
        emiAmount: number;
        loanId: string;
        installmentNo: number;
        dueDate: Date;
        principalAmount: number;
        interestAmount: number;
        paidAmount: number;
        paidAt: Date | null;
    }>;
    updateOverdueEmis(): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getEmiSummary(loanId: string): Promise<{
        paid: number;
        pending: number;
        overdue: number;
        totalPaid: number;
        totalDue: number;
        schedule: {
            status: import(".prisma/client").$Enums.EmiStatus;
            id: string;
            createdAt: Date;
            emiAmount: number;
            loanId: string;
            installmentNo: number;
            dueDate: Date;
            principalAmount: number;
            interestAmount: number;
            paidAmount: number;
            paidAt: Date | null;
        }[];
    }>;
};
export {};
//# sourceMappingURL=emi.service.d.ts.map