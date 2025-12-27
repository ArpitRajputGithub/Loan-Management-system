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
export declare function calculateEmi(input: EmiCalculationInput): EmiCalculationResult;
/**
 * Generate EMI schedule for a loan
 */
export declare function generateEmiSchedule(principal: number, annualInterestRate: number, tenureMonths: number, startDate: Date): Array<{
    installmentNumber: number;
    dueDate: Date;
    emiAmount: number;
    principalComponent: number;
    interestComponent: number;
    outstandingAfter: number;
}>;
//# sourceMappingURL=emi.calculator.d.ts.map