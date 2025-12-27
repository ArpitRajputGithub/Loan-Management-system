"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emi_service_1 = require("./emi.service");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const zod_1 = require("zod");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const router = (0, express_1.Router)();
const payEmiSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
});
// Get EMI schedule for a loan
router.get('/loan/:loanId', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const summary = await emi_service_1.emiService.getEmiSummary(req.params.loanId);
        res.json(summary);
    }
    catch (error) {
        next(error);
    }
});
// Calculate EMI (preview without creating)
router.get('/calculate', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const principal = parseInt(req.query.principal);
        const rate = parseFloat(req.query.rate);
        const tenure = parseInt(req.query.tenure);
        if (!principal || !rate || !tenure) {
            return res.status(400).json({ error: 'Missing required parameters: principal, rate, tenure' });
        }
        const emiAmount = emi_service_1.emiService.calculateEMI(principal, rate, tenure);
        const totalPayment = emiAmount * tenure;
        const totalInterest = totalPayment - principal;
        const schedule = emi_service_1.emiService.generateSchedule(principal, rate, tenure, new Date());
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
    }
    catch (error) {
        next(error);
    }
});
// Mark EMI as paid
router.patch('/:emiId/pay', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(payEmiSchema), async (req, res, next) => {
    try {
        const updated = await emi_service_1.emiService.markEmiAsPaid(req.params.emiId, req.body.amount);
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
// Generate schedule for a loan (usually called on disbursement)
router.post('/generate/:loanId', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const schedule = await emi_service_1.emiService.createScheduleForLoan(req.params.loanId);
        res.status(201).json(schedule);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=emi.routes.js.map