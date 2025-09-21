import express from 'express';
import { listProduct, getProducts, placeOrder } from '../controllers/productController.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.post('/products', authenticateJWT, listProduct);
router.get('/products', getProducts);
router.post('/orders', authenticateJWT, placeOrder);

export default router;