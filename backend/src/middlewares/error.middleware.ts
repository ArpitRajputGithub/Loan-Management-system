import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error response
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;

        // Unique constraint violation
        if (prismaError.code === 'P2002') {
            res.status(409).json({
                success: false,
                error: `A record with this ${prismaError.meta?.target?.join(', ') || 'value'} already exists.`,
            });
            return;
        }

        // Record not found
        if (prismaError.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Record not found.',
            });
            return;
        }
    }

    // Default error response
    res.status(500).json({
        success: false,
        error: env.isDevelopment ? err.message : 'Internal server error',
        ...(env.isDevelopment && { stack: err.stack }),
    });
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
};
