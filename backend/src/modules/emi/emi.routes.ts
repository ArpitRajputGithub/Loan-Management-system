import { Router, Request, Response, NextFunction } from 'express';
import { emiService } from './emi.service';
import { authenticate } from '../../middlewares/auth.middleware';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

const payEmiSchema = z.object({
    amount: z.number().positive(),
});

// Get EMI schedule for a loan
router.get('/loan/:loanId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const summary = await emiService.getEmiSummary(req.params.loanId);
        res.json(summary);
    } catch (error) {
        next(error);
    }
});

// Calculate EMI (preview without creating)
router.get('/calculate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const principal = parseInt(req.query.principal as string);
        const rate = parseFloat(req.query.rate as string);
        const tenure = parseInt(req.query.tenure as string);

        if (!principal || !rate || !tenure) {
            return res.status(400).json({ error: 'Missing required parameters: principal, rate, tenure' });
        }

        const emiAmount = emiService.calculateEMI(principal, rate, tenure);
        const totalPayment = emiAmount * tenure;
        const totalInterest = totalPayment - principal;

        const schedule = emiService.generateSchedule(principal, rate, tenure, new Date());

        res.json({
            emiAmount,
            totalPayment,
            totalInterest,
            principal,
            interestRate: rate,
            tenureMonths: tenure,
            schedule: schedule.map(s => ({
                installmentNo: s.installmentNo,
                emiAmount: s.emiAmount,
                principalAmount: s.principalAmount,
                interestAmount: s.interestAmount,
                openingBalance: s.openingBalance,
                closingBalance: s.closingBalance,
            })),
        });
    } catch (error) {
        next(error);
    }
});

// Mark EMI as paid
router.patch('/:emiId/pay', authenticate, validate(payEmiSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updated = await emiService.markEmiAsPaid(req.params.emiId, req.body.amount);
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

// Generate schedule for a loan (usually called on disbursement)
router.post('/generate/:loanId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schedule = await emiService.createScheduleForLoan(req.params.loanId);
        res.status(201).json(schedule);
    } catch (error) {
        next(error);
    }
});

export default router;
