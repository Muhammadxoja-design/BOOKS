import { Router } from 'express';
import { getBookReviews, addReview } from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true }); // Important if mounting to /books/:bookId/reviews

router.get('/', getBookReviews);
router.post('/', authenticate, addReview);

export default router;
