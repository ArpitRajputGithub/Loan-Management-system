"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_service_1 = require("./customer.service");
const customer_validation_1 = require("./customer.validation");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Get all customers with pagination
router.get('/', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const kycStatus = req.query.kycStatus;
        const result = await customer_service_1.customerService.getAll(page, limit, kycStatus);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Get KYC statistics
router.get('/kyc-stats', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const stats = await customer_service_1.customerService.getKycStats();
        res.json(stats);
    }
    catch (error) {
        next(error);
    }
});
// Get customer by ID
router.get('/:id', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const customer = await customer_service_1.customerService.getById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    }
    catch (error) {
        next(error);
    }
});
// Create new customer
router.post('/', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(customer_validation_1.createCustomerSchema), async (req, res, next) => {
    try {
        const existing = await customer_service_1.customerService.getByEmail(req.body.email);
        if (existing) {
            return res.status(400).json({ error: 'Customer with this email already exists' });
        }
        const customer = await customer_service_1.customerService.create(req.body);
        res.status(201).json(customer);
    }
    catch (error) {
        next(error);
    }
});
// Update KYC status
router.patch('/:id/kyc', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(customer_validation_1.updateKycSchema), async (req, res, next) => {
    try {
        const customer = await customer_service_1.customerService.getById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        const updated = await customer_service_1.customerService.updateKyc(req.params.id, req.body);
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=customer.routes.js.map