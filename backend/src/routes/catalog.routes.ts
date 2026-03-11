import { Router } from "express";
import { getHomeFeed, getQuotes } from "../controllers/catalog.controller";

const router = Router();

router.get("/home", getHomeFeed);
router.get("/quotes", getQuotes);

export default router;
