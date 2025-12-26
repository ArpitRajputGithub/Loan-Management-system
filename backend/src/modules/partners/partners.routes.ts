import { Router } from 'express';
import { authenticateApiKey } from '../../middlewares/apiKey.middleware';
import { loanApplicationService } from '../loanApplications/loanApplications.service';
import prisma from '../../config/database';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

/**
 * Partner API Routes
 * Server-to-server endpoints for fintech partner integrations.
 */

const partnerApplicationSchema = z.object({
    userId: z.string().uuid(),
    loanProductId: z.string().uuid(),
    productId: z.string().uuid().optional(),
    requestedAmount: z.number().int().positive(),
    selectedTenure: z.number().int().min(1).max(120),
});

// All partner routes require API key
router.use(authenticateApiKey);

/**
 * @route   POST /api/v1/partner/applications
 * @desc    Create loan application via partner API
 * @access  Partner (API Key)
 */
router.post('/applications', validate(partnerApplicationSchema), async (req, res, next) => {
    try {
        const application = await loanApplicationService.create(
            req.body,
            req.body.userId,
            req.partnerId // Pass partner ID
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
    } catch (error: any) {
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
        const application = await prisma.loanApplication.findFirst({
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
    } catch (error) {
        next(error);
    }
});

export default router;
