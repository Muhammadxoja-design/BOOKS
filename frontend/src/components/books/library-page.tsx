"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { BookCard } from "@/components/books/book-card";
import { Pill } from "@/components/ui/pill";
import { Surface } from "@/components/ui/surface";
import { apiFetch } from "@/lib/api";
import { Book, BookFormat } from "@/lib/types";

export function LibraryPage({
  format,
  eyebrow,
  title,
  description,
}: {
  format: BookFormat;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiFetch<Book[]>(`/books?format=${format}`);
        setBooks(response);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load books.");
      } finally {
        setLoading(false);
      }
    };

    void loadBooks();
  }, [format]);

  const filteredBooks = books.filter((book) => {
    const searchable = `${book.title} ${book.author} ${book.shortDescription}`.toLowerCase();
    return searchable.includes(query.toLowerCase());
  });

  return (
    <div className="page-grid">
      <Surface className="overflow-hidden p-8 md:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <Pill>{eyebrow}</Pill>
            <h1 className="mt-5 section-title text-[color:var(--foreground)]">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
              {description}
            </p>
          </div>

          <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg)] p-5">
            <div className="flex items-center gap-2 text-[color:var(--accent)]">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em]">
                Curated catalog
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">
              {books.length}
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              Published titles with reusable cards, responsive grid, and API-backed filters.
            </p>
          </div>
        </div>
      </Surface>

      <Surface className="p-4">
        <label className="flex items-center gap-3 rounded-[22px] bg-[color:var(--bg)] px-4 py-3">
          <Search className="h-4 w-4 text-[color:var(--muted-foreground)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles, authors, topics"
            className="w-full bg-transparent outline-none"
          />
        </label>
      </Surface>

      {loading ? (
        <Surface className="p-10 text-center text-[color:var(--muted-foreground)]">
          Loading collection...
        </Surface>
      ) : error ? (
        <Surface className="p-10 text-center text-red-300">{error}</Surface>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
