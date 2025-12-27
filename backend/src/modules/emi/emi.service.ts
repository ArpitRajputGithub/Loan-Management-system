import prisma from '../../config/database';
import { EMISchedule } from '@prisma/client';

interface EMIBreakdown {
    installmentNo: number;
    dueDate: Date;
    emiAmount: number;
    principalAmount: number;
    interestAmount: number;
    openingBalance: number;
    closingBalance: number;
}

export const emiService = {
    // Calculate EMI using reducing balance method
    calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
        const monthlyRate = annualRate / 100 / 12;
        if (monthlyRate === 0) return Math.round(principal / tenureMonths);

        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)
            / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        return Math.round(emi);
    },

    // Generate full EMI schedule for a loan
    generateSchedule(
        principal: number,
        annualRate: number,
        tenureMonths: number,
        disbursedAt: Date
    ): EMIBreakdown[] {
        const monthlyRate = annualRate / 100 / 12;
        const emiAmount = this.calculateEMI(principal, annualRate, tenureMonths);

        const schedule: EMIBreakdown[] = [];
        let openingBalance = principal;

        for (let i = 1; i <= tenureMonths; i++) {
            const dueDate = new Date(disbursedAt);
            dueDate.setMonth(dueDate.getMonth() + i);

            const interestAmount = Math.round(openingBalance * monthlyRate);
            const principalAmount = emiAmount - interestAmount;
            const closingBalance = Math.max(0, openingBalance - principalAmount);

            schedule.push({
                installmentNo: i,
                dueDate,
                emiAmount,
                principalAmount,
                interestAmount,
                openingBalance,
                closingBalance,
            });

            openingBalance = closingBalance;
        }

        return schedule;
    },

    // Create EMI schedule in database when loan is disbursed
    async createScheduleForLoan(loanId: string) {
        const loan = await prisma.loan.findUnique({
            where: { id: loanId },
            include: { loanApplication: true },
        });

        if (!loan) throw new Error('Loan not found');

        const schedule = this.generateSchedule(
            loan.principal,
            Number(loan.interestRate),
            loan.tenureMonths,
            loan.disbursedAt
        );

        await prisma.eMISchedule.createMany({
            data: schedule.map(item => ({
                loanId,
                installmentNo: item.installmentNo,
                dueDate: item.dueDate,
                emiAmount: item.emiAmount,
                principalAmount: item.principalAmount,
                interestAmount: item.interestAmount,
            })),
        });

        return this.getScheduleByLoanId(loanId);
    },

    async getScheduleByLoanId(loanId: string) {
        return prisma.eMISchedule.findMany({
            where: { loanId },
            orderBy: { installmentNo: 'asc' },
        });
    },

    async markEmiAsPaid(emiId: string, paidAmount: number) {
        const emi = await prisma.eMISchedule.findUnique({ where: { id: emiId } });
        if (!emi) throw new Error('EMI not found');

        const totalPaid = emi.paidAmount + paidAmount;
        const status = totalPaid >= emi.emiAmount ? 'PAID' : 'PARTIALLY_PAID';

        return prisma.eMISchedule.update({
            where: { id: emiId },
            data: {
                paidAmount: totalPaid,
                status,
                paidAt: status === 'PAID' ? new Date() : null,
            },
        });
    },

    // Check and update overdue EMIs
    async updateOverdueEmis() {
        const today = new Date();

        return prisma.eMISchedule.updateMany({
            where: {
                dueDate: { lt: today },
                status: 'PENDING',
            },
            data: { status: 'OVERDUE' },
        });
    },

    async getEmiSummary(loanId: string) {
        const schedule = await this.getScheduleByLoanId(loanId);

        const paid = schedule.filter((e: EMISchedule) => e.status === 'PAID').length;
        const pending = schedule.filter((e: EMISchedule) => e.status === 'PENDING').length;
        const overdue = schedule.filter((e: EMISchedule) => e.status === 'OVERDUE').length;
        const totalPaid = schedule.reduce((sum: number, e: EMISchedule) => sum + e.paidAmount, 0);
        const totalDue = schedule.reduce((sum: number, e: EMISchedule) => sum + e.emiAmount, 0);

        return { paid, pending, overdue, totalPaid, totalDue, schedule };
    },
};
