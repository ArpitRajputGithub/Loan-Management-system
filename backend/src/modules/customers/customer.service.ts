import prisma from '../../config/database';
import { CreateCustomerInput, UpdateKycInput } from './customer.validation';
import { KycStatus } from '@prisma/client';

export const customerService = {
    async getAll(page = 1, limit = 20, kycStatus?: KycStatus) {
        const skip = (page - 1) * limit;
        const where = kycStatus ? { kycStatus } : {};

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.customer.count({ where }),
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

    async getById(id: string) {
        return prisma.customer.findUnique({ where: { id } });
    },

    async getByEmail(email: string) {
        return prisma.customer.findUnique({ where: { email } });
    },

    async create(data: CreateCustomerInput) {
        return prisma.customer.create({
            data: {
                ...data,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            },
        });
    },

    async updateKyc(id: string, data: UpdateKycInput) {
        const updateData: Record<string, unknown> = { kycStatus: data.kycStatus };

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

        return prisma.customer.update({
            where: { id },
            data: updateData,
        });
    },

    async getKycStats() {
        const [pending, inProgress, verified, rejected, total] = await Promise.all([
            prisma.customer.count({ where: { kycStatus: 'PENDING' } }),
            prisma.customer.count({ where: { kycStatus: 'IN_PROGRESS' } }),
            prisma.customer.count({ where: { kycStatus: 'VERIFIED' } }),
            prisma.customer.count({ where: { kycStatus: 'REJECTED' } }),
            prisma.customer.count(),
        ]);

        return { pending, inProgress, verified, rejected, total };
    },
};
