// routes/community.js
import express from 'express';
import { communityPlaceholder } from '../controllers/communityController.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get('/', authenticateJWT, communityPlaceholder);

export default router;