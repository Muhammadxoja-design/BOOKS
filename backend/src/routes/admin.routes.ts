import { Router } from "express";
import {
  getAdminBooks,
  getAdminOrders,
  getAdminOverview,
  getAdminUsers,
} from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, requireAdmin);
router.get("/overview", getAdminOverview);
router.get("/books", getAdminBooks);
router.get("/users", getAdminUsers);
router.get("/orders", getAdminOrders);

export default router;
