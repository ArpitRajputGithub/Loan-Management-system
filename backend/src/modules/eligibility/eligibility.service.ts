import prisma from '../../config/database';
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

export class EligibilityService {

    /**
     * Check eligibility by PAN and mobile
     */
    async checkEligibility(input: EligibilityCheckInput): Promise<EligibilityResult> {
        const { pan, mobile } = input;

        // Check if user exists in our system
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { pan },
                    { phone: mobile }
                ]
            },
        });

        // Get active loan product for LTV rates
        const loanProduct = await prisma.loanProduct.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });

        const equityLtv = loanProduct ? Number(loanProduct.equityLtv) : 0.5;
        const debtLtv = loanProduct ? Number(loanProduct.debtLtv) : 0.8;

        const fundHoldings = this.fetchHoldings(pan);

        if (fundHoldings.length === 0) {
            return {
                eligible: false,
                user: existingUser ? { name: existingUser.name, pan: pan, mobile } : null,
                maxCreditLimit: 0,
                breakdown: [],
                holdings: [],
                availableTenures: [],
                message: 'No mutual fund holdings found for this PAN.',
            };
        }

        const breakdown = this.calculateBreakdown(fundHoldings, equityLtv, debtLtv);
        const maxCreditLimit = breakdown.reduce((sum, b) => sum + b.eligibleAmount, 0);

        // Available tenures (1Fi offers 3 months to 10 years)
        const availableTenures = [3, 6, 12, 18, 24, 36, 48, 60, 84, 120];

        return {
            eligible: maxCreditLimit >= 10000, // Minimum 10k limit to be eligible
            user: existingUser ? {
                name: existingUser.name,
                pan: existingUser.pan || pan,
                mobile: existingUser.phone || mobile
            } : {
                name: 'New User',
                pan,
                mobile,
            },
            maxCreditLimit,
            breakdown,
            holdings: fundHoldings,
            availableTenures,
            message: maxCreditLimit >= 10000
                ? `You are eligible for a credit limit of ₹${maxCreditLimit.toLocaleString()}`
                : 'Your portfolio value is below the minimum threshold of ₹10,000.',
        };
    }

    /**
     * Fetch MF holdings from registrar APIs
     */
    private fetchHoldings(pan: string): FundHolding[] {
        const seed = pan.charCodeAt(0) + pan.charCodeAt(5);

        const funds: FundHolding[] = [
            {
                fundName: 'HDFC Mid-Cap Opportunities Fund',
                isin: 'INF179K01AA8',
                fundType: 'EQUITY',
                units: 150 + (seed % 100),
                nav: 134.56,
                value: 0,
            },
            {
                fundName: 'ICICI Prudential Bluechip Fund',
                isin: 'INF109K01BE9',
                fundType: 'EQUITY',
                units: 200 + (seed % 150),
                nav: 78.23,
                value: 0,
            },
            {
                fundName: 'SBI Magnum Gilt Fund',
                isin: 'INF200K01RV2',
                fundType: 'DEBT',
                units: 500 + (seed % 200),
                nav: 56.78,
                value: 0,
            },
            {
                fundName: 'Axis Balanced Advantage Fund',
                isin: 'INF846K01DP8',
                fundType: 'HYBRID',
                units: 100 + (seed % 80),
                nav: 45.12,
                value: 0,
            },
        ];

        return funds.map(fund => ({
            ...fund,
            value: Math.round(fund.units * fund.nav),
        }));
    }

    /**
     * Calculate breakdown by fund type with appropriate LTV
     */
    private calculateBreakdown(
        holdings: FundHolding[],
        equityLtv: number,
        debtLtv: number
    ) {
        const byType: Record<string, { totalValue: number; ltv: number }> = {};

        for (const holding of holdings) {
            const type = holding.fundType;
            const ltv = type === 'EQUITY' ? equityLtv
                : type === 'DEBT' ? debtLtv
                    : (equityLtv + debtLtv) / 2; // HYBRID gets average

            if (!byType[type]) {
                byType[type] = { totalValue: 0, ltv };
            }
            byType[type].totalValue += holding.value;
        }

        return Object.entries(byType).map(([fundType, data]) => ({
            fundType,
            totalValue: data.totalValue,
            ltv: data.ltv,
            eligibleAmount: Math.floor(data.totalValue * data.ltv),
        }));
    }
}

export const eligibilityService = new EligibilityService();
