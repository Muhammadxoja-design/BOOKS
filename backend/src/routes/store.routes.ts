import { Router } from 'express';
import { getStoreItems, addToCart, getCart, checkout } from '../controllers/store.controller';

const router = Router();

router.get('/items', getStoreItems);
router.post('/cart', addToCart);
router.get('/cart', getCart);
router.post('/checkout', checkout);

export default router;
