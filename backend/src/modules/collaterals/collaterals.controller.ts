import { Request, Response, NextFunction } from 'express';
import { collateralService } from './collaterals.service';

export class CollateralController {

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { loanApplicationId, loanId, lienStatus } = req.query;

            const collaterals = await collateralService.findAll({
                loanApplicationId: loanApplicationId as string,
                loanId: loanId as string,
                lienStatus: lienStatus as string,
            });

            res.json({ success: true, data: collaterals });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const collateral = await collateralService.create(req.body, req.user!.userId);

            res.status(201).json({
                success: true,
                message: 'Collateral added successfully',
                data: collateral,
            });
        } catch (error: any) {
            if (error.message.includes('Not authorized') || error.message.includes('not found')) {
                res.status(400).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }

    async updateNav(req: Request, res: Response, next: NextFunction) {
        try {
            const collateral = await collateralService.updateNav(req.params.id, req.body);

            res.json({
                success: true,
                message: 'NAV updated successfully',
                data: collateral,
            });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async requestRelease(req: Request, res: Response, next: NextFunction) {
        try {
            const collateral = await collateralService.requestRelease(req.params.id);

            res.json({
                success: true,
                message: 'Lien release requested',
                data: collateral,
            });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async completeRelease(req: Request, res: Response, next: NextFunction) {
        try {
            const collateral = await collateralService.completeRelease(req.params.id);

            res.json({
                success: true,
                message: 'Collateral released successfully',
                data: collateral,
            });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

export const collateralController = new CollateralController();
