import { Router } from 'express';
import authRoutes from './auth.route.js';
import postRoutes from './post.js';
import geminiRoutes from './gemini.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/gemini', geminiRoutes);

export default router;
