import { Router } from 'express';
import { eligibilityController } from './eligibility.controller';
import { validate } from '../../middlewares/validate.middleware';
import { eligibilityCheckSchema } from './eligibility.schema';

const router = Router();

/**
 * @route   POST /api/v1/eligibility/check
 * @desc    Check credit limit eligibility with PAN and mobile
 * @access  Public
 */
router.post(
    '/check',
    validate(eligibilityCheckSchema),
    (req, res, next) => eligibilityController.check(req, res, next)
);

export default router;
