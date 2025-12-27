"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
/**
 * Validation Middleware Factory
 * Validates request body, query, or params against a Zod schema.
 */
const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        try {
            const dataToValidate = target === 'body' ? req.body
                : target === 'query' ? req.query
                    : req.params;
            const validated = schema.parse(dataToValidate);
            // Replace with validated data (includes transformations/defaults)
            if (target === 'body')
                req.body = validated;
            // Note: query and params are read-only in Express types
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map