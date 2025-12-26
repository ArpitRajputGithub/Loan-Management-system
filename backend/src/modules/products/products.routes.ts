import { Router } from 'express';
import { productService } from './products.service';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const products = await productService.findAll({
            category: req.query.category as string,
        });
        res.json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const product = await productService.findById(req.params.id);
        res.json({ success: true, data: product });
    } catch (error: any) {
        if (error.message === 'Product not found') {
            res.status(404).json({ success: false, error: error.message });
            return;
        }
        next(error);
    }
});

export default router;
