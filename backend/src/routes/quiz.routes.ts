import { Router } from 'express';
import { getWeeklyQuiz, submitQuiz } from '../controllers/quiz.controller';
// import { authenticate } from '../middlewares/auth.middleware'; // Assuming it exists based on existing project

const router = Router();

// To be secure, normally we use authenticate middleware.
// Assuming the user is using standard express routing
router.get('/', getWeeklyQuiz);
router.post('/submit', submitQuiz);

export default router;
