const express = require('express');
const { analyticsPlaceholder } = require('../controllers/analyticsController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.get('/', authenticateJWT, analyticsPlaceholder);

module.exports = router;