const express = require('express');
const { listProduct, getProducts, placeOrder } = require('../controllers/productController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.post('/products', authenticateJWT, listProduct);
router.get('/products', getProducts);
router.post('/orders', authenticateJWT, placeOrder);

module.exports = router;