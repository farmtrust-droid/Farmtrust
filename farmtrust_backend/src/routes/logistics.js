const express = require('express');
const { logisticsPlaceholder } = require('../controllers/logisticsController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.get('/', authenticateJWT, logisticsPlaceholder);

module.exports = router;