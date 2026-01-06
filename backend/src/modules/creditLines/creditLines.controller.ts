import { Request, Response, NextFunction } from 'express';
import { creditLineService } from './creditLines.service';
import { trancheService } from '../tranches/tranches.service';

// Extending Express Request to include user from JWT
interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

class CreditLineController {
    /**
     * Get current user's credit line
     */
    async getMyCredtLine(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }

            const creditLine = await creditLineService.getByUserId(userId);

            if (!creditLine) {
                return res.status(404).json({
                    success: false,
                    error: 'No credit line found. Please create one first.',
                });
            }

            res.json({ success: true, data: creditLine });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get credit line by ID (admin)
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const creditLine = await creditLineService.getById(req.params.id);

            if (!creditLine) {
                return res.status(404).json({ success: false, error: 'Credit line not found' });
            }

            res.json({ success: true, data: creditLine });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all credit lines (admin)
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const status = req.query.status as string | undefined;

            const result = await creditLineService.getAll(page, limit, status as any);

            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new credit line
     */
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }

            const creditLine = await creditLineService.create(userId, req.body);

            res.status(201).json({
                success: true,
                message: 'Credit line created successfully',
                data: creditLine,
            });
        } catch (error: any) {
            if (error.message === 'User already has a credit line') {
                return res.status(409).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    /**
     * Add collateral to credit line
     */
    async addCollateral(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const collateral = await creditLineService.addCollateral(id, req.body);

            res.status(201).json({
                success: true,
                message: 'Collateral added successfully',
                data: collateral,
            });
        } catch (error: any) {
            if (error.message === 'Credit line not found') {
                return res.status(404).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    /**
     * Activate credit line
     */
    async activate(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const creditLine = await creditLineService.activate(id);

            res.json({
                success: true,
                message: 'Credit line activated successfully',
                data: creditLine,
            });
        } catch (error: any) {
            if (error.message.includes('Cannot activate') || error.message === 'Credit line not found') {
                return res.status(400).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    /**
     * Freeze credit line (admin)
     */
    async freeze(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const creditLine = await creditLineService.freeze(id, reason);

            res.json({
                success: true,
                message: 'Credit line frozen',
                data: creditLine,
            });
        } catch (error: any) {
            if (error.message.includes('Cannot freeze') || error.message === 'Credit line not found') {
                return res.status(400).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    /**
     * Unfreeze credit line (admin)
     */
    async unfreeze(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const creditLine = await creditLineService.unfreeze(id);

            res.json({
                success: true,
                message: 'Credit line unfrozen',
                data: creditLine,
            });
        } catch (error: any) {
            if (error.message.includes('not frozen') || error.message === 'Credit line not found') {
                return res.status(400).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    /**
     * Close credit line
     */
    async close(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const creditLine = await creditLineService.close(id);

            res.json({
                success: true,
                message: 'Credit line closed successfully',
                data: creditLine,
            });
        } catch (error: any) {
            if (error.message.includes('Cannot close') || error.message === 'Credit line not found') {
                return res.status(400).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    /**
     * Update collateral NAV
     */
    async updateCollateralNAV(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, collateralId } = req.params;
            const { nav } = req.body;

            const collateral = await creditLineService.updateCollateralNAV(id, collateralId, nav);

            res.json({
                success: true,
                message: 'NAV updated successfully',
                data: collateral,
            });
        } catch (error: any) {
            if (error.message === 'Collateral not found') {
                return res.status(404).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    /**
     * Check LTV and trigger margin call if needed
     */
    async checkLTV(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const marginCall = await creditLineService.checkLtvAndCreateMarginCall(id);

            if (marginCall) {
                res.json({
                    success: true,
                    message: 'Margin call triggered',
                    data: marginCall,
                });
            } else {
                res.json({
                    success: true,
                    message: 'LTV is within acceptable range',
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Trigger daily interest accrual for all active tranches
     */
    async accrueInterest(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await trancheService.accrueInterestOnAllActiveTranches();
            res.json({
                success: true,
                message: 'Interest accrual process completed',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const creditLineController = new CreditLineController();
