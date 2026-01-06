const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class ApiClient {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const token = this.getToken();
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        return response.json();
    }

    // Auth
    async login(email: string, password: string) {
        const res = await this.request<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (res.success && res.data?.token) {
            this.setToken(res.data.token);
        }
        return res;
    }

    async register(data: { name: string; email: string; password: string; phone?: string; pan?: string }) {
        return this.request<{ user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getCurrentUser() {
        return this.request<any>('/auth/me');
    }

    // Eligibility
    async checkEligibility(pan: string, mobile: string) {
        return this.request<any>('/eligibility/check', {
            method: 'POST',
            body: JSON.stringify({ pan, mobile }),
        });
    }

    // Loan Products
    async getLoanProducts() {
        return this.request<any[]>('/loan-products');
    }

    async getLoanProduct(id: string) {
        return this.request<any>(`/loan-products/${id}`);
    }

    async createLoanProduct(data: {
        name: string;
        description?: string;
        interestRate: number;
        processingFeePercent: number;
        minAmount: number;
        maxAmount: number;
        minTenureMonths: number;
        maxTenureMonths: number;
        equityLtv: number;
        debtLtv: number;
    }) {
        return this.request<any>('/loan-products', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateLoanProduct(id: string, data: Partial<{
        name: string;
        description: string;
        interestRate: number;
        processingFeePercent: number;
        minAmount: number;
        maxAmount: number;
        minTenureMonths: number;
        maxTenureMonths: number;
        equityLtv: number;
        debtLtv: number;
        status: string;
    }>) {
        return this.request<any>(`/loan-products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    // Loan Applications
    async getLoanApplications(params?: { status?: string; page?: number }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request<any[]>(`/loan-applications${query ? `?${query}` : ''}`);
    }

    async getLoanApplication(id: string) {
        return this.request<any>(`/loan-applications/${id}`);
    }

    async createLoanApplication(data: {
        loanProductId: string;
        requestedAmount: number;
        selectedTenure: number;
        productId?: string;
    }) {
        return this.request<any>('/loan-applications', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateLoanApplication(id: string, data: Partial<{
        requestedAmount: number;
        selectedTenure: number;
    }>) {
        return this.request<any>(`/loan-applications/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async submitApplication(id: string) {
        return this.request<any>(`/loan-applications/${id}/submit`, {
            method: 'POST',
        });
    }

    async approveApplication(id: string, approvedAmount: number) {
        return this.request<any>(`/loan-applications/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify({ approvedAmount }),
        });
    }

    async rejectApplication(id: string, rejectionReason: string) {
        return this.request<any>(`/loan-applications/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ rejectionReason }),
        });
    }

    async disburseApplication(id: string) {
        return this.request<any>(`/loan-applications/${id}/disburse`, {
            method: 'POST',
        });
    }

    // Loans
    async getLoans(params?: { status?: string; page?: number }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request<any[]>(`/loans${query ? `?${query}` : ''}`);
    }

    async getLoan(id: string) {
        return this.request<any>(`/loans/${id}`);
    }

    async payEmi(id: string, amount: number) {
        return this.request<any>(`/loans/${id}/pay-emi`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    }

    async prepayLoan(id: string, amount: number) {
        return this.request<any>(`/loans/${id}/prepay`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    }

    async closeLoan(id: string) {
        return this.request<any>(`/loans/${id}/close`, {
            method: 'POST',
        });
    }

    // Products (Shopping)
    async getProducts(category?: string) {
        const query = category ? `?category=${category}` : '';
        return this.request<any[]>(`/products${query}`);
    }

    async getProduct(id: string) {
        return this.request<any>(`/products/${id}`);
    }

    // Dashboard
    async getDashboardStats() {
        return this.request<any>('/dashboard/stats');
    }

    // Collaterals
    async getCollaterals(params?: { loanApplicationId?: string; loanId?: string }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request<any[]>(`/collaterals${query ? `?${query}` : ''}`);
    }

    async addCollateral(data: {
        loanApplicationId: string;
        fundName: string;
        fundType: string;
        isin: string;
        units: number;
        nav: number;
    }) {
        return this.request<any>('/collaterals', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCollateralNav(id: string, nav: number) {
        return this.request<any>(`/collaterals/${id}/update-nav`, {
            method: 'PATCH',
            body: JSON.stringify({ nav }),
        });
    }

    async releaseCollateral(id: string) {
        return this.request<any>(`/collaterals/${id}/release`, {
            method: 'POST',
        });
    }

    // Audit Logs
    async getAuditLogs(entityType?: string) {
        const params = entityType ? `?entityType=${entityType}` : '';
        return this.request<any[]>(`/audit-logs${params}`);
    }

    // Generic methods for new endpoints
    async get(endpoint: string) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            },
        });
        return response.json();
    }

    async post(endpoint: string, data: Record<string, any>) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`,
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    // ======================================
    // Credit Line
    // ======================================

    async getMyCreditLine() {
        return this.request<any>('/credit-lines/me');
    }

    async getCreditLine(id: string) {
        return this.request<any>(`/credit-lines/${id}`);
    }

    async createCreditLine(data: {
        interestRate: number;
        holdings: Array<{
            fundName: string;
            fundType: string;
            isin: string;
            units: number;
            nav: number;
            folioNumber?: string;
        }>;
    }) {
        return this.request<any>('/credit-lines', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async addCreditLineCollateral(creditLineId: string, data: {
        fundName: string;
        fundType: string;
        isin: string;
        units: number;
        nav: number;
        folioNumber?: string;
    }) {
        return this.request<any>(`/credit-lines/${creditLineId}/collaterals`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async activateCreditLine(id: string) {
        return this.request<any>(`/credit-lines/${id}/activate`, {
            method: 'POST',
        });
    }

    async closeCreditLine(id: string) {
        return this.request<any>(`/credit-lines/${id}/close`, {
            method: 'POST',
        });
    }

    // ======================================
    // Tranches
    // ======================================

    async getTranches(creditLineId: string) {
        return this.request<any[]>(`/credit-lines/${creditLineId}/tranches`);
    }

    async getTranche(id: string) {
        return this.request<any>(`/tranches/${id}`);
    }

    async createTranche(creditLineId: string, data: { amount: number; purpose?: string }) {
        return this.request<any>(`/credit-lines/${creditLineId}/tranches`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async payTranche(trancheId: string, amount: number) {
        return this.request<any>(`/tranches/${trancheId}/pay`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    }

    async getTrancheTransactions(trancheId: string) {
        return this.request<any[]>(`/tranches/${trancheId}/transactions`);
    }
}

export const api = new ApiClient();
