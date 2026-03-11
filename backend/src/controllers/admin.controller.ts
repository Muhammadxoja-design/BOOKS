import { Response } from "express";
import prisma from "../lib/prisma";
import { getErrorMessage } from "../lib/http";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getAdminOverview = async (_req: AuthRequest, res: Response) => {
  try {
    const [userCount, bookCount, orderCount, revenueStats, recentOrders, recentUsers, topBooks] =
      await Promise.all([
        prisma.user.count(),
        prisma.book.count(),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { total: true },
        }),
        prisma.order.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: true,
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            points: true,
            streakDays: true,
            createdAt: true,
          },
        }),
        prisma.book.findMany({
          orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
          take: 6,
          select: {
            id: true,
            slug: true,
            title: true,
            format: true,
            rating: true,
            reviewCount: true,
            isFeatured: true,
          },
        }),
      ]);

    res.status(200).json({
      stats: {
        userCount,
        bookCount,
        orderCount,
        revenue: revenueStats._sum.total ?? 0,
      },
      recentOrders,
      recentUsers,
      topBooks,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getAdminUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ points: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        streakDays: true,
        createdAt: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getAdminBooks = async (_req: AuthRequest, res: Response) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: [{ createdAt: "desc" }, { rating: "desc" }],
      include: {
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            progresses: true,
            discussions: true,
          },
        },
      },
    });

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getAdminOrders = async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
