import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalBooks = await prisma.book.count();
    const totalRevenueResult = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
    });
    
    const totalRevenue = totalRevenueResult._sum.amount || 0;

    res.status(200).json({ totalUsers, totalBooks, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};
