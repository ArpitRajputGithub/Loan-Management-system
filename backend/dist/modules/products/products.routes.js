"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_service_1 = require("./products.service");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const products = await products_service_1.productService.findAll({
            category: req.query.category,
        });
        res.json({ success: true, data: products });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const product = await products_service_1.productService.findById(req.params.id);
        res.json({ success: true, data: product });
    }
    catch (error) {
        if (error.message === 'Product not found') {
            res.status(404).json({ success: false, error: error.message });
            return;
        }
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=products.routes.js.map