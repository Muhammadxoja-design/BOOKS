import { Router } from "express";
import {
  getDashboard,
  getLeaderboard,
  getRecommendations,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/leaderboard", getLeaderboard);
router.get("/dashboard", authenticate, getDashboard);
router.get("/recommendations", authenticate, getRecommendations);

export default router;
