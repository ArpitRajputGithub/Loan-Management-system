"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eligibilityController = exports.EligibilityController = void 0;
const eligibility_service_1 = require("./eligibility.service");
class EligibilityController {
    /**
     * POST /api/v1/eligibility/check
     *
     * This is 1Fi's CORE flow - users check their credit limit in 10 seconds
     */
    async check(req, res, next) {
        try {
            const result = await eligibility_service_1.eligibilityService.checkEligibility(req.body);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EligibilityController = EligibilityController;
exports.eligibilityController = new EligibilityController();
//# sourceMappingURL=eligibility.controller.js.map