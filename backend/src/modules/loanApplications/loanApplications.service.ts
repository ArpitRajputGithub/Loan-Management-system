import prisma from '../../config/database';
import { LoanApplicationStatus } from '@prisma/client';
import {
    CreateLoanApplicationInput,
    UpdateLoanApplicationInput,
    ApproveLoanApplicationInput,
    RejectLoanApplicationInput
} from './loanApplications.schema';
import { generateNumber } from '../../utils/numberGenerator';
import { calculateEmi } from '../../utils/emi.calculator';
import { createAuditLog, AuditActions, AuditEntityTypes } from '../../utils/auditLog';

/**
 * Loan Application Service
 * Handles loan application lifecycle with state machine pattern.
 */

// Valid state transitions
const VALID_TRANSITIONS: Record<LoanApplicationStatus, LoanApplicationStatus[]> = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED'],
    APPROVED: ['DISBURSED', 'REJECTED'],
    REJECTED: [], // Terminal state
    DISBURSED: [], // Terminal state
};

export class LoanApplicationService {

    /**
     * Get all loan applications with optional filters
     */
    async findAll(filters: {
        status?: LoanApplicationStatus;
        userId?: string;
        partnerId?: string;
        page?: number;
        limit?: number;
    }) {
        const { status, userId, partnerId, page = 1, limit = 20 } = filters;

        const where: any = {};
        if (status) where.status = status;
        if (userId) where.userId = userId;
        if (partnerId) where.partnerId = partnerId;

        const [applications, total] = await Promise.all([
            prisma.loanApplication.findMany({
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
            prisma.loanApplication.count({ where }),
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
    async findById(id: string) {
        const application = await prisma.loanApplication.findUnique({
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
    async create(input: CreateLoanApplicationInput, userId: string, partnerId?: string) {
        // Validate loan product exists
        const loanProduct = await prisma.loanProduct.findUnique({
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
            const product = await prisma.product.findUnique({
                where: { id: input.productId },
            });

            if (!product || product.status !== 'ACTIVE') {
                throw new Error('Invalid or unavailable product');
            }
        }

        // Generate application number
        const count = await prisma.loanApplication.count();
        const applicationNumber = generateNumber({ prefix: 'LA', sequence: count + 1 });

        // Create application
        const application = await prisma.loanApplication.create({
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
    async update(id: string, input: UpdateLoanApplicationInput, userId: string) {
        const application = await this.findById(id);

        // Only owner can update
        if (application.userId !== userId) {
            throw new Error('Not authorized to update this application');
        }

        // Can only update DRAFT applications
        if (application.status !== 'DRAFT') {
            throw new Error('Can only update applications in DRAFT status');
        }

        return prisma.loanApplication.update({
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
    async submit(id: string, userId: string) {
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
        const totalEligible = application.collaterals.reduce(
            (sum, c) => sum + c.eligibleAmount, 0
        );

        if (totalEligible < application.requestedAmount) {
            throw new Error(`Insufficient collateral. Eligible: ${totalEligible}, Requested: ${application.requestedAmount}`);
        }

        const updated = await prisma.loanApplication.update({
            where: { id },
            data: { status: 'SUBMITTED' },
        });

        // Audit log
        await createAuditLog({
            entityType: AuditEntityTypes.LOAN_APPLICATION,
            entityId: id,
            action: AuditActions.SUBMIT,
            oldValue: { status: application.status },
            newValue: { status: 'SUBMITTED' },
            performedBy: userId,
        });

        return updated;
    }

    /**
     * Move to under review (Admin)
     */
    async review(id: string) {
        const application = await this.findById(id);
        this.validateTransition(application.status, 'UNDER_REVIEW');

        return prisma.loanApplication.update({
            where: { id },
            data: { status: 'UNDER_REVIEW' },
        });
    }

    /**
     * Approve application (Admin)
     */
    async approve(id: string, input: ApproveLoanApplicationInput, adminUserId?: string) {
        const application = await this.findById(id);
        this.validateTransition(application.status, 'APPROVED');

        // Approved amount can't exceed requested amount
        if (input.approvedAmount > application.requestedAmount) {
            throw new Error('Approved amount cannot exceed requested amount');
        }

        const updated = await prisma.loanApplication.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedAmount: input.approvedAmount,
            },
        });

        // Audit log
        await createAuditLog({
            entityType: AuditEntityTypes.LOAN_APPLICATION,
            entityId: id,
            action: AuditActions.APPROVE,
            oldValue: { status: application.status },
            newValue: { status: 'APPROVED', approvedAmount: input.approvedAmount },
            performedBy: adminUserId,
        });

        return updated;
    }

    /**
     * Reject application (Admin)
     */
    async reject(id: string, input: RejectLoanApplicationInput, adminUserId?: string) {
        const application = await this.findById(id);

        // Can reject from multiple states
        if (!['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].includes(application.status)) {
            throw new Error('Cannot reject application in current status');
        }

        const updated = await prisma.loanApplication.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: input.rejectionReason,
            },
        });

        // Audit log
        await createAuditLog({
            entityType: AuditEntityTypes.LOAN_APPLICATION,
            entityId: id,
            action: AuditActions.REJECT,
            oldValue: { status: application.status },
            newValue: { status: 'REJECTED', reason: input.rejectionReason },
            performedBy: adminUserId,
        });

        return updated;
    }

    /**
     * Disburse loan - creates Loan record and links collaterals
     */
    async disburse(id: string) {
        const application = await this.findById(id);
        this.validateTransition(application.status, 'DISBURSED');

        if (!application.approvedAmount) {
            throw new Error('Application must be approved with an amount before disbursement');
        }

        // Use transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // Generate loan number
            const loanCount = await tx.loan.count();
            const loanNumber = generateNumber({ prefix: 'LN', sequence: loanCount + 1 });

            // Calculate EMI
            const interestRate = Number(application.loanProduct.interestRate);
            const { emiAmount } = calculateEmi({
                principal: application.approvedAmount!,
                annualInterestRate: interestRate,
                tenureMonths: application.selectedTenure,
            });

            // Create loan
            const loan = await tx.loan.create({
                data: {
                    loanNumber,
                    loanApplicationId: id,
                    principal: application.approvedAmount!,
                    interestRate: application.loanProduct.interestRate,
                    tenureMonths: application.selectedTenure,
                    emiAmount,
                    outstandingPrincipal: application.approvedAmount!,
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
                    amount: application.approvedAmount!,
                    principalComponent: application.approvedAmount!,
                    interestComponent: 0,
                    balanceAfter: application.approvedAmount!,
                    reference: `Disbursement for ${loanNumber}`,
                },
            });

            // If there's a 1Fi product, create an order
            if (application.productId) {
                const orderCount = await tx.order.count();
                const orderNumber = generateNumber({ prefix: 'ORD', sequence: orderCount + 1 });

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
        await createAuditLog({
            entityType: AuditEntityTypes.LOAN_APPLICATION,
            entityId: id,
            action: AuditActions.DISBURSE,
            oldValue: { status: 'APPROVED' },
            newValue: { status: 'DISBURSED', loanId: result.id, loanNumber: result.loanNumber },
        });

        return result;
    }

    /**
     * Validate state transition
     */
    private validateTransition(currentStatus: LoanApplicationStatus, targetStatus: LoanApplicationStatus) {
        const allowedTransitions = VALID_TRANSITIONS[currentStatus];

        if (!allowedTransitions.includes(targetStatus)) {
            throw new Error(`Cannot transition from ${currentStatus} to ${targetStatus}`);
        }
    }
}

export const loanApplicationService = new LoanApplicationService();
