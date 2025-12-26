import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

/**
 * Auth Controller - handles HTTP layer
 */
export class AuthController {

    /**
     * POST /api/v1/auth/register
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.register(req.body);

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: result,
            });
        } catch (error: any) {
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
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);

            res.json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        } catch (error: any) {
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
    async getCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.getCurrentUser(req.user!.userId);

            res.json({
                success: true,
                data: user,
            });
        } catch (error: any) {
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

export const authController = new AuthController();
