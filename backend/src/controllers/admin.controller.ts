import fs from "fs";
import path from "path";
import { Prisma, UserRole } from "@prisma/client";
import { Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler } from "../lib/async-handler";
import { AppError } from "../lib/errors";
import { slugify } from "../lib/slug";
import { toPublicAssetUrl } from "../lib/uploads";
import { AuthRequest } from "../middlewares/auth.middleware";

const adminBookSelect = Prisma.validator<Prisma.BookSelect>()({
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  author: true,
  description: true,
  shortDescription: true,
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
  stock: true,
  sampleAudioUrl: true,
  audioUrl: true,
  pdfUrl: true,
  quote: true,
  pointsReward: true,
  isFeatured: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      accentColor: true,
    },
  },
  _count: {
    select: {
      progresses: true,
      discussions: true,
    },
  },
});

type AdminBookRecord = Prisma.BookGetPayload<{
  select: typeof adminBookSelect;
}>;

const uploadRoot = path.resolve(__dirname, "../..");

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const normalizeAsset = (value?: string | null) => {
  if (!value) {
    return null;
  }

  if (isHttpUrl(value)) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return toPublicAssetUrl(value);
  }

  return value;
};

const normalizeIncomingAssetReference = (value?: string | null) => {
  if (!value) {
    return null;
  }

  if (value.startsWith("/uploads/")) {
    return value;
  }

  try {
    const parsedUrl = new URL(value);

    if (parsedUrl.pathname.startsWith("/uploads/")) {
      return parsedUrl.pathname;
    }
  } catch {
    return value;
  }

  return value;
};

const mapAdminBook = (book: AdminBookRecord) => ({
  ...book,
  coverImage: normalizeAsset(book.coverImage) ?? "",
  backdropImage: normalizeAsset(book.backdropImage),
  sampleAudioUrl: normalizeAsset(book.sampleAudioUrl),
  audioUrl: normalizeAsset(book.audioUrl),
  pdfUrl: normalizeAsset(book.pdfUrl),
});

const getUploadedFilePath = (
  files: AuthRequest["files"],
  fieldName: string,
): string | null => {
  if (!files || Array.isArray(files)) {
    return null;
  }

  const file = files[fieldName]?.[0];

  if (!file) {
    return null;
  }

  return `/uploads/${path.relative(path.join(uploadRoot, "uploads"), file.path).replace(/\\/g, "/")}`;
};

const deleteLocalAsset = (value?: string | null) => {
  if (!value || !value.startsWith("/uploads/")) {
    return;
  }

  const filePath = path.join(uploadRoot, value.replace(/^\//, ""));

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const readString = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const readOptionalString = (value: unknown) => {
  const normalized = readString(value);
  return normalized ? normalized : null;
};

const readNumber = (value: unknown, fieldName: string, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new AppError(`${fieldName} must be a valid number.`, 400);
  }

  return parsed;
};

const readOptionalNumber = (value: unknown, fieldName: string) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return readNumber(value, fieldName);
};

const readBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
};

const validateBookPayload = (body: Record<string, unknown>, files: AuthRequest["files"]) => {
  const title = readString(body.title);
  const author = readString(body.author);
  const description = readString(body.description);
  const shortDescription = readString(body.shortDescription);
  const format = readString(body.format).toUpperCase();
  const coverImage =
    getUploadedFilePath(files, "coverImageFile") ??
    normalizeIncomingAssetReference(readOptionalString(body.coverImage));

  if (!title || !author || !description || !shortDescription || !format) {
    throw new AppError("Title, author, descriptions, and format are required.", 400);
  }

  if (!["AUDIO", "PDF", "STORE"].includes(format)) {
    throw new AppError("Book format must be AUDIO, PDF, or STORE.", 400);
  }

  if (!coverImage) {
    throw new AppError("Book cover image is required.", 400);
  }

  return {
    slug: slugify(readString(body.slug) || title),
    title,
    subtitle: readOptionalString(body.subtitle),
    author,
    description,
    shortDescription,
    coverImage,
    backdropImage:
      getUploadedFilePath(files, "backdropImageFile") ??
      normalizeIncomingAssetReference(readOptionalString(body.backdropImage)),
    format: format as "AUDIO" | "PDF" | "STORE",
    language: readString(body.language) || "Uzbek",
    level: readString(body.level) || "All Levels",
    price: readNumber(body.price, "Price", 0),
    salePrice: readOptionalNumber(body.salePrice, "Sale price"),
    rating: readNumber(body.rating, "Rating", 0),
    reviewCount: Math.round(readNumber(body.reviewCount, "Review count", 0)),
    pagesCount: readOptionalNumber(body.pagesCount, "Pages count"),
    audioDuration: readOptionalNumber(body.audioDuration, "Audio duration"),
    stock: readOptionalNumber(body.stock, "Stock"),
    sampleAudioUrl:
      getUploadedFilePath(files, "sampleAudioFile") ??
      normalizeIncomingAssetReference(readOptionalString(body.sampleAudioUrl)),
    audioUrl:
      getUploadedFilePath(files, "audioFile") ??
      normalizeIncomingAssetReference(readOptionalString(body.audioUrl)),
    pdfUrl:
      getUploadedFilePath(files, "pdfFile") ??
      normalizeIncomingAssetReference(readOptionalString(body.pdfUrl)),
    quote: readOptionalString(body.quote),
    pointsReward: Math.round(readNumber(body.pointsReward, "Points reward", 20)),
    isFeatured: readBoolean(body.isFeatured, false),
    isPublished: readBoolean(body.isPublished, true),
    categoryId: readOptionalString(body.categoryId),
  };
};

const assertUniqueCategorySlug = async (slug: string, categoryId?: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingCategory && existingCategory.id !== categoryId) {
    throw new AppError("A category with this slug already exists.", 409);
  }
};

const assertUniqueBookSlug = async (slug: string, bookId?: string) => {
  const existingBook = await prisma.book.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingBook && existingBook.id !== bookId) {
    throw new AppError("A book with this slug already exists.", 409);
  }
};

export const getAdminOverview = asyncHandler(async (_req: AuthRequest, res: Response) => {
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
    recentOrders: recentOrders.map((order) => ({
      ...order,
      user: order.user
        ? {
            ...order.user,
            email: order.user.email ?? "",
          }
        : null,
    })),
    recentUsers: recentUsers.map((user) => ({
      ...user,
      email: user.email ?? "",
    })),
    topBooks,
  });
});

export const getAdminUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const search = readString(req.query.search);

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { telegramUsername: { contains: search, mode: "insensitive" } },
            { telegramId: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      telegramId: true,
      telegramUsername: true,
      authProvider: true,
      role: true,
      isActive: true,
      points: true,
      streakDays: true,
      createdAt: true,
    },
  });

  res.status(200).json(
    users.map((user) => ({
      ...user,
      email: user.email ?? "",
    })),
  );
});

export const updateAdminUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = readString(req.params.id);
  const role = readOptionalString(req.body?.role);
  const isActive =
    req.body?.isActive === undefined ? undefined : readBoolean(req.body.isActive, true);

  if (!role && isActive === undefined) {
    throw new AppError("Provide role and/or isActive to update the user.", 400);
  }

  if (role && !Object.values(UserRole).includes(role as UserRole)) {
    throw new AppError("Role must be USER or ADMIN.", 400);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      role: role as UserRole | undefined,
      isActive,
    },
    select: {
      id: true,
      name: true,
      email: true,
      telegramId: true,
      telegramUsername: true,
      authProvider: true,
      role: true,
      isActive: true,
      points: true,
      streakDays: true,
      createdAt: true,
    },
  });

  res.status(200).json({
    ...user,
    email: user.email ?? "",
  });
});

export const getAdminCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          books: true,
        },
      },
    },
  });

  res.status(200).json(
    categories.map((category) => ({
      ...category,
      bookCount: category._count.books,
    })),
  );
});

export const createAdminCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const name = readString(req.body?.name);
  const description = readString(req.body?.description);
  const accentColor = readString(req.body?.accentColor) || "#0F766E";
  const slug = slugify(readString(req.body?.slug) || name);

  if (!name || !description) {
    throw new AppError("Category name and description are required.", 400);
  }

  await assertUniqueCategorySlug(slug);

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      accentColor,
    },
  });

  res.status(201).json(category);
});

export const updateAdminCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categoryId = readString(req.params.id);
  const name = readString(req.body?.name);
  const description = readString(req.body?.description);
  const accentColor = readString(req.body?.accentColor) || "#0F766E";
  const slug = slugify(readString(req.body?.slug) || name);

  if (!name || !description) {
    throw new AppError("Category name and description are required.", 400);
  }

  await assertUniqueCategorySlug(slug, categoryId);

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name,
      slug,
      description,
      accentColor,
    },
  });

  res.status(200).json(category);
});

export const deleteAdminCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categoryId = readString(req.params.id);

  const linkedBooksCount = await prisma.book.count({
    where: { categoryId },
  });

  if (linkedBooksCount > 0) {
    throw new AppError("This category still has books assigned to it.", 409);
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  res.status(204).send();
});

export const getAdminBooks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const search = readString(req.query.search);
  const categoryId = readOptionalString(req.query.categoryId);
  const format = readOptionalString(req.query.format);
  const published = readOptionalString(req.query.published);

  const books = await prisma.book.findMany({
    where: {
      categoryId: categoryId ?? undefined,
      format: format ? (format.toUpperCase() as "AUDIO" | "PDF" | "STORE") : undefined,
      isPublished:
        published === "all"
          ? undefined
          : published === null
            ? undefined
            : published === "true",
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { author: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: [{ createdAt: "desc" }],
    select: adminBookSelect,
  });

  res.status(200).json(books.map(mapAdminBook));
});

export const createAdminBook = asyncHandler(async (req: AuthRequest, res: Response) => {
  const payload = validateBookPayload(req.body as Record<string, unknown>, req.files);
  await assertUniqueBookSlug(payload.slug);

  const book = await prisma.book.create({
    data: payload,
    select: adminBookSelect,
  });

  res.status(201).json(mapAdminBook(book));
});

export const updateAdminBook = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bookId = readString(req.params.id);

  const existingBook = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      coverImage: true,
      backdropImage: true,
      sampleAudioUrl: true,
      audioUrl: true,
      pdfUrl: true,
    },
  });

  if (!existingBook) {
    throw new AppError("Book not found.", 404);
  }

  const payload = validateBookPayload(req.body as Record<string, unknown>, req.files);
  await assertUniqueBookSlug(payload.slug, bookId);

  const uploadedCover = getUploadedFilePath(req.files, "coverImageFile");
  const uploadedBackdrop = getUploadedFilePath(req.files, "backdropImageFile");
  const uploadedSampleAudio = getUploadedFilePath(req.files, "sampleAudioFile");
  const uploadedAudio = getUploadedFilePath(req.files, "audioFile");
  const uploadedPdf = getUploadedFilePath(req.files, "pdfFile");

  if (uploadedCover && existingBook.coverImage !== uploadedCover) {
    deleteLocalAsset(existingBook.coverImage);
  }

  if (uploadedBackdrop && existingBook.backdropImage !== uploadedBackdrop) {
    deleteLocalAsset(existingBook.backdropImage);
  }

  if (uploadedSampleAudio && existingBook.sampleAudioUrl !== uploadedSampleAudio) {
    deleteLocalAsset(existingBook.sampleAudioUrl);
  }

  if (uploadedAudio && existingBook.audioUrl !== uploadedAudio) {
    deleteLocalAsset(existingBook.audioUrl);
  }

  if (uploadedPdf && existingBook.pdfUrl !== uploadedPdf) {
    deleteLocalAsset(existingBook.pdfUrl);
  }

  const book = await prisma.book.update({
    where: { id: bookId },
    data: payload,
    select: adminBookSelect,
  });

  res.status(200).json(mapAdminBook(book));
});

export const deleteAdminBook = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bookId = readString(req.params.id);

  const book = await prisma.book.delete({
    where: { id: bookId },
    select: {
      coverImage: true,
      backdropImage: true,
      sampleAudioUrl: true,
      audioUrl: true,
      pdfUrl: true,
    },
  });

  deleteLocalAsset(book.coverImage);
  deleteLocalAsset(book.backdropImage);
  deleteLocalAsset(book.sampleAudioUrl);
  deleteLocalAsset(book.audioUrl);
  deleteLocalAsset(book.pdfUrl);

  res.status(204).send();
});

export const getAdminOrders = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          telegramId: true,
        },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(
    orders.map((order) => ({
      ...order,
      user: order.user
        ? {
            ...order.user,
            email: order.user.email ?? "",
          }
        : null,
    })),
  );
});
