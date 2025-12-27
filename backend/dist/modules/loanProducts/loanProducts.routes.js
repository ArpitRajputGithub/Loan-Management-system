"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loanProducts_controller_1 = require("./loanProducts.controller");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const loanProducts_schema_1 = require("./loanProducts.schema");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/loan-products
 * @desc    Get all loan products
 * @access  Public (for now, can be restricted)
 */
router.get('/', (req, res, next) => loanProducts_controller_1.loanProductController.findAll(req, res, next));
/**
 * @route   GET /api/v1/loan-products/:id
 * @desc    Get loan product by ID
 * @access  Public
 */
router.get('/:id', (req, res, next) => loanProducts_controller_1.loanProductController.findById(req, res, next));
/**
 * @route   POST /api/v1/loan-products
 * @desc    Create new loan product
 * @access  Admin only
 */
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validate)(loanProducts_schema_1.createLoanProductSchema), (req, res, next) => loanProducts_controller_1.loanProductController.create(req, res, next));
/**
 * @route   PATCH /api/v1/loan-products/:id
 * @desc    Update loan product
 * @access  Admin only
 */
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validate)(loanProducts_schema_1.updateLoanProductSchema), (req, res, next) => loanProducts_controller_1.loanProductController.update(req, res, next));
/**
 * @route   PATCH /api/v1/loan-products/:id/toggle-status
 * @desc    Toggle product active/inactive status
 * @access  Admin only
 */
router.patch('/:id/toggle-status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), (req, res, next) => loanProducts_controller_1.loanProductController.toggleStatus(req, res, next));
exports.default = router;
//# sourceMappingURL=loanProducts.routes.js.map