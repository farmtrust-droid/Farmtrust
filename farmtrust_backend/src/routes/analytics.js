import express from 'express';
import { analyticsPlaceholder } from '../controllers/analyticsController.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get('/', authenticateJWT, analyticsPlaceholder);

export default router;