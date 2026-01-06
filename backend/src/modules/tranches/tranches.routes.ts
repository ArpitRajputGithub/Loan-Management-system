import { Router } from 'express';
import { trancheController } from './tranches.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createTrancheSchema, payTrancheSchema } from './tranches.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/tranches/:id
 * @desc    Get tranche by ID
 * @access  Private
 */
router.get('/:id', trancheController.getById);

/**
 * @route   GET /api/v1/tranches/:id/transactions
 * @desc    Get transaction history for a tranche
 * @access  Private
 */
router.get('/:id/transactions', trancheController.getTransactions);

/**
 * @route   POST /api/v1/tranches/:id/pay
 * @desc    Make a payment against a tranche
 * @access  Private
 */
router.post('/:id/pay', validate(payTrancheSchema), trancheController.makePayment);

/**
 * @route   POST /api/v1/tranches/accrue-interest
 * @desc    Run daily interest accrual (admin/cron)
 * @access  Admin
 */
router.post('/accrue-interest', authorize('ADMIN'), trancheController.runInterestAccrual);

// ========================================
// Nested routes (under credit-lines)
// These are mounted at /api/v1/credit-lines/:creditLineId/tranches
// ========================================

export const creditLineTranchesRouter = Router({ mergeParams: true });
creditLineTranchesRouter.use(authenticate);

/**
 * @route   GET /api/v1/credit-lines/:creditLineId/tranches
 * @desc    Get all tranches for a credit line
 * @access  Private
 */
creditLineTranchesRouter.get('/', trancheController.getByCreditLineId);

/**
 * @route   POST /api/v1/credit-lines/:creditLineId/tranches
 * @desc    Create a new tranche (withdrawal)
 * @access  Private
 */
creditLineTranchesRouter.post(
    '/',
    validate(createTrancheSchema),
    trancheController.create
);

export default router;
