import { Request, Response, NextFunction } from 'express';
export declare class CollateralController {
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateNav(req: Request, res: Response, next: NextFunction): Promise<void>;
    requestRelease(req: Request, res: Response, next: NextFunction): Promise<void>;
    completeRelease(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const collateralController: CollateralController;
//# sourceMappingURL=collaterals.controller.d.ts.map