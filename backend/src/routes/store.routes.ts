import { Router } from "express";
import {
  addCartItem,
  checkout,
  getCart,
  getOrders,
  removeCartItem,
  updateCartItem,
} from "../controllers/store.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/cart", getCart);
router.post("/cart/items", addCartItem);
router.patch("/cart/items/:itemId", updateCartItem);
router.delete("/cart/items/:itemId", removeCartItem);
router.post("/checkout", checkout);
router.get("/orders", getOrders);

export default router;
