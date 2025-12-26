import { EmiCalculationInput, EmiCalculationResult } from '../types';

/**
 * Calculate EMI using standard formula:
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 * 
 * Where:
 * P = Principal loan amount
 * r = Monthly interest rate (annual rate / 12 / 100)
 * n = Tenure in months
 */
export function calculateEmi(input: EmiCalculationInput): EmiCalculationResult {
    const { principal, annualInterestRate, tenureMonths } = input;

    // Handle 0% interest case (1Fi offers no-cost EMI)
    if (annualInterestRate === 0) {
        const emiAmount = Math.ceil(principal / tenureMonths);
        return {
            emiAmount,
            totalAmount: principal,
            totalInterest: 0,
        };
    }

    // Monthly interest rate
    const monthlyRate = annualInterestRate / 12 / 100;

    // EMI formula
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)
        / (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const emiAmount = Math.ceil(emi);
    const totalAmount = emiAmount * tenureMonths;
    const totalInterest = totalAmount - principal;

    return {
        emiAmount,
        totalAmount,
        totalInterest,
    };
}

/**
 * Generate EMI schedule for a loan
 */
export function generateEmiSchedule(
    principal: number,
    annualInterestRate: number,
    tenureMonths: number,
    startDate: Date
): Array<{
    installmentNumber: number;
    dueDate: Date;
    emiAmount: number;
    principalComponent: number;
    interestComponent: number;
    outstandingAfter: number;
}> {
    const schedule = [];
    const monthlyRate = annualInterestRate / 12 / 100;
    const { emiAmount } = calculateEmi({ principal, annualInterestRate, tenureMonths });

    let outstanding = principal;

    for (let i = 1; i <= tenureMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const interestComponent = Math.round(outstanding * monthlyRate);
        const principalComponent = emiAmount - interestComponent;
        outstanding = Math.max(0, outstanding - principalComponent);

        // Last EMI adjustment to handle rounding
        if (i === tenureMonths && outstanding > 0) {
            schedule.push({
                installmentNumber: i,
                dueDate,
                emiAmount: emiAmount + outstanding,
                principalComponent: principalComponent + outstanding,
                interestComponent,
                outstandingAfter: 0,
            });
        } else {
            schedule.push({
                installmentNumber: i,
                dueDate,
                emiAmount,
                principalComponent,
                interestComponent,
                outstandingAfter: outstanding,
            });
        }
    }

    return schedule;
}
