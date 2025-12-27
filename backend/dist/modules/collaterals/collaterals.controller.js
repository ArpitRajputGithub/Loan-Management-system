"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collateralController = exports.CollateralController = void 0;
const collaterals_service_1 = require("./collaterals.service");
class CollateralController {
    async findAll(req, res, next) {
        try {
            const { loanApplicationId, loanId, lienStatus } = req.query;
            const collaterals = await collaterals_service_1.collateralService.findAll({
                loanApplicationId: loanApplicationId,
                loanId: loanId,
                lienStatus: lienStatus,
            });
            res.json({ success: true, data: collaterals });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const collateral = await collaterals_service_1.collateralService.create(req.body, req.user.userId);
            res.status(201).json({
                success: true,
                message: 'Collateral added successfully',
                data: collateral,
            });
        }
        catch (error) {
            if (error.message.includes('Not authorized') || error.message.includes('not found')) {
                res.status(400).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }
    async updateNav(req, res, next) {
        try {
            const collateral = await collaterals_service_1.collateralService.updateNav(req.params.id, req.body);
            res.json({
                success: true,
                message: 'NAV updated successfully',
                data: collateral,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async requestRelease(req, res, next) {
        try {
            const collateral = await collaterals_service_1.collateralService.requestRelease(req.params.id);
            res.json({
                success: true,
                message: 'Lien release requested',
                data: collateral,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async completeRelease(req, res, next) {
        try {
            const collateral = await collaterals_service_1.collateralService.completeRelease(req.params.id);
            res.json({
                success: true,
                message: 'Collateral released successfully',
                data: collateral,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.CollateralController = CollateralController;
exports.collateralController = new CollateralController();
//# sourceMappingURL=collaterals.controller.js.map