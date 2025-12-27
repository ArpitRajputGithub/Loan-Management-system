"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateApiKey = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const authenticateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
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
        const partners = await database_1.default.partner.findMany({
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
            const isValid = await bcryptjs_1.default.compare(apiKey, partner.apiKeyHash);
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
    }
    catch (error) {
        console.error('API Key auth error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed.',
        });
    }
};
exports.authenticateApiKey = authenticateApiKey;
//# sourceMappingURL=apiKey.middleware.js.map