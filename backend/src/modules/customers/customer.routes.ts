import { Router, Request, Response, NextFunction } from 'express';
import { customerService } from './customer.service';
import { createCustomerSchema, updateKycSchema } from './customer.validation';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { KycStatus } from '@prisma/client';

const router = Router();

// Get all customers with pagination
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const kycStatus = req.query.kycStatus as KycStatus | undefined;

        const result = await customerService.getAll(page, limit, kycStatus);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get KYC statistics
router.get('/kyc-stats', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await customerService.getKycStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Get customer by ID
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await customerService.getById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        next(error);
    }
});

// Create new customer
router.post('/', authenticate, validate(createCustomerSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existing = await customerService.getByEmail(req.body.email);
        if (existing) {
            return res.status(400).json({ error: 'Customer with this email already exists' });
        }

        const customer = await customerService.create(req.body);
        res.status(201).json(customer);
    } catch (error) {
        next(error);
    }
});

// Update KYC status
router.patch('/:id/kyc', authenticate, validate(updateKycSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await customerService.getById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const updated = await customerService.updateKyc(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        next(error);
    }
});

export default router;
