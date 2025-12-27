"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const error_middleware_1 = require("./middlewares/error.middleware");
// Import routes (will be added as we build modules)
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const loanProducts_routes_1 = __importDefault(require("./modules/loanProducts/loanProducts.routes"));
const loanApplications_routes_1 = __importDefault(require("./modules/loanApplications/loanApplications.routes"));
const loans_routes_1 = __importDefault(require("./modules/loans/loans.routes"));
const collaterals_routes_1 = __importDefault(require("./modules/collaterals/collaterals.routes"));
const products_routes_1 = __importDefault(require("./modules/products/products.routes"));
const eligibility_routes_1 = __importDefault(require("./modules/eligibility/eligibility.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const partners_routes_1 = __importDefault(require("./modules/partners/partners.routes"));
const auditLogs_routes_1 = __importDefault(require("./modules/auditLogs/auditLogs.routes"));
const customer_routes_1 = __importDefault(require("./modules/customers/customer.routes"));
const emi_routes_1 = __importDefault(require("./modules/emi/emi.routes"));
const marginCall_routes_1 = __importDefault(require("./modules/marginCalls/marginCall.routes"));
const app = (0, express_1.default)();
// ============================================
// MIDDLEWARE
// ============================================
// Security
app.use((0, helmet_1.default)());
// CORS - allow frontend access
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ============================================
// ROUTES
// ============================================
// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: '1Fi LMS API is running',
        timestamp: new Date().toISOString(),
    });
});
// API v1 routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/loan-products', loanProducts_routes_1.default);
app.use('/api/v1/loan-applications', loanApplications_routes_1.default);
app.use('/api/v1/loans', loans_routes_1.default);
app.use('/api/v1/collaterals', collaterals_routes_1.default);
app.use('/api/v1/products', products_routes_1.default);
app.use('/api/v1/eligibility', eligibility_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
app.use('/api/v1/audit-logs', auditLogs_routes_1.default);
app.use('/api/v1/customers', customer_routes_1.default);
app.use('/api/v1/emi', emi_routes_1.default);
app.use('/api/v1/margin-calls', marginCall_routes_1.default);
// Partner API (separate namespace with API key auth)
app.use('/api/v1/partner', partners_routes_1.default);
// ============================================
// ERROR HANDLING
// ============================================
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map