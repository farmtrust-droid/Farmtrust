import express from 'express';
import { register, login, sendOTC, verifyOTC, getNonce, verifyWallet } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otc', sendOTC);
router.post('/verify-otc', verifyOTC);
router.post('/nonce/:address', getNonce);
router.post('/verify-wallet', verifyWallet);

export default router;