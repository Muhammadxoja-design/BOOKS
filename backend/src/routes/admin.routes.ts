import { Router } from 'express';
import { getDashboardStats } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/stats', getDashboardStats);

export default router;
