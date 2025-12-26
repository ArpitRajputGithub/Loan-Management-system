import { Request, Response, NextFunction } from 'express';
import { loanProductService } from './loanProducts.service';

export class LoanProductController {

    /**
     * GET /api/v1/loan-products
     */
    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const products = await loanProductService.findAll(includeInactive);

            res.json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/loan-products/:id
     */
    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await loanProductService.findById(req.params.id);

            res.json({
                success: true,
                data: product,
            });
        } catch (error: any) {
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
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await loanProductService.create(req.body);

            res.status(201).json({
                success: true,
                message: 'Loan product created successfully',
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/loan-products/:id
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await loanProductService.update(req.params.id, req.body);

            res.json({
                success: true,
                message: 'Loan product updated successfully',
                data: product,
            });
        } catch (error: any) {
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
    async toggleStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await loanProductService.toggleStatus(req.params.id);

            res.json({
                success: true,
                message: `Loan product ${product.status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
                data: product,
            });
        } catch (error: any) {
            if (error.message === 'Loan product not found') {
                res.status(404).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }
}

export const loanProductController = new LoanProductController();
