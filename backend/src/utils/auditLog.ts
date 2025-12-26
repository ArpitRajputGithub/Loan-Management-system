import { Prisma } from '@prisma/client';
import prisma from '../config/database';

interface AuditLogParams {
    entityType: string;
    entityId: string;
    action: string;
    oldValue?: object | null;
    newValue?: object | null;
    performedBy?: string | null;
    ipAddress?: string | null;
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                entityType: params.entityType,
                entityId: params.entityId,
                action: params.action,
                oldValue: params.oldValue as Prisma.InputJsonValue | undefined,
                newValue: params.newValue as Prisma.InputJsonValue | undefined,
                performedBy: params.performedBy || null,
                ipAddress: params.ipAddress || null,
            },
        });
    } catch (error) {
        // Log error but don't throw - audit logging shouldn't break main functionality
        console.error('Failed to create audit log:', error);
    }
}

// Common audit actions
export const AuditActions = {
    STATUS_CHANGE: 'STATUS_CHANGE',
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    SUBMIT: 'SUBMIT',
    DISBURSE: 'DISBURSE',
    PAYMENT: 'PAYMENT',
    PREPAYMENT: 'PREPAYMENT',
    CLOSE: 'CLOSE',
    NAV_UPDATE: 'NAV_UPDATE',
    LIEN_RELEASE: 'LIEN_RELEASE',
} as const;

// Entity types
export const AuditEntityTypes = {
    LOAN_APPLICATION: 'LOAN_APPLICATION',
    LOAN: 'LOAN',
    COLLATERAL: 'COLLATERAL',
    USER: 'USER',
    LOAN_PRODUCT: 'LOAN_PRODUCT',
} as const;
