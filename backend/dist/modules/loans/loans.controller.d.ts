import { Request, Response, NextFunction } from 'express';
export declare class LoanController {
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    payEmi(req: Request, res: Response, next: NextFunction): Promise<void>;
    close(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const loanController: LoanController;
//# sourceMappingURL=loans.controller.d.ts.map