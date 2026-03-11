import { Router } from 'express';
import { getAllBooks, getBookById, createBook } from '../controllers/book.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', authenticate, createBook); // Should probably be admin only

export default router;
