import { Router } from "express";
import { getWeeklyQuiz, submitWeeklyQuiz } from "../controllers/quiz.controller";
import {
  authenticate,
  optionalAuthenticate,
} from "../middlewares/auth.middleware";

const router = Router();

router.get("/weekly", optionalAuthenticate, getWeeklyQuiz);
router.post("/weekly/submit", authenticate, submitWeeklyQuiz);

export default router;
