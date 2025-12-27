import { Request, Response, NextFunction } from 'express';
export declare class EligibilityController {
    /**
     * POST /api/v1/eligibility/check
     *
     * This is 1Fi's CORE flow - users check their credit limit in 10 seconds
     */
    check(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const eligibilityController: EligibilityController;
//# sourceMappingURL=eligibility.controller.d.ts.map