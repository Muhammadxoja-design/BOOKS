import { Router } from "express";
import {
  addAnnotation,
  addDiscussion,
  getAnnotations,
  getBookBySlug,
  getBooks,
  getDiscussions,
} from "../controllers/book.controller";
import {
  authenticate,
  optionalAuthenticate,
} from "../middlewares/auth.middleware";

const router = Router();

router.get("/", optionalAuthenticate, getBooks);
router.get("/:slug", optionalAuthenticate, getBookBySlug);
router.get("/:slug/discussions", getDiscussions);
router.post("/:slug/discussions", authenticate, addDiscussion);
router.get("/:slug/annotations", authenticate, getAnnotations);
router.post("/:slug/annotations", authenticate, addAnnotation);

export default router;
