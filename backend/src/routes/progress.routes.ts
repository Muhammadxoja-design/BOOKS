import { Router } from "express";
import { getMyProgress, upsertProgress } from "../controllers/progress.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/me", getMyProgress);
router.put("/", upsertProgress);

export default router;
