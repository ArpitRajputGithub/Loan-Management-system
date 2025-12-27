import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            partnerId?: string;
            partnerName?: string;
        }
    }
}
export declare const authenticateApiKey: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=apiKey.middleware.d.ts.map