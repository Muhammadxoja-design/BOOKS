import { Router } from 'express';
import { updateProgress, getProgress } from '../controllers/progress.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', updateProgress);
router.get('/', getProgress);

export default router;
