import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
/**
 * JWT Authentication Middleware
 * Verifies Bearer token and attaches user to request.
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Role-based authorization middleware
 * Use after authenticate middleware
 */
export declare const authorize: (...allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional authentication - doesn't fail if no token, but attaches user if present
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map