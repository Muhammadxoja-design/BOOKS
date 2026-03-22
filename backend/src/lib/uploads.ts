import fs from "fs";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { AppError } from "./errors";

const projectRoot = path.resolve(__dirname, "../..");
const uploadsRoot = path.join(projectRoot, "uploads");

const fileGroups = {
  images: path.join(uploadsRoot, "images"),
  books: path.join(uploadsRoot, "books"),
  audio: path.join(uploadsRoot, "audio"),
};

export const ensureUploadDirectories = () => {
  Object.values(fileGroups).forEach((directory) => {
    fs.mkdirSync(directory, { recursive: true });
  });
};

const storage = multer.diskStorage({
  destination: (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, fileGroups.images);
      return;
    }

    if (file.mimetype === "application/pdf" || file.mimetype === "application/epub+zip") {
      callback(null, fileGroups.books);
      return;
    }

    if (file.mimetype.startsWith("audio/")) {
      callback(null, fileGroups.audio);
      return;
    }

    callback(new AppError("Unsupported file type.", 400), fileGroups.images);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname) || "";
    const safeBaseName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    callback(null, `${Date.now()}-${safeBaseName || "asset"}${extension}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  const isImage = file.mimetype.startsWith("image/");
  const isPdf = file.mimetype === "application/pdf";
  const isEpub = file.mimetype === "application/epub+zip";
  const isAudio = file.mimetype.startsWith("audio/");

  if (isImage || isPdf || isEpub || isAudio) {
    callback(null, true);
    return;
  }

  callback(new AppError("Only image, PDF, EPUB, and audio files are supported.", 400));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

export const toPublicAssetUrl = (filePath?: string | null) => {
  if (!filePath) {
    return null;
  }

  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  const publicBaseUrl = process.env.PUBLIC_BACKEND_URL?.replace(/\/$/, "");

  if (publicBaseUrl) {
    return `${publicBaseUrl}${normalizedPath}`;
  }

  return normalizedPath;
};

export const normalizeStoredAssetUrl = (value?: string | null) => {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return toPublicAssetUrl(value);
  }

  return value;
};
