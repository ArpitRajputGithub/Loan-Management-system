/**
 * LTV (Loan-to-Value) Calculator
 * Used for risk monitoring and margin call detection.
 */
export interface LtvCalculationInput {
    currentCollateralValue: number;
    outstandingAmount: number;
}
export interface LtvResult {
    currentLtv: number;
    isHealthy: boolean;
    status: 'SAFE' | 'WARNING' | 'CRITICAL';
    marginCallRequired: boolean;
}
/**
 * Calculate current LTV and determine health status
 */
export declare function calculateLtv(input: LtvCalculationInput): LtvResult;
/**
 * Calculate eligible loan amount based on collateral and LTV
 */
export declare function calculateEligibleAmount(collateralValue: number, ltvRatio: number | {
    toString(): string;
}): number;
/**
 * Calculate amount needed to restore healthy LTV
 */
export declare function calculateMarginCallAmount(currentCollateralValue: number, outstandingAmount: number, targetLtv?: number): number;
//# sourceMappingURL=ltv.calculator.d.ts.map