import { Request, Response, NextFunction } from 'express';
import { loanApplicationService } from './loanApplications.service';
import { LoanApplicationStatus } from '@prisma/client';

export class LoanApplicationController {

    /**
     * GET /api/v1/loan-applications
     */
    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, page, limit } = req.query;

            const result = await loanApplicationService.findAll({
                status: status as LoanApplicationStatus | undefined,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                // If user is BORROWER, only show their applications
                userId: req.user?.role === 'BORROWER' ? req.user.userId : undefined,
            });

            res.json({
                success: true,
                data: result.applications,
                meta: result.meta,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/loan-applications/:id
     */
    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const application = await loanApplicationService.findById(req.params.id);

            // Check access - borrowers can only see their own
            if (req.user?.role === 'BORROWER' && application.userId !== req.user.userId) {
                res.status(403).json({ success: false, error: 'Not authorized' });
                return;
            }

            res.json({
                success: true,
                data: application,
            });
        } catch (error: any) {
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
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const application = await loanApplicationService.create(
                req.body,
                req.user!.userId
            );

            res.status(201).json({
                success: true,
                message: 'Loan application created successfully',
                data: application,
            });
        } catch (error: any) {
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
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const application = await loanApplicationService.update(
                req.params.id,
                req.body,
                req.user!.userId
            );

            res.json({
                success: true,
                message: 'Application updated successfully',
                data: application,
            });
        } catch (error: any) {
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
    async submit(req: Request, res: Response, next: NextFunction) {
        try {
            const application = await loanApplicationService.submit(
                req.params.id,
                req.user!.userId
            );

            res.json({
                success: true,
                message: 'Application submitted for review',
                data: application,
            });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    /**
     * POST /api/v1/loan-applications/:id/review
     */
    async review(req: Request, res: Response, next: NextFunction) {
        try {
            const application = await loanApplicationService.review(req.params.id);

            res.json({
                success: true,
                message: 'Application moved to under review',
                data: application,
            });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    /**
     * POST /api/v1/loan-applications/:id/approve
     */
    async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const application = await loanApplicationService.approve(
                req.params.id,
                req.body,
                req.user?.userId
            );

            res.json({
                success: true,
                message: 'Application approved',
                data: application,
            });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    /**
     * POST /api/v1/loan-applications/:id/reject
     */
    async reject(req: Request, res: Response, next: NextFunction) {
        try {
            const application = await loanApplicationService.reject(
                req.params.id,
                req.body,
                req.user?.userId
            );

            res.json({
                success: true,
                message: 'Application rejected',
                data: application,
            });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    /**
     * POST /api/v1/loan-applications/:id/disburse
     */
    async disburse(req: Request, res: Response, next: NextFunction) {
        try {
            const loan = await loanApplicationService.disburse(req.params.id);

            res.json({
                success: true,
                message: 'Loan disbursed successfully',
                data: loan,
            });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

export const loanApplicationController = new LoanApplicationController();
