import { Response } from "express";
import { AnnotationType, BookFormat, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { getErrorMessage } from "../lib/http";
import { AuthRequest } from "../middlewares/auth.middleware";

const bookCardSelect = Prisma.validator<Prisma.BookSelect>()({
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  author: true,
  shortDescription: true,
  description: true,
  coverImage: true,
  backdropImage: true,
  format: true,
  language: true,
  level: true,
  price: true,
  salePrice: true,
  rating: true,
  reviewCount: true,
  pagesCount: true,
  audioDuration: true,
  sampleAudioUrl: true,
  audioUrl: true,
  pdfUrl: true,
  quote: true,
  pointsReward: true,
  category: {
    select: {
      name: true,
      slug: true,
      accentColor: true,
    },
  },
});

export const getBooks = async (req: AuthRequest, res: Response) => {
  try {
    const { format, search, category, featured } = req.query;

    const books = await prisma.book.findMany({
      where: {
        isPublished: true,
        format: format ? (String(format).toUpperCase() as BookFormat) : undefined,
        isFeatured: featured === "true" ? true : undefined,
        category: category
          ? {
              slug: String(category),
            }
          : undefined,
        OR: search
          ? [
              { title: { contains: String(search), mode: "insensitive" } },
              { author: { contains: String(search), mode: "insensitive" } },
              { shortDescription: { contains: String(search), mode: "insensitive" } },
            ]
          : undefined,
      },
      select: {
        ...bookCardSelect,
        progresses: req.user?.id
          ? {
              where: { userId: req.user.id },
              select: {
                percentage: true,
                currentPage: true,
                currentTime: true,
              },
            }
          : false,
      },
      orderBy: [{ isFeatured: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
    });

    res.status(200).json(
      books.map((book: (typeof books)[number]) => ({
        ...book,
        currentPrice: book.salePrice ?? book.price,
        progress: Array.isArray(book.progresses) ? book.progresses[0] ?? null : null,
      })),
    );
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getBookBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const slug = String(req.params.slug);

    const book = await prisma.book.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
            accentColor: true,
          },
        },
        discussions: {
          orderBy: { createdAt: "desc" },
          take: 8,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                headline: true,
              },
            },
          },
        },
        annotations: req.user?.id
          ? {
              where: { userId: req.user.id },
              orderBy: { createdAt: "desc" },
            }
          : false,
        progresses: req.user?.id
          ? {
              where: { userId: req.user.id },
              take: 1,
            }
          : false,
      },
    });

    if (!book) {
      res.status(404).json({ message: "Book not found." });
      return;
    }

    const relatedBooks = await prisma.book.findMany({
      where: {
        id: { not: book.id },
        isPublished: true,
        categoryId: book.categoryId ?? undefined,
      },
      select: bookCardSelect,
      take: 4,
      orderBy: { rating: "desc" },
    });

    res.status(200).json({
      ...book,
      currentPrice: book.salePrice ?? book.price,
      progress: Array.isArray(book.progresses) ? book.progresses[0] ?? null : null,
      annotations: Array.isArray(book.annotations) ? book.annotations : [],
      relatedBooks,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getDiscussions = async (req: AuthRequest, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const book = await prisma.book.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!book) {
      res.status(404).json({ message: "Book not found." });
      return;
    }

    const discussions = await prisma.discussion.findMany({
      where: { bookId: book.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            headline: true,
          },
        },
      },
    });

    res.status(200).json(discussions);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const addDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const slug = String(req.params.slug);
    const { content } = req.body as { content?: string };

    if (!content?.trim()) {
      res.status(400).json({ message: "Discussion content is required." });
      return;
    }

    const book = await prisma.book.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!book) {
      res.status(404).json({ message: "Book not found." });
      return;
    }

    const discussion = await prisma.discussion.create({
      data: {
        userId: req.user.id,
        bookId: book.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            headline: true,
          },
        },
      },
    });

    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getAnnotations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const slug = String(req.params.slug);
    const book = await prisma.book.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!book) {
      res.status(404).json({ message: "Book not found." });
      return;
    }

    const annotations = await prisma.annotation.findMany({
      where: {
        userId: req.user.id,
        bookId: book.id,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(annotations);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const addAnnotation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const slug = String(req.params.slug);
    const { type, quote, content, color, page, timestamp } = req.body as {
      type?: AnnotationType;
      quote?: string;
      content?: string;
      color?: string;
      page?: number;
      timestamp?: number;
    };

    if (!type || !Object.values(AnnotationType).includes(type)) {
      res.status(400).json({ message: "Valid annotation type is required." });
      return;
    }

    const book = await prisma.book.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!book) {
      res.status(404).json({ message: "Book not found." });
      return;
    }

    const annotation = await prisma.annotation.create({
      data: {
        userId: req.user.id,
        bookId: book.id,
        type,
        quote: quote?.trim(),
        content: content?.trim(),
        color: color ?? undefined,
        page,
        timestamp,
      },
    });

    res.status(201).json(annotation);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
