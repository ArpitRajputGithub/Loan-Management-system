"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const auth_schema_1 = require("./auth.schema");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (0, validate_middleware_1.validate)(auth_schema_1.registerSchema), (req, res, next) => auth_controller_1.authController.register(req, res, next));
/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (0, validate_middleware_1.validate)(auth_schema_1.loginSchema), (req, res, next) => auth_controller_1.authController.login(req, res, next));
/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', auth_middleware_1.authenticate, (req, res, next) => auth_controller_1.authController.getCurrentUser(req, res, next));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map