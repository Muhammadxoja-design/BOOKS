"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Book } from "@/lib/types";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Surface } from "@/components/ui/surface";

export function PdfReader({
  book,
  token,
}: {
  book: Book;
  token?: string;
}) {
  const totalPages = book.pagesCount ?? 1;
  const [page, setPage] = useState(book.progress?.currentPage ?? 1);

  useEffect(() => {
    setPage(book.progress?.currentPage ?? 1);
  }, [book.progress?.currentPage]);

  const percentage = Number(((page / totalPages) * 100).toFixed(2));

  const savePage = async (nextPage: number) => {
    if (!token) {
      return;
    }

    await apiFetch("/progress", {
      method: "PUT",
      token,
      body: {
        bookId: book.id,
        currentPage: nextPage,
        percentage: Number(((nextPage / totalPages) * 100).toFixed(2)),
      },
    }).catch(() => undefined);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_0.65fr]">
      <Surface className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
              Browser-native PDF reader
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
              Focus reading with synced page tracking
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const nextPage = Math.max(1, page - 1);
                setPage(nextPage);
                void savePage(nextPage);
              }}
              className="rounded-full bg-[color:var(--muted)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => {
                const nextPage = Math.min(totalPages, page + 1);
                setPage(nextPage);
                void savePage(nextPage);
              }}
              className="rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)]"
            >
              Next
            </button>
          </div>
        </div>

        <iframe
          src={`${book.pdfUrl ?? ""}#page=${page}`}
          className="h-[70vh] w-full bg-white"
          title={`${book.title} PDF reader`}
        />
      </Surface>

      <Surface className="space-y-5 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
            Reading telemetry
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
            Page {page} of {totalPages}
          </h3>
        </div>

        <ProgressBar value={percentage} />

        <div className="space-y-3 rounded-[24px] bg-[color:var(--bg)] p-5">
          <p className="text-sm font-semibold text-[color:var(--foreground)]">Annotation workflow</p>
          <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">
            Highlights, underlines, and notes are managed from the right-side workspace and stored
            per book in the backend.
          </p>
        </div>
      </Surface>
    </div>
  );
}
