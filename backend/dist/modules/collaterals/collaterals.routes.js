"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collaterals_controller_1 = require("./collaterals.controller");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const collaterals_schema_1 = require("./collaterals.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', (req, res, next) => collaterals_controller_1.collateralController.findAll(req, res, next));
router.post('/', (0, validate_middleware_1.validate)(collaterals_schema_1.createCollateralSchema), (req, res, next) => collaterals_controller_1.collateralController.create(req, res, next));
router.patch('/:id/update-nav', (0, validate_middleware_1.validate)(collaterals_schema_1.updateNavSchema), (req, res, next) => collaterals_controller_1.collateralController.updateNav(req, res, next));
router.post('/:id/request-release', (req, res, next) => collaterals_controller_1.collateralController.requestRelease(req, res, next));
router.post('/:id/complete-release', (0, auth_middleware_1.authorize)('ADMIN'), (req, res, next) => collaterals_controller_1.collateralController.completeRelease(req, res, next));
exports.default = router;
//# sourceMappingURL=collaterals.routes.js.map