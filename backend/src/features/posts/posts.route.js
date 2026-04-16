/**
 * Post Route Tanımları
 * Tüm /api/posts/* endpoint'leri
 */

import { Router } from 'express';
import * as postsController from './posts.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import upload from '../../middlewares/upload.js';

const router = Router();

// Tüm post route'ları authentication gerektirir
router.use(authenticate);

// ─── CRUD Route'ları ─────────────────────────────────────────────
router.post('/', postsController.create);
router.get('/', postsController.getAll);
router.get('/:id', postsController.getById);
router.patch('/:id', postsController.update);
router.delete('/:id', postsController.remove);

// ─── Dosya Yükleme ───────────────────────────────────────────────
// NOT: /upload özel route /:id'den önce tanımlanmalı (Express routing sırası önemli)
router.post('/upload/cover', upload.single('cover'), postsController.uploadCover);

export default router;