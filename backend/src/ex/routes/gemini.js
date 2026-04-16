import { Router } from 'express';
import * as geminiController from '../controllers/geminiController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.post('/generate', geminiController.generate);
router.post('/title', geminiController.generateTitle);

export default router;
