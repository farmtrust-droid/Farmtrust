const express = require('express');
const { register, login, sendOTC, verifyOTC, getNonce, verifyWallet } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otc', sendOTC);
router.post('/verify-otc', verifyOTC);
router.post('/nonce/:address', getNonce);
router.post('/verify-wallet', verifyWallet);

module.exports = router;