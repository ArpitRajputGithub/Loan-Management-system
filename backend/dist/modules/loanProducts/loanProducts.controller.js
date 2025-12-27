"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanProductController = exports.LoanProductController = void 0;
const loanProducts_service_1 = require("./loanProducts.service");
class LoanProductController {
    /**
     * GET /api/v1/loan-products
     */
    async findAll(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const products = await loanProducts_service_1.loanProductService.findAll(includeInactive);
            res.json({
                success: true,
                data: products,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/v1/loan-products/:id
     */
    async findById(req, res, next) {
        try {
            const product = await loanProducts_service_1.loanProductService.findById(req.params.id);
            res.json({
                success: true,
                data: product,
            });
        }
        catch (error) {
            if (error.message === 'Loan product not found') {
                res.status(404).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }
    /**
     * POST /api/v1/loan-products
     */
    async create(req, res, next) {
        try {
            const product = await loanProducts_service_1.loanProductService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Loan product created successfully',
                data: product,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /api/v1/loan-products/:id
     */
    async update(req, res, next) {
        try {
            const product = await loanProducts_service_1.loanProductService.update(req.params.id, req.body);
            res.json({
                success: true,
                message: 'Loan product updated successfully',
                data: product,
            });
        }
        catch (error) {
            if (error.message === 'Loan product not found') {
                res.status(404).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }
    /**
     * PATCH /api/v1/loan-products/:id/toggle-status
     */
    async toggleStatus(req, res, next) {
        try {
            const product = await loanProducts_service_1.loanProductService.toggleStatus(req.params.id);
            res.json({
                success: true,
                message: `Loan product ${product.status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
                data: product,
            });
        }
        catch (error) {
            if (error.message === 'Loan product not found') {
                res.status(404).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }
}
exports.LoanProductController = LoanProductController;
exports.loanProductController = new LoanProductController();
//# sourceMappingURL=loanProducts.controller.js.map