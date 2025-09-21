import express from 'express';
import { register, login, sendOTC, verifyOTC, getNonce, verifyWallet } from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, role, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [farmer, buyer, seller, logistics, admin]
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/send-otc:
 *   post:
 *     summary: Send One-Time Code (via email or SMS)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contact, type, role]
 *             properties:
 *               contact:
 *                 type: string
 *                 description: Email or phone number
 *               type:
 *                 type: string
 *                 enum: [email, phone]
 *               role:
 *                 type: string
 *                 enum: [farmer, buyer, seller, logistics, admin]
 *     responses:
 *       200:
 *         description: OTC sent successfully
 */
router.post('/send-otc', sendOTC);

/**
 * @swagger
 * /auth/verify-otc:
 *   post:
 *     summary: Verify One-Time Code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contact, otc, type, name]
 *             properties:
 *               contact:
 *                 type: string
 *               otc:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [email, phone]
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User verified and JWT issued
 *       401:
 *         description: Invalid or expired OTC
 */
router.post('/verify-otc', verifyOTC);

/**
 * @swagger
 * /auth/nonce/{address}:
 *   post:
 *     summary: Get nonce for wallet verification
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nonce generated
 */
router.post('/nonce/:address', getNonce);

/**
 * @swagger
 * /auth/verify-wallet:
 *   post:
 *     summary: Verify wallet ownership using signature
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address, signature, message, role, name]
 *             properties:
 *               address:
 *                 type: string
 *               signature:
 *                 type: string
 *               message:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [farmer, buyer, seller, logistics, admin]
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wallet verified and JWT issued
 *       401:
 *         description: Invalid or expired nonce
 */
router.post('/verify-wallet', verifyWallet);

export default router;
