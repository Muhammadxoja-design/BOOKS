import { Router } from 'express';
import { getLeaderboard, submitQuiz } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { getMe } from '../controllers/auth.controller';

const router = Router();

router.get('/me', authenticate, getMe);
router.get('/leaderboard', getLeaderboard);
router.post('/quiz', authenticate, submitQuiz);

export default router;
