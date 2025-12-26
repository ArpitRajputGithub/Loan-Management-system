import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// GET /api/v1/audit-logs - Get all audit logs (admin only)
router.get('/', authenticate, async (req, res) => {
    try {
        const { entityType, limit = 50 } = req.query;

        const where: Record<string, unknown> = {};
        if (entityType) {
            where.entityType = entityType as string;
        }

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string),
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
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
    }
});

export default router;
