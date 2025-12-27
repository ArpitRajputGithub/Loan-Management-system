"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emiService = void 0;
const database_1 = __importDefault(require("../../config/database"));
exports.emiService = {
    // Calculate EMI using reducing balance method
    calculateEMI(principal, annualRate, tenureMonths) {
        const monthlyRate = annualRate / 100 / 12;
        if (monthlyRate === 0)
            return Math.round(principal / tenureMonths);
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)
            / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        return Math.round(emi);
    },
    // Generate full EMI schedule for a loan
    generateSchedule(principal, annualRate, tenureMonths, disbursedAt) {
        const monthlyRate = annualRate / 100 / 12;
        const emiAmount = this.calculateEMI(principal, annualRate, tenureMonths);
        const schedule = [];
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
    async createScheduleForLoan(loanId) {
        const loan = await database_1.default.loan.findUnique({
            where: { id: loanId },
            include: { loanApplication: true },
        });
        if (!loan)
            throw new Error('Loan not found');
        const schedule = this.generateSchedule(loan.principal, Number(loan.interestRate), loan.tenureMonths, loan.disbursedAt);
        await database_1.default.eMISchedule.createMany({
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
    async getScheduleByLoanId(loanId) {
        return database_1.default.eMISchedule.findMany({
            where: { loanId },
            orderBy: { installmentNo: 'asc' },
        });
    },
    async markEmiAsPaid(emiId, paidAmount) {
        const emi = await database_1.default.eMISchedule.findUnique({ where: { id: emiId } });
        if (!emi)
            throw new Error('EMI not found');
        const totalPaid = emi.paidAmount + paidAmount;
        const status = totalPaid >= emi.emiAmount ? 'PAID' : 'PARTIALLY_PAID';
        return database_1.default.eMISchedule.update({
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
        return database_1.default.eMISchedule.updateMany({
            where: {
                dueDate: { lt: today },
                status: 'PENDING',
            },
            data: { status: 'OVERDUE' },
        });
    },
    async getEmiSummary(loanId) {
        const schedule = await this.getScheduleByLoanId(loanId);
        const paid = schedule.filter((e) => e.status === 'PAID').length;
        const pending = schedule.filter((e) => e.status === 'PENDING').length;
        const overdue = schedule.filter((e) => e.status === 'OVERDUE').length;
        const totalPaid = schedule.reduce((sum, e) => sum + e.paidAmount, 0);
        const totalDue = schedule.reduce((sum, e) => sum + e.emiAmount, 0);
        return { paid, pending, overdue, totalPaid, totalDue, schedule };
    },
};
//# sourceMappingURL=emi.service.js.map