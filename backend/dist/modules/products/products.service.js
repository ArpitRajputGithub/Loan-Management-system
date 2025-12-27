"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
const database_1 = __importDefault(require("../../config/database"));
/**
 * Products Service - 1Fi shopping catalog
 */
class ProductService {
    async findAll(filters) {
        const where = { status: 'ACTIVE' };
        if (filters.category)
            where.category = filters.category;
        return database_1.default.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        const product = await database_1.default.product.findUnique({ where: { id } });
        if (!product)
            throw new Error('Product not found');
        return product;
    }
    async create(input) {
        return database_1.default.product.create({ data: input });
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
//# sourceMappingURL=products.service.js.map