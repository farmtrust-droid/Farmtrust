// routes/logistics.js
import express from 'express';
import { logisticsPlaceholder } from '../controllers/logisticsController.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get('/', authenticateJWT, logisticsPlaceholder);

export default router; // <-- use export default (ESM style)
