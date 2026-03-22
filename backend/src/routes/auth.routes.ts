import { Router } from "express";
import {
  getMe,
  googleLogin,
  login,
  register,
  telegramLogin,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/telegram", telegramLogin);
router.get("/me", authenticate, getMe);

export default router;
