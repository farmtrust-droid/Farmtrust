import express from 'express';
import authRoutes from './auth.js';
import { getProfile } from '../controllers/profileController.js';
import productsRoutes from './products.js';
import paymentsRoutes from './payments.js';
import logisticsRoutes from './logistics.js';
import verificationRoutes from './verification.js';
import analyticsRoutes from './analytics.js';
import sustainabilityRoutes from './sustainability.js';
import communityRoutes from './community.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.get('/profile/:userId', getProfile);
router.use('/payments', paymentsRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/verification', verificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/sustainability', sustainabilityRoutes);
router.use('/community', communityRoutes);

export default router;