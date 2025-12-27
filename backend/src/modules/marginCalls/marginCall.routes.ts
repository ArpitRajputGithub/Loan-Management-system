import { Router, Request, Response, NextFunction } from 'express';
import { marginCallService } from './marginCall.service';
import { authenticate } from '../../middlewares/auth.middleware';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

const resolveSchema = z.object({
    topUpAmount: z.number().positive(),
});

// Get all margin calls
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const status = req.query.status as string | undefined;

        const result = await marginCallService.getAll(page, limit, status);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get margin call stats
router.get('/stats', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await marginCallService.getStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Get LTV thresholds
router.get('/thresholds', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const thresholds = marginCallService.getLtvThresholds();
        res.json(thresholds);
    } catch (error) {
        next(error);
    }
});

// Check all loans and create margin calls if needed
router.post('/check', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newMarginCalls = await marginCallService.checkAllLoans();
        res.json({
            message: `Checked all active loans. ${newMarginCalls.length} new margin calls created.`,
            marginCalls: newMarginCalls,
        });
    } catch (error) {
        next(error);
    }
});

// Calculate LTV for a specific loan
router.get('/ltv/:loanId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ltvData = await marginCallService.calculateLTV(req.params.loanId);
        const thresholds = marginCallService.getLtvThresholds();

        let status = 'SAFE';
        if (ltvData.ltv >= thresholds.LIQUIDATION) status = 'CRITICAL';
        else if (ltvData.ltv >= thresholds.MARGIN_CALL) status = 'MARGIN_CALL';
        else if (ltvData.ltv >= thresholds.WARNING) status = 'WARNING';

        res.json({ ...ltvData, status, thresholds });
    } catch (error) {
        next(error);
    }
});

// Get margin calls for a loan
router.get('/loan/:loanId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const marginCalls = await marginCallService.getByLoanId(req.params.loanId);
        res.json(marginCalls);
    } catch (error) {
        next(error);
    }
});

// Mark as notified
router.patch('/:id/notify', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updated = await marginCallService.markNotified(req.params.id);
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

// Resolve margin call
router.patch('/:id/resolve', authenticate, validate(resolveSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updated = await marginCallService.resolve(req.params.id, req.body.topUpAmount);
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

export default router;
