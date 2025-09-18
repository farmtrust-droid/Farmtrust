const express = require('express');
const { sustainabilityPlaceholder } = require('../controllers/sustainabilityController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.get('/', authenticateJWT, sustainabilityPlaceholder);

module.exports = router;