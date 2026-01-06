import { Router } from 'express';
import { creditLineController } from './creditLines.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createCreditLineSchema, addCollateralSchema } from './creditLines.schema';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/credit-lines/me
 * @desc    Get current user's credit line
 * @access  Private
 */
router.get('/me', creditLineController.getMyCredtLine);

/**
 * @route   GET /api/v1/credit-lines
 * @desc    Get all credit lines (admin)
 * @access  Admin
 */
router.get('/', authorize('ADMIN'), creditLineController.getAll);

/**
 * @route   GET /api/v1/credit-lines/:id
 * @desc    Get credit line by ID (admin)
 * @access  Admin
 */
router.get('/:id', authorize('ADMIN'), creditLineController.getById);

/**
 * @route   POST /api/v1/credit-lines
 * @desc    Create a new credit line
 * @access  Private
 */
router.post('/', validate(createCreditLineSchema), creditLineController.create);

/**
 * @route   POST /api/v1/credit-lines/:id/collaterals
 * @desc    Add collateral to credit line
 * @access  Private
 */
router.post(
    '/:id/collaterals',
    validate(addCollateralSchema),
    creditLineController.addCollateral
);

/**
 * @route   POST /api/v1/credit-lines/:id/activate
 * @desc    Activate credit line
 * @access  Admin
 */
router.post('/:id/activate', authorize('ADMIN'), creditLineController.activate);

/**
 * @route   POST /api/v1/credit-lines/:id/freeze
 * @desc    Freeze credit line (admin)
 * @access  Admin
 */
router.post('/:id/freeze', authorize('ADMIN'), creditLineController.freeze);

/**
 * @route   POST /api/v1/credit-lines/:id/unfreeze
 * @desc    Unfreeze credit line (admin)
 * @access  Admin
 */
router.post('/:id/unfreeze', authorize('ADMIN'), creditLineController.unfreeze);

/**
 * @route   POST /api/v1/credit-lines/:id/close
 * @desc    Close credit line
 * @access  Private
 */
router.post('/:id/close', creditLineController.close);

/**
 * @route   PATCH /api/v1/credit-lines/:id/collaterals/:collateralId/nav
 * @desc    Update collateral NAV
 * @access  Admin
 */
router.patch(
    '/:id/collaterals/:collateralId/nav',
    authorize('ADMIN'),
    validate(z.object({ nav: z.number().positive() })),
    creditLineController.updateCollateralNAV
);

/**
 * @route   POST /api/v1/credit-lines/:id/check-ltv
 * @desc    Check LTV and trigger margin call if needed
 * @access  Admin
 */
router.post('/:id/check-ltv', authorize('ADMIN'), creditLineController.checkLTV);

/**
 * @route   POST /api/v1/credit-lines/accrue-interest
 * @desc    Trigger daily interest accrual for all active tranches
 * @access  Admin
 */
router.post('/accrue-interest', authorize('ADMIN'), creditLineController.accrueInterest);

export default router;
