"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKey_middleware_1 = require("../../middlewares/apiKey.middleware");
const loanApplications_service_1 = require("../loanApplications/loanApplications.service");
const database_1 = __importDefault(require("../../config/database"));
const zod_1 = require("zod");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const router = (0, express_1.Router)();
/**
 * Partner API Routes
 * Server-to-server endpoints for fintech partner integrations.
 */
const partnerApplicationSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    loanProductId: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid().optional(),
    requestedAmount: zod_1.z.number().int().positive(),
    selectedTenure: zod_1.z.number().int().min(1).max(120),
});
// All partner routes require API key
router.use(apiKey_middleware_1.authenticateApiKey);
/**
 * @route   POST /api/v1/partner/applications
 * @desc    Create loan application via partner API
 * @access  Partner (API Key)
 */
router.post('/applications', (0, validate_middleware_1.validate)(partnerApplicationSchema), async (req, res, next) => {
    try {
        const application = await loanApplications_service_1.loanApplicationService.create(req.body, req.body.userId, req.partnerId // Pass partner ID
        );
        res.status(201).json({
            success: true,
            message: 'Loan application created via partner API',
            data: {
                applicationId: application.id,
                applicationNumber: application.applicationNumber,
                status: application.status,
            },
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
/**
 * @route   GET /api/v1/partner/applications/:id
 * @desc    Get application status
 * @access  Partner (API Key)
 */
router.get('/applications/:id', async (req, res, next) => {
    try {
        const application = await database_1.default.loanApplication.findFirst({
            where: {
                id: req.params.id,
                partnerId: req.partnerId,
            },
            select: {
                id: true,
                applicationNumber: true,
                status: true,
                requestedAmount: true,
                approvedAmount: true,
                selectedTenure: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!application) {
            res.status(404).json({ success: false, error: 'Application not found' });
            return;
        }
        res.json({ success: true, data: application });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=partners.routes.js.map