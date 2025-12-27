"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loans_controller_1 = require("./loans.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', (req, res, next) => loans_controller_1.loanController.findAll(req, res, next));
router.get('/:id', (req, res, next) => loans_controller_1.loanController.findById(req, res, next));
router.post('/:id/pay-emi', (req, res, next) => loans_controller_1.loanController.payEmi(req, res, next));
router.post('/:id/close', (0, auth_middleware_1.authorize)('ADMIN'), (req, res, next) => loans_controller_1.loanController.close(req, res, next));
exports.default = router;
//# sourceMappingURL=loans.routes.js.map