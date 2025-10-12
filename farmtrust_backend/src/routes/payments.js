import express from 'express';
import { processPayment } from '../controllers/paymentController.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.post('/process', authenticateJWT, processPayment);

export default router;