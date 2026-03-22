import { Router } from "express";
import {
  createAdminBook,
  createAdminCategory,
  deleteAdminBook,
  deleteAdminCategory,
  getAdminBooks,
  getAdminCategories,
  getAdminOrders,
  getAdminOverview,
  getAdminUsers,
  updateAdminBook,
  updateAdminCategory,
  updateAdminUser,
} from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { upload } from "../lib/uploads";

const router = Router();

router.use(authenticate, requireAdmin);
router.get("/overview", getAdminOverview);
router.get("/books", getAdminBooks);
router.post(
  "/books",
  upload.fields([
    { name: "coverImageFile", maxCount: 1 },
    { name: "backdropImageFile", maxCount: 1 },
    { name: "pdfFile", maxCount: 1 },
    { name: "audioFile", maxCount: 1 },
    { name: "sampleAudioFile", maxCount: 1 },
  ]),
  createAdminBook,
);
router.patch(
  "/books/:id",
  upload.fields([
    { name: "coverImageFile", maxCount: 1 },
    { name: "backdropImageFile", maxCount: 1 },
    { name: "pdfFile", maxCount: 1 },
    { name: "audioFile", maxCount: 1 },
    { name: "sampleAudioFile", maxCount: 1 },
  ]),
  updateAdminBook,
);
router.delete("/books/:id", deleteAdminBook);
router.get("/categories", getAdminCategories);
router.post("/categories", createAdminCategory);
router.patch("/categories/:id", updateAdminCategory);
router.delete("/categories/:id", deleteAdminCategory);
router.get("/users", getAdminUsers);
router.patch("/users/:id", updateAdminUser);
router.get("/orders", getAdminOrders);

export default router;
