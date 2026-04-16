import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, authController.updateProfile);

export default router;
