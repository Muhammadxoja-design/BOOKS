import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import bookRoutes from './routes/book.routes';
import progressRoutes from './routes/progress.routes';
import reviewRoutes from './routes/review.routes';
import transactionRoutes from './routes/transaction.routes';
import adminRoutes from './routes/admin.routes';
import quizRoutes from './routes/quiz.routes';
import storeRoutes from './routes/store.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/store', storeRoutes);

// Mount reviews explicitly under books or directly
app.use('/api/books/:bookId/reviews', reviewRoutes);

// Optional: static files for uploads
// app.use('/uploads', express.static('uploads'));

export default app;
