const express = require('express');
const authRoutes = require('./auth');
const productsRoutes = require('./products');
const paymentsRoutes = require('./payments');
const logisticsRoutes = require('./logistics');
const verificationRoutes = require('./verification');
const analyticsRoutes = require('./analytics');
const sustainabilityRoutes = require('./sustainability');
const communityRoutes = require('./community');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/verification', verificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/sustainability', sustainabilityRoutes);
router.use('/community', communityRoutes);

module.exports = router;