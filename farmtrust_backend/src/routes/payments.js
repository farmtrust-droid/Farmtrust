const express = require('express');
const { processPayment } = require('../controllers/paymentController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.post('/process', authenticateJWT, processPayment);

module.exports = router;