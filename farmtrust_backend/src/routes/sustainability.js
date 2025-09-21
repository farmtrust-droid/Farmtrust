import express from 'express';
import { sustainabilityPlaceholder } from '../controllers/sustainabilityController.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get('/', authenticateJWT, sustainabilityPlaceholder);

export default router;
