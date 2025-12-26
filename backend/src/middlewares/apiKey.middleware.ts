import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';

declare global {
    namespace Express {
        interface Request {
            partnerId?: string;
            partnerName?: string;
        }
    }
}

export const authenticateApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            res.status(401).json({
                success: false,
                error: 'API key required. Provide X-API-KEY header.',
            });
            return;
        }

        // Validate API key format
        if (!apiKey.startsWith('1fi_pk_')) {
            res.status(401).json({
                success: false,
                error: 'Invalid API key format.',
            });
            return;
        }

        // Find all active partners and check their hashed keys
        const partners = await prisma.partner.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                apiKeyHash: true,
            },
        });

        // Check API key against each partner's hash
        let matchedPartner = null;
        for (const partner of partners) {
            const isValid = await bcrypt.compare(apiKey, partner.apiKeyHash);
            if (isValid) {
                matchedPartner = partner;
                break;
            }
        }

        if (!matchedPartner) {
            res.status(401).json({
                success: false,
                error: 'Invalid or inactive API key.',
            });
            return;
        }

        // Attach partner info to request
        req.partnerId = matchedPartner.id;
        req.partnerName = matchedPartner.name;

        next();
    } catch (error) {
        console.error('API Key auth error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed.',
        });
    }
};
