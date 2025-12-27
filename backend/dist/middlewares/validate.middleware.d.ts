import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Validation Middleware Factory
 * Validates request body, query, or params against a Zod schema.
 */
export declare const validate: (schema: ZodSchema, target?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.middleware.d.ts.map