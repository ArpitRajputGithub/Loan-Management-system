import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { registerSchema, loginSchema } from './auth.schema';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/register',
    validate(registerSchema),
    (req, res, next) => authController.register(req, res, next)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
    '/login',
    validate(loginSchema),
    (req, res, next) => authController.login(req, res, next)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get(
    '/me',
    authenticate,
    (req, res, next) => authController.getCurrentUser(req, res, next)
);

export default router;
