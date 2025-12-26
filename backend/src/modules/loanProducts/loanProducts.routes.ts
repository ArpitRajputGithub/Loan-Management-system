import { Router } from 'express';
import { loanProductController } from './loanProducts.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { createLoanProductSchema, updateLoanProductSchema } from './loanProducts.schema';

const router = Router();

/**
 * @route   GET /api/v1/loan-products
 * @desc    Get all loan products
 * @access  Public (for now, can be restricted)
 */
router.get('/', (req, res, next) => loanProductController.findAll(req, res, next));

/**
 * @route   GET /api/v1/loan-products/:id
 * @desc    Get loan product by ID
 * @access  Public
 */
router.get('/:id', (req, res, next) => loanProductController.findById(req, res, next));

/**
 * @route   POST /api/v1/loan-products
 * @desc    Create new loan product
 * @access  Admin only
 */
router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    validate(createLoanProductSchema),
    (req, res, next) => loanProductController.create(req, res, next)
);

/**
 * @route   PATCH /api/v1/loan-products/:id
 * @desc    Update loan product
 * @access  Admin only
 */
router.patch(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    validate(updateLoanProductSchema),
    (req, res, next) => loanProductController.update(req, res, next)
);

/**
 * @route   PATCH /api/v1/loan-products/:id/toggle-status
 * @desc    Toggle product active/inactive status
 * @access  Admin only
 */
router.patch(
    '/:id/toggle-status',
    authenticate,
    authorize('ADMIN'),
    (req, res, next) => loanProductController.toggleStatus(req, res, next)
);

export default router;
