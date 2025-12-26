// LTV Calculator utilities for LAMF risk management

/**
 * LTV (Loan-to-Value) Calculator
 * Used for risk monitoring and margin call detection.
 */

export interface LtvCalculationInput {
    currentCollateralValue: number;
    outstandingAmount: number;
}

export interface LtvResult {
    currentLtv: number;  // As decimal e.g., 0.65 = 65%
    isHealthy: boolean;
    status: 'SAFE' | 'WARNING' | 'CRITICAL';
    marginCallRequired: boolean;
}

// LTV thresholds
const LTV_WARNING_THRESHOLD = 0.75;  // 75%
const LTV_CRITICAL_THRESHOLD = 0.90; // 90%

/**
 * Calculate current LTV and determine health status
 */
export function calculateLtv(input: LtvCalculationInput): LtvResult {
    const { currentCollateralValue, outstandingAmount } = input;

    // Handle edge cases
    if (currentCollateralValue === 0) {
        return {
            currentLtv: 1,
            isHealthy: false,
            status: 'CRITICAL',
            marginCallRequired: true,
        };
    }

    if (outstandingAmount === 0) {
        return {
            currentLtv: 0,
            isHealthy: true,
            status: 'SAFE',
            marginCallRequired: false,
        };
    }

    const currentLtv = outstandingAmount / currentCollateralValue;

    let status: 'SAFE' | 'WARNING' | 'CRITICAL';
    let marginCallRequired = false;

    if (currentLtv >= LTV_CRITICAL_THRESHOLD) {
        status = 'CRITICAL';
        marginCallRequired = true;
    } else if (currentLtv >= LTV_WARNING_THRESHOLD) {
        status = 'WARNING';
        marginCallRequired = false;
    } else {
        status = 'SAFE';
    }

    return {
        currentLtv: Math.round(currentLtv * 10000) / 10000, // 4 decimal places
        isHealthy: status === 'SAFE',
        status,
        marginCallRequired,
    };
}

/**
 * Calculate eligible loan amount based on collateral and LTV
 */
export function calculateEligibleAmount(
    collateralValue: number,
    ltvRatio: number | { toString(): string }
): number {
    const ltv = typeof ltvRatio === 'number' ? ltvRatio : Number(ltvRatio);
    return Math.floor(collateralValue * ltv);
}

/**
 * Calculate amount needed to restore healthy LTV
 */
export function calculateMarginCallAmount(
    currentCollateralValue: number,
    outstandingAmount: number,
    targetLtv: number = 0.70 // Target 70% after margin call
): number {
    const targetOutstanding = currentCollateralValue * targetLtv;
    const shortfall = outstandingAmount - targetOutstanding;

    return Math.max(0, Math.ceil(shortfall));
}
