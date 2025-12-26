import { Router } from 'express';
import { loanApplicationController } from './loanApplications.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import {
    createLoanApplicationSchema,
    updateLoanApplicationSchema,
    approveLoanApplicationSchema,
    rejectLoanApplicationSchema
} from './loanApplications.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/loan-applications
 * @desc    Get all loan applications (filtered by role)
 * @access  Private
 */
router.get('/', (req, res, next) => loanApplicationController.findAll(req, res, next));

/**
 * @route   GET /api/v1/loan-applications/:id
 * @desc    Get application by ID
 * @access  Private (owner or admin)
 */
router.get('/:id', (req, res, next) => loanApplicationController.findById(req, res, next));

/**
 * @route   POST /api/v1/loan-applications
 * @desc    Create new loan application
 * @access  Private
 */
router.post(
    '/',
    validate(createLoanApplicationSchema),
    (req, res, next) => loanApplicationController.create(req, res, next)
);

/**
 * @route   PATCH /api/v1/loan-applications/:id
 * @desc    Update draft application
 * @access  Private (owner only)
 */
router.patch(
    '/:id',
    validate(updateLoanApplicationSchema),
    (req, res, next) => loanApplicationController.update(req, res, next)
);

/**
 * @route   POST /api/v1/loan-applications/:id/submit
 * @desc    Submit application for review
 * @access  Private (owner only)
 */
router.post('/:id/submit', (req, res, next) => loanApplicationController.submit(req, res, next));

/**
 * @route   POST /api/v1/loan-applications/:id/review
 * @desc    Move to under review
 * @access  Admin only
 */
router.post(
    '/:id/review',
    authorize('ADMIN'),
    (req, res, next) => loanApplicationController.review(req, res, next)
);

/**
 * @route   POST /api/v1/loan-applications/:id/approve
 * @desc    Approve application
 * @access  Admin only
 */
router.post(
    '/:id/approve',
    authorize('ADMIN'),
    validate(approveLoanApplicationSchema),
    (req, res, next) => loanApplicationController.approve(req, res, next)
);

/**
 * @route   POST /api/v1/loan-applications/:id/reject
 * @desc    Reject application
 * @access  Admin only
 */
router.post(
    '/:id/reject',
    authorize('ADMIN'),
    validate(rejectLoanApplicationSchema),
    (req, res, next) => loanApplicationController.reject(req, res, next)
);

/**
 * @route   POST /api/v1/loan-applications/:id/disburse
 * @desc    Disburse loan (creates Loan record)
 * @access  Admin only
 */
router.post(
    '/:id/disburse',
    authorize('ADMIN'),
    (req, res, next) => loanApplicationController.disburse(req, res, next)
);

export default router;
