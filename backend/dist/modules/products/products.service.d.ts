/**
 * Products Service - 1Fi shopping catalog
 */
export declare class ProductService {
    findAll(filters: {
        category?: string;
        status?: string;
    }): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.ProductStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        brand: string | null;
        price: number;
        imageUrl: string | null;
        availableTenures: number[];
        stockQuantity: number;
    }[]>;
    findById(id: string): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.ProductStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        brand: string | null;
        price: number;
        imageUrl: string | null;
        availableTenures: number[];
        stockQuantity: number;
    }>;
    create(input: {
        name: string;
        description?: string;
        category: string;
        brand?: string;
        price: number;
        imageUrl?: string;
        availableTenures: number[];
        stockQuantity: number;
    }): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.ProductStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        brand: string | null;
        price: number;
        imageUrl: string | null;
        availableTenures: number[];
        stockQuantity: number;
    }>;
}
export declare const productService: ProductService;
//# sourceMappingURL=products.service.d.ts.map