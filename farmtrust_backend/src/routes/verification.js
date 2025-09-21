// routes/verification.js
import express from 'express';
import { verificationPlaceholder } from '../controllers/verificationController.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get('/', authenticateJWT, verificationPlaceholder);

export default router; // <-- ESM default export
