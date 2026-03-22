import { Response } from "express";
import prisma from "../lib/prisma";
import { getErrorMessage } from "../lib/http";
import { normalizeStoredAssetUrl } from "../lib/uploads";
import { AuthRequest } from "../middlewares/auth.middleware";
import { awardProgressEvent } from "../services/gamification.service";

export const getMyProgress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const progress = await prisma.progress.findMany({
      where: { userId: req.user.id },
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
    });

    res.status(200).json(
      progress.map((item) => ({
        ...item,
        book: item.book
          ? {
              ...item.book,
              coverImage: normalizeStoredAssetUrl(item.book.coverImage) ?? "",
            }
          : item.book,
      })),
    );
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const upsertProgress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const { bookId, percentage, currentPage, currentTime } = req.body as {
      bookId?: string;
      percentage?: number;
      currentPage?: number;
      currentTime?: number;
    };

    if (!bookId || typeof percentage !== "number") {
      res.status(400).json({ message: "bookId and percentage are required." });
      return;
    }

    const [user, book, existingProgress] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          points: true,
          streakDays: true,
          longestStreak: true,
          lastActiveAt: true,
        },
      }),
      prisma.book.findUnique({
        where: { id: bookId },
        select: {
          id: true,
          title: true,
          format: true,
          pointsReward: true,
        },
      }),
      prisma.progress.findUnique({
        where: {
          userId_bookId: {
            userId: req.user.id,
            bookId,
          },
        },
      }),
    ]);

    if (!user || !book) {
      res.status(404).json({ message: "User or book not found." });
      return;
    }

    const normalizedPercentage = Math.max(0, Math.min(100, percentage));
    const progress = await prisma.progress.upsert({
      where: {
        userId_bookId: {
          userId: req.user.id,
          bookId,
        },
      },
      update: {
        percentage: normalizedPercentage,
        currentPage,
        currentTime,
        isCompleted: normalizedPercentage >= 100,
        completedAt: normalizedPercentage >= 100 ? new Date() : null,
        lastOpenedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        bookId,
        percentage: normalizedPercentage,
        currentPage,
        currentTime,
        isCompleted: normalizedPercentage >= 100,
        completedAt: normalizedPercentage >= 100 ? new Date() : null,
      },
    });

    const reward = await awardProgressEvent({
      userId: req.user.id,
      user,
      book,
      previousPercentage: existingProgress?.percentage ?? 0,
      nextPercentage: normalizedPercentage,
    });

    res.status(200).json({
      progress,
      reward,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
