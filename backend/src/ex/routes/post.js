import { Router } from 'express';
import * as postController from '../../controllers/postController.js';
import { authenticate } from '../../middlewares/auth.js';
import upload from '../../middlewares/upload.js';

const router = Router();

router.use(authenticate);

router.post('/', postController.create);
router.get('/', postController.getAll);
router.get('/:id', postController.getById);
router.patch('/:id', postController.update);
router.delete('/:id', postController.remove);
router.post('/upload', upload.single('cover'), postController.uploadCover);

export default router;
