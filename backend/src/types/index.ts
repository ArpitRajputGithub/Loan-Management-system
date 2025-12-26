// Types for the LMS API

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
}

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
    partnerId?: string;
}

// Application number format: LA-2024-00001
export interface NumberGeneratorOptions {
    prefix: string;
    year?: number;
    sequence: number;
}

// Eligibility check types
export interface EligibilityCheckRequest {
    pan: string;
    mobile: string;
}

export interface FundBreakdown {
    fundType: 'EQUITY' | 'DEBT' | 'HYBRID';
    totalValue: number;
    ltv: number;
    eligibleAmount: number;
}

export interface EligibilityCheckResponse {
    eligible: boolean;
    maxCreditLimit: number;
    breakdown: FundBreakdown[];
    availableTenures: number[];
}

// EMI Calculation
export interface EmiCalculationInput {
    principal: number;
    annualInterestRate: number;
    tenureMonths: number;
}

export interface EmiCalculationResult {
    emiAmount: number;
    totalAmount: number;
    totalInterest: number;
}
