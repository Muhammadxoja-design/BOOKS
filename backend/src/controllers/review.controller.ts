import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getBookReviews = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { bookId: bookId as string },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

export const addReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    // Check if user has already reviewed
    const existingReview = await prisma.review.findFirst({
        where: { userId: userId as string, bookId: bookId as string }
    });

    if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const review = await prisma.review.create({
      data: {
        userId: userId as string,
        bookId: bookId as string,
        rating,
        comment,
      },
      include: {
        user: { select: { name: true, avatar: true } },
      }
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review' });
  }
};
