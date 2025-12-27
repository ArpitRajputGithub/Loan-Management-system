"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marginCall_service_1 = require("./marginCall.service");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const zod_1 = require("zod");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const router = (0, express_1.Router)();
const resolveSchema = zod_1.z.object({
    topUpAmount: zod_1.z.number().positive(),
});
// Get all margin calls
router.get('/', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const result = await marginCall_service_1.marginCallService.getAll(page, limit, status);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Get margin call stats
router.get('/stats', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const stats = await marginCall_service_1.marginCallService.getStats();
        res.json(stats);
    }
    catch (error) {
        next(error);
    }
});
// Get LTV thresholds
router.get('/thresholds', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const thresholds = marginCall_service_1.marginCallService.getLtvThresholds();
        res.json(thresholds);
    }
    catch (error) {
        next(error);
    }
});
// Check all loans and create margin calls if needed
router.post('/check', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const newMarginCalls = await marginCall_service_1.marginCallService.checkAllLoans();
        res.json({
            message: `Checked all active loans. ${newMarginCalls.length} new margin calls created.`,
            marginCalls: newMarginCalls,
        });
    }
    catch (error) {
        next(error);
    }
});
// Calculate LTV for a specific loan
router.get('/ltv/:loanId', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const ltvData = await marginCall_service_1.marginCallService.calculateLTV(req.params.loanId);
        const thresholds = marginCall_service_1.marginCallService.getLtvThresholds();
        let status = 'SAFE';
        if (ltvData.ltv >= thresholds.LIQUIDATION)
            status = 'CRITICAL';
        else if (ltvData.ltv >= thresholds.MARGIN_CALL)
            status = 'MARGIN_CALL';
        else if (ltvData.ltv >= thresholds.WARNING)
            status = 'WARNING';
        res.json({ ...ltvData, status, thresholds });
    }
    catch (error) {
        next(error);
    }
});
// Get margin calls for a loan
router.get('/loan/:loanId', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const marginCalls = await marginCall_service_1.marginCallService.getByLoanId(req.params.loanId);
        res.json(marginCalls);
    }
    catch (error) {
        next(error);
    }
});
// Mark as notified
router.patch('/:id/notify', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const updated = await marginCall_service_1.marginCallService.markNotified(req.params.id);
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
// Resolve margin call
router.patch('/:id/resolve', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(resolveSchema), async (req, res, next) => {
    try {
        const updated = await marginCall_service_1.marginCallService.resolve(req.params.id, req.body.topUpAmount);
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=marginCall.routes.js.map