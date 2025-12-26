import { Request, Response, NextFunction } from 'express';
import { loanService } from './loans.service';
import { LoanStatus } from '@prisma/client';

export class LoanController {

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, page, limit } = req.query;
            const result = await loanService.findAll({
                status: status as LoanStatus | undefined,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });
            res.json({ success: true, data: result.loans, meta: result.meta });
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const loan = await loanService.findById(req.params.id);
            res.json({ success: true, data: loan });
        } catch (error: any) {
            if (error.message === 'Loan not found') {
                res.status(404).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }

    async payEmi(req: Request, res: Response, next: NextFunction) {
        try {
            const { amount } = req.body;
            const loan = await loanService.recordEmiPayment(req.params.id, amount);
            res.json({ success: true, message: 'EMI payment recorded', data: loan });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async close(req: Request, res: Response, next: NextFunction) {
        try {
            const loan = await loanService.closeLoan(req.params.id);
            res.json({ success: true, message: 'Loan closed successfully', data: loan });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

export const loanController = new LoanController();
