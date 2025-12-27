import { Request, Response, NextFunction } from 'express';
export declare class LoanProductController {
    /**
     * GET /api/v1/loan-products
     */
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/v1/loan-products/:id
     */
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/v1/loan-products
     */
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/v1/loan-products/:id
     */
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/v1/loan-products/:id/toggle-status
     */
    toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const loanProductController: LoanProductController;
//# sourceMappingURL=loanProducts.controller.d.ts.map