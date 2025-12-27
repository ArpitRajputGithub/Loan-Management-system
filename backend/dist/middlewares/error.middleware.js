"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const env_1 = require("../config/env");
/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error response
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
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
        error: env_1.env.isDevelopment ? err.message : 'Internal server error',
        ...(env_1.env.isDevelopment && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map