"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanApplicationService = exports.LoanApplicationService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const numberGenerator_1 = require("../../utils/numberGenerator");
const emi_calculator_1 = require("../../utils/emi.calculator");
const auditLog_1 = require("../../utils/auditLog");
/**
 * Loan Application Service
 * Handles loan application lifecycle with state machine pattern.
 */
// Valid state transitions
const VALID_TRANSITIONS = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED'],
    APPROVED: ['DISBURSED', 'REJECTED'],
    REJECTED: [], // Terminal state
    DISBURSED: [], // Terminal state
};
class LoanApplicationService {
    /**
     * Get all loan applications with optional filters
     */
    async findAll(filters) {
        const { status, userId, partnerId, page = 1, limit = 20 } = filters;
        const where = {};
        if (status)
            where.status = status;
        if (userId)
            where.userId = userId;
        if (partnerId)
            where.partnerId = partnerId;
        const [applications, total] = await Promise.all([
            database_1.default.loanApplication.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    loanProduct: { select: { id: true, name: true, interestRate: true } },
                    product: { select: { id: true, name: true, price: true } },
                    collaterals: true,
                    partner: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            database_1.default.loanApplication.count({ where }),
        ]);
        return {
            applications,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get application by ID with full details
     */
    async findById(id) {
        const application = await database_1.default.loanApplication.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                loanProduct: true,
                product: true,
                collaterals: true,
                partner: { select: { id: true, name: true } },
                loan: true,
            },
        });
        if (!application) {
            throw new Error('Loan application not found');
        }
        return application;
    }
    /**
     * Create a new loan application
     */
    async create(input, userId, partnerId) {
        // Validate loan product exists
        const loanProduct = await database_1.default.loanProduct.findUnique({
            where: { id: input.loanProductId },
        });
        if (!loanProduct || loanProduct.status !== 'ACTIVE') {
            throw new Error('Invalid or inactive loan product');
        }
        // Validate amount is within product limits
        if (input.requestedAmount < loanProduct.minAmount || input.requestedAmount > loanProduct.maxAmount) {
            throw new Error(`Amount must be between ${loanProduct.minAmount} and ${loanProduct.maxAmount}`);
        }
        // Validate tenure is within product limits
        if (input.selectedTenure < loanProduct.minTenureMonths || input.selectedTenure > loanProduct.maxTenureMonths) {
            throw new Error(`Tenure must be between ${loanProduct.minTenureMonths} and ${loanProduct.maxTenureMonths} months`);
        }
        // If 1Fi product is specified, validate it exists
        if (input.productId) {
            const product = await database_1.default.product.findUnique({
                where: { id: input.productId },
            });
            if (!product || product.status !== 'ACTIVE') {
                throw new Error('Invalid or unavailable product');
            }
        }
        // Generate application number
        const count = await database_1.default.loanApplication.count();
        const applicationNumber = (0, numberGenerator_1.generateNumber)({ prefix: 'LA', sequence: count + 1 });
        // Create application
        const application = await database_1.default.loanApplication.create({
            data: {
                applicationNumber,
                userId,
                loanProductId: input.loanProductId,
                productId: input.productId,
                requestedAmount: input.requestedAmount,
                selectedTenure: input.selectedTenure,
                status: 'DRAFT',
                createdVia: partnerId ? 'PARTNER_API' : 'PLATFORM',
                partnerId,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                loanProduct: { select: { id: true, name: true } },
                product: { select: { id: true, name: true, price: true } },
            },
        });
        return application;
    }
    /**
     * Update a draft application
     */
    async update(id, input, userId) {
        const application = await this.findById(id);
        // Only owner can update
        if (application.userId !== userId) {
            throw new Error('Not authorized to update this application');
        }
        // Can only update DRAFT applications
        if (application.status !== 'DRAFT') {
            throw new Error('Can only update applications in DRAFT status');
        }
        return database_1.default.loanApplication.update({
            where: { id },
            data: input,
            include: {
                user: { select: { id: true, name: true, email: true } },
                loanProduct: { select: { id: true, name: true } },
            },
        });
    }
    /**
     * Submit application for review
     */
    async submit(id, userId) {
        const application = await this.findById(id);
        // Validate ownership
        if (application.userId !== userId) {
            throw new Error('Not authorized');
        }
        // Validate state transition
        this.validateTransition(application.status, 'SUBMITTED');
        // Validate has collaterals
        if (application.collaterals.length === 0) {
            throw new Error('Please add at least one collateral before submitting');
        }
        // Calculate total eligible amount from collaterals
        const totalEligible = application.collaterals.reduce((sum, c) => sum + c.eligibleAmount, 0);
        if (totalEligible < application.requestedAmount) {
            throw new Error(`Insufficient collateral. Eligible: ${totalEligible}, Requested: ${application.requestedAmount}`);
        }
        const updated = await database_1.default.loanApplication.update({
            where: { id },
            data: { status: 'SUBMITTED' },
        });
        // Audit log
        await (0, auditLog_1.createAuditLog)({
            entityType: auditLog_1.AuditEntityTypes.LOAN_APPLICATION,
            entityId: id,
            action: auditLog_1.AuditActions.SUBMIT,
            oldValue: { status: application.status },
            newValue: { status: 'SUBMITTED' },
            performedBy: userId,
        });
        return updated;
    }
    /**
     * Move to under review (Admin)
     */
    async review(id) {
        const application = await this.findById(id);
        this.validateTransition(application.status, 'UNDER_REVIEW');
        return database_1.default.loanApplication.update({
            where: { id },
            data: { status: 'UNDER_REVIEW' },
        });
    }
    /**
     * Approve application (Admin)
     */
    async approve(id, input, adminUserId) {
        const application = await this.findById(id);
        this.validateTransition(application.status, 'APPROVED');
        // Approved amount can't exceed requested amount
        if (input.approvedAmount > application.requestedAmount) {
            throw new Error('Approved amount cannot exceed requested amount');
        }
        const updated = await database_1.default.loanApplication.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedAmount: input.approvedAmount,
            },
        });
        // Audit log
        await (0, auditLog_1.createAuditLog)({
            entityType: auditLog_1.AuditEntityTypes.LOAN_APPLICATION,
            entityId: id,
            action: auditLog_1.AuditActions.APPROVE,
            oldValue: { status: application.status },
            newValue: { status: 'APPROVED', approvedAmount: input.approvedAmount },
            performedBy: adminUserId,
        });
        return updated;
    }
    /**
     * Reject application (Admin)
     */
    async reject(id, input, adminUserId) {
        const application = await this.findById(id);
        // Can reject from multiple states
        if (!['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].includes(application.status)) {
            throw new Error('Cannot reject application in current status');
        }
        const updated = await database_1.default.loanApplication.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: input.rejectionReason,
            },
        });
        // Audit log
        await (0, auditLog_1.createAuditLog)({
            entityType: auditLog_1.AuditEntityTypes.LOAN_APPLICATION,
            entityId: id,
            action: auditLog_1.AuditActions.REJECT,
            oldValue: { status: application.status },
            newValue: { status: 'REJECTED', reason: input.rejectionReason },
            performedBy: adminUserId,
        });
        return updated;
    }
    /**
     * Disburse loan - creates Loan record and links collaterals
     */
    async disburse(id) {
        const application = await this.findById(id);
        this.validateTransition(application.status, 'DISBURSED');
        if (!application.approvedAmount) {
            throw new Error('Application must be approved with an amount before disbursement');
        }
        // Use transaction to ensure consistency
        const result = await database_1.default.$transaction(async (tx) => {
            // Generate loan number
            const loanCount = await tx.loan.count();
            const loanNumber = (0, numberGenerator_1.generateNumber)({ prefix: 'LN', sequence: loanCount + 1 });
            // Calculate EMI
            const interestRate = Number(application.loanProduct.interestRate);
            const { emiAmount } = (0, emi_calculator_1.calculateEmi)({
                principal: application.approvedAmount,
                annualInterestRate: interestRate,
                tenureMonths: application.selectedTenure,
            });
            // Create loan
            const loan = await tx.loan.create({
                data: {
                    loanNumber,
                    loanApplicationId: id,
                    principal: application.approvedAmount,
                    interestRate: application.loanProduct.interestRate,
                    tenureMonths: application.selectedTenure,
                    emiAmount,
                    outstandingPrincipal: application.approvedAmount,
                    outstandingInterest: 0,
                    status: 'ACTIVE',
                    disbursedAt: new Date(),
                    nextEmiDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                },
            });
            // Update application status
            await tx.loanApplication.update({
                where: { id },
                data: { status: 'DISBURSED' },
            });
            // Update collaterals to link to loan and mark lien as marked
            await tx.collateral.updateMany({
                where: { loanApplicationId: id },
                data: {
                    loanId: loan.id,
                    lienStatus: 'MARKED',
                },
            });
            // Create disbursement transaction
            await tx.loanTransaction.create({
                data: {
                    loanId: loan.id,
                    type: 'DISBURSEMENT',
                    amount: application.approvedAmount,
                    principalComponent: application.approvedAmount,
                    interestComponent: 0,
                    balanceAfter: application.approvedAmount,
                    reference: `Disbursement for ${loanNumber}`,
                },
            });
            // If there's a 1Fi product, create an order
            if (application.productId) {
                const orderCount = await tx.order.count();
                const orderNumber = (0, numberGenerator_1.generateNumber)({ prefix: 'ORD', sequence: orderCount + 1 });
                await tx.order.create({
                    data: {
                        orderNumber,
                        loanId: loan.id,
                        productId: application.productId,
                        quantity: 1,
                        shippingAddress: { address: 'To be updated' }, // In real app, get from user
                        deliveryStatus: 'PENDING',
                    },
                });
            }
            return loan;
        });
        // Audit log for disbursement (outside transaction)
        await (0, auditLog_1.createAuditLog)({
            entityType: auditLog_1.AuditEntityTypes.LOAN_APPLICATION,
            entityId: id,
            action: auditLog_1.AuditActions.DISBURSE,
            oldValue: { status: 'APPROVED' },
            newValue: { status: 'DISBURSED', loanId: result.id, loanNumber: result.loanNumber },
        });
        return result;
    }
    /**
     * Validate state transition
     */
    validateTransition(currentStatus, targetStatus) {
        const allowedTransitions = VALID_TRANSITIONS[currentStatus];
        if (!allowedTransitions.includes(targetStatus)) {
            throw new Error(`Cannot transition from ${currentStatus} to ${targetStatus}`);
        }
    }
}
exports.LoanApplicationService = LoanApplicationService;
exports.loanApplicationService = new LoanApplicationService();
//# sourceMappingURL=loanApplications.service.js.map