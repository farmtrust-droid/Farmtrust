// routes/logistics.js

import express from 'express';
import { createShipment, getShipment, updateShipmentStatus, logTrackingEvent } from '../controllers/logisticsController.js';
import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

router.post('/', authenticateJWT, createShipment);
router.get('/:shipment_id', authenticateJWT, getShipment);
router.patch('/:shipment_id/status', authenticateJWT, updateShipmentStatus);
router.post('/tracking', authenticateJWT, logTrackingEvent);

export default router;