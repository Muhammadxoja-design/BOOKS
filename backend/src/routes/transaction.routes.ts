import { Router } from 'express';
import { checkout, getTransactions } from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/checkout', checkout);
router.get('/', getTransactions);

export default router;
