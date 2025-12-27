"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loanApplications_controller_1 = require("./loanApplications.controller");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const loanApplications_schema_1 = require("./loanApplications.schema");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @route   GET /api/v1/loan-applications
 * @desc    Get all loan applications (filtered by role)
 * @access  Private
 */
router.get('/', (req, res, next) => loanApplications_controller_1.loanApplicationController.findAll(req, res, next));
/**
 * @route   GET /api/v1/loan-applications/:id
 * @desc    Get application by ID
 * @access  Private (owner or admin)
 */
router.get('/:id', (req, res, next) => loanApplications_controller_1.loanApplicationController.findById(req, res, next));
/**
 * @route   POST /api/v1/loan-applications
 * @desc    Create new loan application
 * @access  Private
 */
router.post('/', (0, validate_middleware_1.validate)(loanApplications_schema_1.createLoanApplicationSchema), (req, res, next) => loanApplications_controller_1.loanApplicationController.create(req, res, next));
/**
 * @route   PATCH /api/v1/loan-applications/:id
 * @desc    Update draft application
 * @access  Private (owner only)
 */
router.patch('/:id', (0, validate_middleware_1.validate)(loanApplications_schema_1.updateLoanApplicationSchema), (req, res, next) => loanApplications_controller_1.loanApplicationController.update(req, res, next));
/**
 * @route   POST /api/v1/loan-applications/:id/submit
 * @desc    Submit application for review
 * @access  Private (owner only)
 */
router.post('/:id/submit', (req, res, next) => loanApplications_controller_1.loanApplicationController.submit(req, res, next));
/**
 * @route   POST /api/v1/loan-applications/:id/review
 * @desc    Move to under review
 * @access  Admin only
 */
router.post('/:id/review', (0, auth_middleware_1.authorize)('ADMIN'), (req, res, next) => loanApplications_controller_1.loanApplicationController.review(req, res, next));
/**
 * @route   POST /api/v1/loan-applications/:id/approve
 * @desc    Approve application
 * @access  Admin only
 */
router.post('/:id/approve', (0, auth_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validate)(loanApplications_schema_1.approveLoanApplicationSchema), (req, res, next) => loanApplications_controller_1.loanApplicationController.approve(req, res, next));
/**
 * @route   POST /api/v1/loan-applications/:id/reject
 * @desc    Reject application
 * @access  Admin only
 */
router.post('/:id/reject', (0, auth_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validate)(loanApplications_schema_1.rejectLoanApplicationSchema), (req, res, next) => loanApplications_controller_1.loanApplicationController.reject(req, res, next));
/**
 * @route   POST /api/v1/loan-applications/:id/disburse
 * @desc    Disburse loan (creates Loan record)
 * @access  Admin only
 */
router.post('/:id/disburse', (0, auth_middleware_1.authorize)('ADMIN'), (req, res, next) => loanApplications_controller_1.loanApplicationController.disburse(req, res, next));
exports.default = router;
//# sourceMappingURL=loanApplications.routes.js.map