"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { MessageSquareMore, NotebookPen, Sparkles, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import { AudioPlayer } from "@/components/features/audio-player";
import { PdfReader } from "@/components/features/pdf-reader";
import { BookCard } from "@/components/books/book-card";
import { Pill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Surface } from "@/components/ui/surface";
import { apiFetch, getToken } from "@/lib/api";
import { Annotation, AnnotationType, Book, Discussion } from "@/lib/types";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";

type BookDetail = Book & {
  createdAt?: string;
  description: string;
  discussions: Discussion[];
  annotations: Annotation[];
  relatedBooks: Book[];
};

const annotationOptions: AnnotationType[] = ["HIGHLIGHT", "UNDERLINE", "NOTE"];

export function BookExperiencePage({
  slug,
  format,
}: {
  slug: string;
  format: "AUDIO" | "PDF";
}) {
  const { data: session } = useSession();
  const token = getToken(session ?? null);
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [discussionContent, setDiscussionContent] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [quote, setQuote] = useState("");
  const [annotationType, setAnnotationType] = useState<AnnotationType>("NOTE");
  const [contextValue, setContextValue] = useState("1");

  const loadBook = async () => {
    try {
      setLoading(true);
      setError("");
      const detail = await apiFetch<BookDetail>(`/books/${slug}`, {
        token,
      });
      setBook(detail);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load book.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, token]);

  const submitDiscussion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !discussionContent.trim()) {
      return;
    }

    await apiFetch(`/books/${slug}/discussions`, {
      method: "POST",
      token,
      body: {
        content: discussionContent,
      },
    });

    setDiscussionContent("");
    void loadBook();
  };

  const submitAnnotation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    await apiFetch(`/books/${slug}/annotations`, {
      method: "POST",
      token,
      body: {
        type: annotationType,
        content: noteContent,
        quote,
        page: format === "PDF" ? Number(contextValue) : undefined,
        timestamp: format === "AUDIO" ? Number(contextValue) : undefined,
        color:
          annotationType === "HIGHLIGHT"
            ? "#F59E0B"
            : annotationType === "UNDERLINE"
              ? "#22D3EE"
              : "#FDE68A",
      },
    });

    setNoteContent("");
    setQuote("");
    void loadBook();
  };

  if (loading) {
    return <Surface className="p-10 text-center">Loading book experience...</Surface>;
  }

  if (error || !book) {
    return <Surface className="p-10 text-center text-red-300">{error || "Book not found."}</Surface>;
  }

  if (book.format !== format) {
    return (
      <Surface className="p-10 text-center">
        This route expects a {format.toLowerCase()} title, but received {book.format.toLowerCase()}.
      </Surface>
    );
  }

  return (
    <div className="page-grid">
      <Surface className="overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={book.backdropImage ?? book.coverImage}
              alt={book.title}
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.92),rgba(8,47,73,0.8),rgba(225,124,57,0.35))]" />
          </div>
          <div className="relative grid gap-8 p-8 md:p-10 lg:grid-cols-[0.8fr_1.2fr]">
            <img
              src={book.coverImage}
              alt={book.title}
              className="aspect-[4/5] w-full rounded-[32px] object-cover shadow-2xl"
            />

            <div className="space-y-6 text-white">
              <div className="flex flex-wrap gap-3">
                <Pill className="border-white/10 bg-white/10 text-white">
                  {book.category?.name ?? "Curated"}
                </Pill>
                <Pill className="border-white/10 bg-white/10 text-white">
                  {book.pointsReward} reward pts
                </Pill>
              </div>

              <div>
                <h1 className="font-serif text-5xl leading-none md:text-6xl">{book.title}</h1>
                <p className="mt-3 text-lg text-white/70">
                  {book.author}
                  {book.subtitle ? ` • ${book.subtitle}` : ""}
                </p>
              </div>

              <p className="max-w-3xl text-base leading-8 text-white/78">{book.description}</p>

              {book.quote ? (
                <blockquote className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-lg italic text-white/90">
                  “{book.quote}”
                </blockquote>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/60">Progress</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {Math.round(book.progress?.percentage ?? 0)}%
                  </p>
                  <ProgressBar value={book.progress?.percentage ?? 0} className="mt-3 bg-white/10" />
                </div>
                <div className="rounded-[24px] bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/60">Price</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {book.price > 0
                      ? formatCurrency(book.currentPrice ?? book.salePrice ?? book.price)
                      : "Included"}
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/60">Updated</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {formatRelativeDate(book.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Surface>

      {format === "AUDIO" ? (
        <AudioPlayer book={book} token={token} />
      ) : (
        <PdfReader book={book} token={token} />
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[color:var(--muted)] p-3 text-[color:var(--accent)]">
              <NotebookPen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                Annotation workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                Highlight, underline, note
              </h2>
            </div>
          </div>

          <form className="grid gap-4" onSubmit={submitAnnotation}>
            <div className="flex flex-wrap gap-2">
              {annotationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnnotationType(option)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    annotationType === option
                      ? "bg-[color:var(--foreground)] text-[color:var(--bg)]"
                      : "bg-[color:var(--muted)] text-[color:var(--foreground)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <input
              value={quote}
              onChange={(event) => setQuote(event.target.value)}
              placeholder="Selected quote or excerpt"
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
            />
            <textarea
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder="Your note or observation"
              rows={4}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
            />
            <input
              value={contextValue}
              onChange={(event) => setContextValue(event.target.value)}
              placeholder={format === "PDF" ? "Page number" : "Timestamp in seconds"}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
            />
            <button
              type="submit"
              disabled={!token}
              className="rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--bg)] disabled:opacity-50"
            >
              Save annotation
            </button>
          </form>

          <div className="space-y-3">
            {book.annotations.map((annotation) => (
              <div
                key={annotation.id}
                className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <Pill>{annotation.type}</Pill>
                  <span className="text-xs text-[color:var(--muted-foreground)]">
                    {formatRelativeDate(annotation.createdAt)}
                  </span>
                </div>
                {annotation.quote ? (
                  <p className="mt-3 italic text-[color:var(--foreground)]">“{annotation.quote}”</p>
                ) : null}
                {annotation.content ? (
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                    {annotation.content}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[color:var(--muted)] p-3 text-[color:var(--accent)]">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                  Discussion
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                  Reader community
                </h2>
              </div>
            </div>

            <form className="grid gap-4" onSubmit={submitDiscussion}>
              <textarea
                value={discussionContent}
                onChange={(event) => setDiscussionContent(event.target.value)}
                placeholder="Share an idea, question, or interpretation"
                rows={4}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none"
              />
              <button
                type="submit"
                disabled={!token}
                className="rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--bg)] disabled:opacity-50"
              >
                Post comment
              </button>
            </form>

            <div className="space-y-4">
              {book.discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--bg)] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">{discussion.user.name}</p>
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {discussion.user.headline ?? "Reader"}
                      </p>
                    </div>
                    <span className="text-xs text-[color:var(--muted-foreground)]">
                      {formatRelativeDate(discussion.createdAt)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                    {discussion.content}
                  </p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[color:var(--muted)] p-3 text-[color:var(--accent)]">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                  Rewards
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                  Learning incentives
                </h2>
              </div>
            </div>

            <div className="rounded-[24px] bg-[color:var(--bg)] p-5">
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Completing this title awards {book.pointsReward} points and contributes to weekly
                leaderboard rank.
              </p>
              <Link
                href="/dashboard"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)]"
              >
                <Sparkles className="h-4 w-4" />
                View dashboard
              </Link>
            </div>
          </Surface>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted-foreground)]">
            More for you
          </p>
          <h2 className="mt-4 section-title text-[color:var(--foreground)]">Related titles</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {book.relatedBooks.map((relatedBook) => (
            <BookCard key={relatedBook.id} book={relatedBook} compact />
          ))}
        </div>
      </div>
    </div>
  );
}
