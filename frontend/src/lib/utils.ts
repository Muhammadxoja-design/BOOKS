import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Book, BookFormat } from "./types";
import { resolveAssetUrl } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

export const formatDuration = (seconds?: number | null) => {
  if (!seconds) {
    return "0m";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
};

export const formatRelativeDate = (value?: string | null) => {
  if (!value) {
    return "No activity yet";
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const resolveBookHref = (book: Pick<Book, "slug" | "format">) => {
  const routes: Record<BookFormat, string> = {
    AUDIO: `/audio-books/${book.slug}`,
    PDF: `/pdf-books/${book.slug}`,
    STORE: "/store",
  };

  return routes[book.format];
};

export const getBookFormatLabel = (format: BookFormat) => {
  if (format === "AUDIO") {
    return "Audio Book";
  }

  if (format === "PDF") {
    return "PDF Book";
  }

  return "Store";
};

export { resolveAssetUrl };
