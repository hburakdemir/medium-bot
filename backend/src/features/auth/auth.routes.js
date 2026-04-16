/**
 * Auth Route Tanımları
 * 
 * Tüm /api/auth/* endpoint'leri burada tanımlanır.
 * Middleware atamaları (authenticate) route seviyesinde yapılır.
 */

import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

// ─── Public Route'lar (Token Gerektirmez) ────────────────────────
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

// ─── Protected Route'lar (Token Gerektirir) ──────────────────────
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, authController.updateProfile);

export default router;