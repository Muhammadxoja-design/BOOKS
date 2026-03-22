import Image from "next/image";
import Link from "next/link";
import { Headphones, Library, ShoppingBag, Star } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Surface } from "@/components/ui/surface";
import { Book } from "@/lib/types";
import {
  formatCurrency,
  formatDuration,
  getBookFormatLabel,
  resolveAssetUrl,
  resolveBookHref,
} from "@/lib/utils";

const icons = {
  AUDIO: Headphones,
  PDF: Library,
  STORE: ShoppingBag,
};

export function BookCard({
  book,
  compact = false,
}: {
  book: Book;
  compact?: boolean;
}) {
  const Icon = icons[book.format];

  return (
    <Surface className="group overflow-hidden">
      <div className="relative aspect-[4/4.7] overflow-hidden">
        <Image
          src={resolveAssetUrl(book.coverImage)}
          alt={book.title}
          fill
          sizes={compact ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.85))]" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <Pill className="bg-white/12 text-white backdrop-blur">
            <Icon className="h-3.5 w-3.5" />
            {getBookFormatLabel(book.format)}
          </Pill>
          <div className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-current text-amber-300" />
            {book.rating.toFixed(1)}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 space-y-3 p-5 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/70">
              {book.category?.name ?? "Curated"}
            </p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight">{book.title}</h3>
            <p className="mt-1 text-sm text-white/70">{book.author}</p>
          </div>

          {book.progress ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Progress</span>
                <span>{Math.round(book.progress.percentage)}%</span>
              </div>
              <ProgressBar value={book.progress.percentage} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <p className={`text-[color:var(--muted-foreground)] ${compact ? "text-sm" : "text-base"}`}>
          {book.shortDescription}
        </p>

        <div className="flex flex-wrap gap-2 text-sm text-[color:var(--muted-foreground)]">
          {book.pagesCount ? <span>{book.pagesCount} pages</span> : null}
          {book.audioDuration ? <span>{formatDuration(book.audioDuration)}</span> : null}
          <span>{book.reviewCount} reviews</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
              Price
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-[color:var(--foreground)]">
                {book.format === "STORE" || book.price > 0
                  ? formatCurrency(book.currentPrice ?? book.salePrice ?? book.price)
                  : "Included"}
              </span>
              {book.salePrice ? (
                <span className="text-sm text-[color:var(--muted-foreground)] line-through">
                  {formatCurrency(book.price)}
                </span>
              ) : null}
            </div>
          </div>

          <Link
            href={resolveBookHref(book)}
            className="rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)]"
          >
            {book.format === "STORE" ? "View store" : "Open"}
          </Link>
        </div>
      </div>
    </Surface>
  );
}
