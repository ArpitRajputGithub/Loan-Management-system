import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Import routes (will be added as we build modules)
import authRoutes from './modules/auth/auth.routes';
import loanProductRoutes from './modules/loanProducts/loanProducts.routes';
import loanApplicationRoutes from './modules/loanApplications/loanApplications.routes';
import loanRoutes from './modules/loans/loans.routes';
import collateralRoutes from './modules/collaterals/collaterals.routes';
import productRoutes from './modules/products/products.routes';
import eligibilityRoutes from './modules/eligibility/eligibility.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import partnerRoutes from './modules/partners/partners.routes';
import auditLogRoutes from './modules/auditLogs/auditLogs.routes';
import customerRoutes from './modules/customers/customer.routes';
import emiRoutes from './modules/emi/emi.routes';
import marginCallRoutes from './modules/marginCalls/marginCall.routes';

const app: Application = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());

// CORS - allow frontend access
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: '1Fi LMS API is running',
        timestamp: new Date().toISOString(),
    });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/loan-products', loanProductRoutes);
app.use('/api/v1/loan-applications', loanApplicationRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/collaterals', collateralRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/eligibility', eligibilityRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/emi', emiRoutes);
app.use('/api/v1/margin-calls', marginCallRoutes);

// Partner API (separate namespace with API key auth)
app.use('/api/v1/partner', partnerRoutes);

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
