"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanApplicationController = exports.LoanApplicationController = void 0;
const loanApplications_service_1 = require("./loanApplications.service");
class LoanApplicationController {
    /**
     * GET /api/v1/loan-applications
     */
    async findAll(req, res, next) {
        try {
            const { status, page, limit } = req.query;
            const result = await loanApplications_service_1.loanApplicationService.findAll({
                status: status,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                // If user is BORROWER, only show their applications
                userId: req.user?.role === 'BORROWER' ? req.user.userId : undefined,
            });
            res.json({
                success: true,
                data: result.applications,
                meta: result.meta,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/v1/loan-applications/:id
     */
    async findById(req, res, next) {
        try {
            const application = await loanApplications_service_1.loanApplicationService.findById(req.params.id);
            // Check access - borrowers can only see their own
            if (req.user?.role === 'BORROWER' && application.userId !== req.user.userId) {
                res.status(403).json({ success: false, error: 'Not authorized' });
                return;
            }
            res.json({
                success: true,
                data: application,
            });
        }
        catch (error) {
            if (error.message === 'Loan application not found') {
                res.status(404).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }
    /**
     * POST /api/v1/loan-applications
     */
    async create(req, res, next) {
        try {
            const application = await loanApplications_service_1.loanApplicationService.create(req.body, req.user.userId);
            res.status(201).json({
                success: true,
                message: 'Loan application created successfully',
                data: application,
            });
        }
        catch (error) {
            if (error.message.includes('Invalid') || error.message.includes('must be')) {
                res.status(400).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }
    /**
     * PATCH /api/v1/loan-applications/:id
     */
    async update(req, res, next) {
        try {
            const application = await loanApplications_service_1.loanApplicationService.update(req.params.id, req.body, req.user.userId);
            res.json({
                success: true,
                message: 'Application updated successfully',
                data: application,
            });
        }
        catch (error) {
            if (error.message.includes('Not authorized') || error.message.includes('Can only')) {
                res.status(400).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }
    /**
     * POST /api/v1/loan-applications/:id/submit
     */
    async submit(req, res, next) {
        try {
            const application = await loanApplications_service_1.loanApplicationService.submit(req.params.id, req.user.userId);
            res.json({
                success: true,
                message: 'Application submitted for review',
                data: application,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    /**
     * POST /api/v1/loan-applications/:id/review
     */
    async review(req, res, next) {
        try {
            const application = await loanApplications_service_1.loanApplicationService.review(req.params.id);
            res.json({
                success: true,
                message: 'Application moved to under review',
                data: application,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    /**
     * POST /api/v1/loan-applications/:id/approve
     */
    async approve(req, res, next) {
        try {
            const application = await loanApplications_service_1.loanApplicationService.approve(req.params.id, req.body, req.user?.userId);
            res.json({
                success: true,
                message: 'Application approved',
                data: application,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    /**
     * POST /api/v1/loan-applications/:id/reject
     */
    async reject(req, res, next) {
        try {
            const application = await loanApplications_service_1.loanApplicationService.reject(req.params.id, req.body, req.user?.userId);
            res.json({
                success: true,
                message: 'Application rejected',
                data: application,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    /**
     * POST /api/v1/loan-applications/:id/disburse
     */
    async disburse(req, res, next) {
        try {
            const loan = await loanApplications_service_1.loanApplicationService.disburse(req.params.id);
            res.json({
                success: true,
                message: 'Loan disbursed successfully',
                data: loan,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.LoanApplicationController = LoanApplicationController;
exports.loanApplicationController = new LoanApplicationController();
//# sourceMappingURL=loanApplications.controller.js.map