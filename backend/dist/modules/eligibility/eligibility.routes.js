"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eligibility_controller_1 = require("./eligibility.controller");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const eligibility_schema_1 = require("./eligibility.schema");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/v1/eligibility/check
 * @desc    Check credit limit eligibility with PAN and mobile
 * @access  Public
 */
router.post('/check', (0, validate_middleware_1.validate)(eligibility_schema_1.eligibilityCheckSchema), (req, res, next) => eligibility_controller_1.eligibilityController.check(req, res, next));
exports.default = router;
//# sourceMappingURL=eligibility.routes.js.map