import { Request, Response, NextFunction } from 'express';
export declare class LoanApplicationController {
    /**
     * GET /api/v1/loan-applications
     */
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/loan-applications/:id
     */
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/loan-applications
     */
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/v1/loan-applications/:id
     */
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/loan-applications/:id/submit
     */
    submit(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/loan-applications/:id/review
     */
    review(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/loan-applications/:id/approve
     */
    approve(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/loan-applications/:id/reject
     */
    reject(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/loan-applications/:id/disburse
     */
    disburse(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const loanApplicationController: LoanApplicationController;
//# sourceMappingURL=loanApplications.controller.d.ts.map