const express = require('express');
const { communityPlaceholder } = require('../controllers/communityController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.get('/', authenticateJWT, communityPlaceholder);

module.exports = router;