import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { points: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        points: true,
        avatar: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { score } = req.body; // e.g., 0 to 100

    if (score >= 80) {
      await prisma.user.update({
        where: { id: userId },
        data: { points: { increment: 100 } },
      });
      res.status(200).json({ message: 'Quiz passed! 100 points awarded.', pointsAwarded: 100 });
    } else {
      res.status(200).json({ message: 'Quiz submitted but score too low for reward.', pointsAwarded: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz' });
  }
};
