import { EligibilityCheckInput } from './eligibility.schema';
/**
 * Eligibility Service
 * Calculates credit limit eligibility based on mutual fund holdings.
 */
interface FundHolding {
    fundName: string;
    isin: string;
    fundType: 'EQUITY' | 'DEBT' | 'HYBRID';
    units: number;
    nav: number;
    value: number;
}
interface EligibilityResult {
    eligible: boolean;
    user: {
        name: string;
        pan: string;
        mobile: string;
    } | null;
    maxCreditLimit: number;
    breakdown: {
        fundType: string;
        totalValue: number;
        ltv: number;
        eligibleAmount: number;
    }[];
    holdings: FundHolding[];
    availableTenures: number[];
    message: string;
}
export declare class EligibilityService {
    /**
     * Check eligibility by PAN and mobile
     */
    checkEligibility(input: EligibilityCheckInput): Promise<EligibilityResult>;
    /**
     * Fetch MF holdings from registrar APIs
     */
    private fetchHoldings;
    /**
     * Calculate breakdown by fund type with appropriate LTV
     */
    private calculateBreakdown;
}
export declare const eligibilityService: EligibilityService;
export {};
//# sourceMappingURL=eligibility.service.d.ts.map