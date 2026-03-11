import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { bookId, percentage, lastPos } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const progress = await prisma.progress.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      update: {
        percentage,
        lastPos,
      },
      create: {
        userId,
        bookId,
        percentage,
        lastPos,
      },
    });

    // Award points if percentage is high and not already fully read (simplified logic)
    if (percentage >= 100) {
      await prisma.user.update({
        where: { id: userId },
        data: { points: { increment: 50 }, streakDays: { increment: 1 } },
      });
    } else {
        await prisma.user.update({
            where: { id: userId },
            data: { points: { increment: 1 } },
        });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress' });
  }
};

export const getProgress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const progress = await prisma.progress.findMany({
            where: { userId },
            include: { book: true }
        });
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Error getting progress' });
    }
}
