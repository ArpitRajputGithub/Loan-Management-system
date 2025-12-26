import { Router } from 'express';
import { loanController } from './loans.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => loanController.findAll(req, res, next));
router.get('/:id', (req, res, next) => loanController.findById(req, res, next));
router.post('/:id/pay-emi', (req, res, next) => loanController.payEmi(req, res, next));
router.post('/:id/close', authorize('ADMIN'), (req, res, next) => loanController.close(req, res, next));

export default router;
