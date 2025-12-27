interface AuditLogParams {
    entityType: string;
    entityId: string;
    action: string;
    oldValue?: object | null;
    newValue?: object | null;
    performedBy?: string | null;
    ipAddress?: string | null;
}
export declare function createAuditLog(params: AuditLogParams): Promise<void>;
export declare const AuditActions: {
    readonly STATUS_CHANGE: "STATUS_CHANGE";
    readonly CREATE: "CREATE";
    readonly UPDATE: "UPDATE";
    readonly DELETE: "DELETE";
    readonly APPROVE: "APPROVE";
    readonly REJECT: "REJECT";
    readonly SUBMIT: "SUBMIT";
    readonly DISBURSE: "DISBURSE";
    readonly PAYMENT: "PAYMENT";
    readonly PREPAYMENT: "PREPAYMENT";
    readonly CLOSE: "CLOSE";
    readonly NAV_UPDATE: "NAV_UPDATE";
    readonly LIEN_RELEASE: "LIEN_RELEASE";
};
export declare const AuditEntityTypes: {
    readonly LOAN_APPLICATION: "LOAN_APPLICATION";
    readonly LOAN: "LOAN";
    readonly COLLATERAL: "COLLATERAL";
    readonly USER: "USER";
    readonly LOAN_PRODUCT: "LOAN_PRODUCT";
};
export {};
//# sourceMappingURL=auditLog.d.ts.map