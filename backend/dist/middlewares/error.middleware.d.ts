import { Request, Response, NextFunction } from 'express';
/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error response
 */
export declare const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 Not Found Handler
 */
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map