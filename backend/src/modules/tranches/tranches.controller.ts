import { Request, Response, NextFunction } from 'express';
import { trancheService } from './tranches.service';

class TrancheController {
    /**
     * Get tranche by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const tranche = await trancheService.getById(req.params.id);

            if (!tranche) {
                return res.status(404).json({ success: false, error: 'Tranche not found' });
            }

            res.json({ success: true, data: tranche });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all tranches for a credit line
     */
    async getByCreditLineId(req: Request, res: Response, next: NextFunction) {
        try {
            const { creditLineId } = req.params;
            const tranches = await trancheService.getByCreditLineId(creditLineId);

            res.json({ success: true, data: tranches });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new tranche (withdrawal)
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { creditLineId } = req.params;
            const tranche = await trancheService.create(creditLineId, req.body);

            res.status(201).json({
                success: true,
                message: 'Tranche created successfully. Funds will be disbursed shortly.',
                data: tranche,
            });
        } catch (error: any) {
            if (
                error.message.includes('Insufficient') ||
                error.message.includes('Cannot withdraw') ||
                error.message === 'Credit line not found'
            ) {
                return res.status(400).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    /**
     * Make a payment against a tranche
     */
    async makePayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const tranche = await trancheService.makePayment(id, req.body);

            res.json({
                success: true,
                message: tranche.status === 'CLOSED'
                    ? 'Tranche fully repaid and closed'
                    : 'Payment processed successfully',
                data: tranche,
            });
        } catch (error: any) {
            if (
                error.message.includes('exceeds outstanding') ||
                error.message === 'Tranche not found' ||
                error.message.includes('already closed')
            ) {
                return res.status(400).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    /**
     * Get transaction history for a tranche
     */
    async getTransactions(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const transactions = await trancheService.getTransactions(id);

            res.json({ success: true, data: transactions });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Run daily interest accrual (admin/cron job)
     */
    async runInterestAccrual(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await trancheService.accrueInterestOnAllActiveTranches();

            res.json({
                success: true,
                message: `Interest accrued on ${result.tranchesProcessed} tranches`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const trancheController = new TrancheController();
