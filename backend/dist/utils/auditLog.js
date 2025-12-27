"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEntityTypes = exports.AuditActions = void 0;
exports.createAuditLog = createAuditLog;
const database_1 = __importDefault(require("../config/database"));
async function createAuditLog(params) {
    try {
        await database_1.default.auditLog.create({
            data: {
                entityType: params.entityType,
                entityId: params.entityId,
                action: params.action,
                oldValue: params.oldValue,
                newValue: params.newValue,
                performedBy: params.performedBy || null,
                ipAddress: params.ipAddress || null,
            },
        });
    }
    catch (error) {
        // Log error but don't throw - audit logging shouldn't break main functionality
        console.error('Failed to create audit log:', error);
    }
}
// Common audit actions
exports.AuditActions = {
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
};
// Entity types
exports.AuditEntityTypes = {
    LOAN_APPLICATION: 'LOAN_APPLICATION',
    LOAN: 'LOAN',
    COLLATERAL: 'COLLATERAL',
    USER: 'USER',
    LOAN_PRODUCT: 'LOAN_PRODUCT',
};
//# sourceMappingURL=auditLog.js.map