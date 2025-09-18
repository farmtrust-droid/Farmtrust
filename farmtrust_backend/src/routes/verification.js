const express = require('express');
const { verificationPlaceholder } = require('../controllers/verificationController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.get('/', authenticateJWT, verificationPlaceholder);

module.exports = router;