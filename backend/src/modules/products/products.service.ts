import prisma from '../../config/database';

/**
 * Products Service - 1Fi shopping catalog
 */
export class ProductService {

    async findAll(filters: { category?: string; status?: string }) {
        const where: any = { status: 'ACTIVE' };
        if (filters.category) where.category = filters.category;

        return prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error('Product not found');
        return product;
    }

    async create(input: {
        name: string;
        description?: string;
        category: string;
        brand?: string;
        price: number;
        imageUrl?: string;
        availableTenures: number[];
        stockQuantity: number;
    }) {
        return prisma.product.create({ data: input });
    }
}

export const productService = new ProductService();
