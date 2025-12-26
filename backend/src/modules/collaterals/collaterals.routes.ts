import { Router } from 'express';
import { collateralController } from './collaterals.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { createCollateralSchema, updateNavSchema } from './collaterals.schema';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => collateralController.findAll(req, res, next));

router.post(
    '/',
    validate(createCollateralSchema),
    (req, res, next) => collateralController.create(req, res, next)
);

router.patch(
    '/:id/update-nav',
    validate(updateNavSchema),
    (req, res, next) => collateralController.updateNav(req, res, next)
);

router.post('/:id/request-release', (req, res, next) => collateralController.requestRelease(req, res, next));

router.post(
    '/:id/complete-release',
    authorize('ADMIN'),
    (req, res, next) => collateralController.completeRelease(req, res, next)
);

export default router;
