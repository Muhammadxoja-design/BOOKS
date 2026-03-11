import { Response } from "express";
import { BookFormat } from "@prisma/client";
import prisma from "../lib/prisma";
import { getErrorMessage } from "../lib/http";
import { AuthRequest } from "../middlewares/auth.middleware";

const recommendationSelect = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  author: true,
  shortDescription: true,
  coverImage: true,
  format: true,
  rating: true,
  reviewCount: true,
  pagesCount: true,
  audioDuration: true,
  price: true,
  salePrice: true,
  category: {
    select: {
      name: true,
      slug: true,
      accentColor: true,
    },
  },
};

const buildRecommendations = async (userId: string) => {
  const progress = await prisma.progress.findMany({
    where: { userId },
    select: {
      book: {
        select: {
          id: true,
          format: true,
          categoryId: true,
        },
      },
    },
  });

  const startedBookIds = progress.map((item) => item.book.id);
  const topCategoryId =
    progress
      .map((item) => item.book.categoryId)
      .filter(Boolean)
      .reduce<Record<string, number>>((acc, categoryId) => {
        const id = categoryId as string;
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {});

  const favoriteCategoryId =
    Object.entries(topCategoryId).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const recommendations = await prisma.book.findMany({
    where: {
      isPublished: true,
      id: { notIn: startedBookIds },
      format: { not: BookFormat.STORE },
      categoryId: favoriteCategoryId ?? undefined,
    },
    select: recommendationSelect,
    take: 4,
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
  });

  return recommendations.map((book) => ({
    ...book,
    reason: favoriteCategoryId
      ? `Recommended from your strongest category: ${book.category?.name ?? "general"}`
      : "Recommended from trending reader behavior.",
  }));
};

export const getLeaderboard = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ points: "desc" }, { streakDays: "desc" }],
      take: 10,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        headline: true,
        points: true,
        streakDays: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const recommendations = await buildRecommendations(req.user.id);
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const userId = req.user.id;
    const [user, progress, rewards, leaderboard, weeklyQuiz, quotes, orders, recommendations] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            headline: true,
            points: true,
            streakDays: true,
            longestStreak: true,
            lastActiveAt: true,
          },
        }),
        prisma.progress.findMany({
          where: { userId },
          include: {
            book: {
              select: {
                id: true,
                slug: true,
                title: true,
                author: true,
                coverImage: true,
                format: true,
                pagesCount: true,
                audioDuration: true,
                category: {
                  select: {
                    name: true,
                    accentColor: true,
                  },
                },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 6,
        }),
        prisma.rewardEvent.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
        prisma.user.findMany({
          orderBy: [{ points: "desc" }, { streakDays: "desc" }],
          take: 5,
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            points: true,
            streakDays: true,
          },
        }),
        prisma.quiz.findFirst({
          where: { isPublished: true },
          orderBy: { startsAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            startsAt: true,
            endsAt: true,
            attempts: {
              where: { userId },
              select: {
                score: true,
                createdAt: true,
              },
            },
          },
        }),
        prisma.quote.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
        }),
        prisma.order.findMany({
          where: { userId },
          include: {
            items: true,
          },
          take: 3,
          orderBy: { createdAt: "desc" },
        }),
        buildRecommendations(userId),
      ]);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const readingProgress = progress.filter((item) => item.book.format === BookFormat.PDF);
    const listeningProgress = progress.filter((item) => item.book.format === BookFormat.AUDIO);
    const totalReadingHours = listeningProgress.reduce(
      (sum, item) => sum + ((item.currentTime ?? 0) / 3600),
      0,
    );

    res.status(200).json({
      user,
      stats: {
        activeProgressCount: progress.length,
        completedTitles: progress.filter((item) => item.isCompleted).length,
        readingHours: Number(totalReadingHours.toFixed(1)),
      },
      continueReading: readingProgress,
      continueListening: listeningProgress,
      rewards,
      leaderboard,
      weeklyQuiz: weeklyQuiz
        ? {
            ...weeklyQuiz,
            submission: weeklyQuiz.attempts[0] ?? null,
          }
        : null,
      quotes,
      orders,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
