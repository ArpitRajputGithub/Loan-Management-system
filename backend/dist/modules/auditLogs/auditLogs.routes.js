"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// GET /api/v1/audit-logs - Get all audit logs (admin only)
router.get('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { entityType, limit = 50 } = req.query;
        const where = {};
        if (entityType) {
            where.entityType = entityType;
        }
        const logs = await database_1.default.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: logs,
        });
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
    }
});
exports.default = router;
//# sourceMappingURL=auditLogs.routes.js.map