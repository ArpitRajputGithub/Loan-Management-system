import { Request, Response, NextFunction } from 'express';
import { eligibilityService } from './eligibility.service';

export class EligibilityController {

    /**
     * POST /api/v1/eligibility/check
     * 
     * This is 1Fi's CORE flow - users check their credit limit in 10 seconds
     */
    async check(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await eligibilityService.checkEligibility(req.body);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const eligibilityController = new EligibilityController();
