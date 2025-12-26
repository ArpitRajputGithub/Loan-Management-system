import prisma from '../../config/database';
import { CreateLoanProductInput, UpdateLoanProductInput } from './loanProducts.schema';

/**
 * Loan Products Service
 * Manages loan product configurations and rules.
 */
export class LoanProductService {

    /**
     * Get all loan products (optionally filter by status)
     */
    async findAll(includeInactive: boolean = false) {
        return prisma.loanProduct.findMany({
            where: includeInactive ? {} : { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get a loan product by ID
     */
    async findById(id: string) {
        const product = await prisma.loanProduct.findUnique({
            where: { id },
        });

        if (!product) {
            throw new Error('Loan product not found');
        }

        return product;
    }

    /**
     * Create a new loan product
     */
    async create(input: CreateLoanProductInput) {
        return prisma.loanProduct.create({
            data: {
                name: input.name,
                description: input.description,
                interestRate: input.interestRate,
                processingFeePercent: input.processingFeePercent,
                minAmount: input.minAmount,
                maxAmount: input.maxAmount,
                minTenureMonths: input.minTenureMonths,
                maxTenureMonths: input.maxTenureMonths,
                equityLtv: input.equityLtv,
                debtLtv: input.debtLtv,
            },
        });
    }

    /**
     * Update a loan product
     */
    async update(id: string, input: UpdateLoanProductInput) {
        // Check if product exists
        await this.findById(id);

        return prisma.loanProduct.update({
            where: { id },
            data: input,
        });
    }

    /**
     * Toggle product status (Active/Inactive)
     * We don't delete products - just deactivate them
     */
    async toggleStatus(id: string) {
        const product = await this.findById(id);

        return prisma.loanProduct.update({
            where: { id },
            data: {
                status: product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            },
        });
    }
}

export const loanProductService = new LoanProductService();
