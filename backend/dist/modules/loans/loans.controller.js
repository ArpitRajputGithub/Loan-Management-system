"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanController = exports.LoanController = void 0;
const loans_service_1 = require("./loans.service");
class LoanController {
    async findAll(req, res, next) {
        try {
            const { status, page, limit } = req.query;
            const result = await loans_service_1.loanService.findAll({
                status: status,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({ success: true, data: result.loans, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    async findById(req, res, next) {
        try {
            const loan = await loans_service_1.loanService.findById(req.params.id);
            res.json({ success: true, data: loan });
        }
        catch (error) {
            if (error.message === 'Loan not found') {
                res.status(404).json({ success: false, error: error.message });
                return;
            }
            next(error);
        }
    }
    async payEmi(req, res, next) {
        try {
            const { amount } = req.body;
            const loan = await loans_service_1.loanService.recordEmiPayment(req.params.id, amount);
            res.json({ success: true, message: 'EMI payment recorded', data: loan });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async close(req, res, next) {
        try {
            const loan = await loans_service_1.loanService.closeLoan(req.params.id);
            res.json({ success: true, message: 'Loan closed successfully', data: loan });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.LoanController = LoanController;
exports.loanController = new LoanController();
//# sourceMappingURL=loans.controller.js.map