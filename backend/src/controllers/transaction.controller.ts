import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { items, totalAmount } = req.body; // Items should be an array of book IDs

    // Basic mock checkout logic
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: totalAmount,
        status: 'COMPLETED', // In a real app, this would be 'PENDING' until payment succeeds
        items, // JSON array
      },
    });

    res.status(201).json({ message: 'Checkout successful', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Error during checkout' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
}
