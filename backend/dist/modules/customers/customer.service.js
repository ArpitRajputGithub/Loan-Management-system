"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerService = void 0;
const database_1 = __importDefault(require("../../config/database"));
exports.customerService = {
    async getAll(page = 1, limit = 20, kycStatus) {
        const skip = (page - 1) * limit;
        const where = kycStatus ? { kycStatus } : {};
        const [customers, total] = await Promise.all([
            database_1.default.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.default.customer.count({ where }),
        ]);
        return {
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },
    async getById(id) {
        return database_1.default.customer.findUnique({ where: { id } });
    },
    async getByEmail(email) {
        return database_1.default.customer.findUnique({ where: { email } });
    },
    async create(data) {
        return database_1.default.customer.create({
            data: {
                ...data,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            },
        });
    },
    async updateKyc(id, data) {
        const updateData = { kycStatus: data.kycStatus };
        if (data.aadhaarVerified !== undefined) {
            updateData.aadhaarVerified = data.aadhaarVerified;
            if (data.aadhaarVerified) {
                updateData.aadhaarVerifiedAt = new Date();
            }
        }
        if (data.panVerified !== undefined) {
            updateData.panVerified = data.panVerified;
            if (data.panVerified) {
                updateData.panVerifiedAt = new Date();
            }
        }
        if (data.kycRejectionReason) {
            updateData.kycRejectionReason = data.kycRejectionReason;
        }
        return database_1.default.customer.update({
            where: { id },
            data: updateData,
        });
    },
    async getKycStats() {
        const [pending, inProgress, verified, rejected, total] = await Promise.all([
            database_1.default.customer.count({ where: { kycStatus: 'PENDING' } }),
            database_1.default.customer.count({ where: { kycStatus: 'IN_PROGRESS' } }),
            database_1.default.customer.count({ where: { kycStatus: 'VERIFIED' } }),
            database_1.default.customer.count({ where: { kycStatus: 'REJECTED' } }),
            database_1.default.customer.count(),
        ]);
        return { pending, inProgress, verified, rejected, total };
    },
};
//# sourceMappingURL=customer.service.js.map