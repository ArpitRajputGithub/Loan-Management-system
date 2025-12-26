import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation Middleware Factory
 * Validates request body, query, or params against a Zod schema.
 */
export const validate = (schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const dataToValidate = target === 'body' ? req.body
                : target === 'query' ? req.query
                    : req.params;

            const validated = schema.parse(dataToValidate);

            // Replace with validated data (includes transformations/defaults)
            if (target === 'body') req.body = validated;
            // Note: query and params are read-only in Express types

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: formattedErrors,
                });
                return;
            }

            next(error);
        }
    };
};
