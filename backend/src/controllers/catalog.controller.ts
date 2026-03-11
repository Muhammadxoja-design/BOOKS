import { Request, Response } from "express";
import { BookFormat } from "@prisma/client";
import prisma from "../lib/prisma";
import { getErrorMessage } from "../lib/http";

const baseBookSelect = {
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
  quote: true,
  isFeatured: true,
  category: {
    select: {
      name: true,
      slug: true,
      accentColor: true,
    },
  },
};

export const getHomeFeed = async (_req: Request, res: Response) => {
  try {
    const [featured, audioBooks, pdfBooks, storeBooks, quotes, categories, stats] =
      await Promise.all([
        prisma.book.findMany({
          where: { isFeatured: true, isPublished: true },
          select: baseBookSelect,
          take: 6,
          orderBy: [{ format: "asc" }, { rating: "desc" }],
        }),
        prisma.book.findMany({
          where: { format: BookFormat.AUDIO, isPublished: true },
          select: baseBookSelect,
          take: 4,
          orderBy: { rating: "desc" },
        }),
        prisma.book.findMany({
          where: { format: BookFormat.PDF, isPublished: true },
          select: baseBookSelect,
          take: 4,
          orderBy: { rating: "desc" },
        }),
        prisma.book.findMany({
          where: { format: BookFormat.STORE, isPublished: true },
          select: baseBookSelect,
          take: 4,
          orderBy: { createdAt: "desc" },
        }),
        prisma.quote.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
        }),
        prisma.category.findMany({
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { books: true },
            },
          },
        }),
        Promise.all([
          prisma.user.count(),
          prisma.book.count({ where: { isPublished: true } }),
          prisma.order.aggregate({ _sum: { total: true } }),
        ]),
      ]);

    res.status(200).json({
      hero: {
        title: "Bookora",
        subtitle: "Premium reading, listening, and book commerce in one product.",
        metrics: {
          readers: stats[0],
          titles: stats[1],
          revenue: stats[2]._sum.total ?? 0,
        },
      },
      featured,
      sections: {
        audioBooks,
        pdfBooks,
        storeBooks,
      },
      quotes,
      categories: categories.map((category) => ({
        ...category,
        bookCount: category._count.books,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getQuotes = async (_req: Request, res: Response) => {
  try {
    const quotes = await prisma.quote.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
