"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
/**
 * Auth Controller - handles HTTP layer
 */
class AuthController {
    /**
     * POST /api/v1/auth/register
     */
    async register(req, res, next) {
        try {
            const result = await auth_service_1.authService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: result,
            });
        }
        catch (error) {
            if (error.message === 'Email already registered' || error.message === 'PAN already registered') {
                res.status(409).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            next(error);
        }
    }
    /**
     * POST /api/v1/auth/login
     */
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body);
            res.json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
            if (error.message === 'Invalid email or password') {
                res.status(401).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            next(error);
        }
    }
    /**
     * GET /api/v1/auth/me
     */
    async getCurrentUser(req, res, next) {
        try {
            const user = await auth_service_1.authService.getCurrentUser(req.user.userId);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            if (error.message === 'User not found') {
                res.status(404).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map