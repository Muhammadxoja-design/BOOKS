"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Headphones, Library, ShoppingBag, Sparkles, Trophy } from "lucide-react";
import { BookCard } from "@/components/books/book-card";
import { Pill } from "@/components/ui/pill";
import { Surface } from "@/components/ui/surface";
import { apiFetch } from "@/lib/api";
import { HomeFeed } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const features = [
  {
    title: "Audio books with progress sync",
    description: "Custom player with 1x, 1.5x, 2x speed and listening telemetry.",
    icon: Headphones,
  },
  {
    title: "PDF reading workspace",
    description: "Reader view, highlights, underlines, note capture, and progress tracking.",
    icon: Library,
  },
  {
    title: "Gamified store ecosystem",
    description: "Points, streaks, weekly quiz, recommendations, comments, cart, and checkout.",
    icon: Trophy,
  },
];

export default function HomePage() {
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        const data = await apiFetch<HomeFeed>("/catalog/home");
        setFeed(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load home feed.");
      } finally {
        setLoading(false);
      }
    };

    void loadFeed();
  }, []);

  return (
    <div className="page-grid">
      <Surface className="overflow-hidden">
        <div className="grid gap-10 p-8 md:p-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Pill>
              <Sparkles className="h-3.5 w-3.5" />
              Premium startup-grade web app
            </Pill>
            <h1 className="mt-6 font-serif text-6xl leading-none text-[color:var(--foreground)] md:text-7xl">
              Read, listen, collect, and compete in one polished book platform.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
              Bookora unifies audio books, PDF reading, book commerce, AI-style recommendations,
              streaks, quizzes, leaderboards, and admin operations in a single responsive product.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--bg)]"
              >
                Launch dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/store"
                className="rounded-full border border-[color:var(--border)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)]"
              >
                Explore store
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <Surface className="bg-[linear-gradient(135deg,rgba(225,124,57,0.2),rgba(15,143,166,0.18))] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                Platform metrics
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-3xl font-semibold text-[color:var(--foreground)]">
                    {feed?.hero.metrics.readers ?? "5k+"}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Readers</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-[color:var(--foreground)]">
                    {feed?.hero.metrics.titles ?? "120+"}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Titles</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-[color:var(--foreground)]">
                    {feed ? formatCurrency(feed.hero.metrics.revenue) : "$48k"}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Revenue</p>
                </div>
              </div>
            </Surface>

            <div className="grid gap-4 sm:grid-cols-2">
              <Surface className="p-6">
                <div className="flex items-center gap-3 text-[color:var(--accent)]">
                  <Headphones className="h-5 w-5" />
                  <Library className="h-5 w-5" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-[color:var(--foreground)]">
                  Reader + listener dashboard
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                  Continue reading, continue listening, notes, rewards, quotes, quiz, leaderboard.
                </p>
              </Surface>

              <Surface className="p-6">
                <div className="flex items-center gap-3 text-[color:var(--accent)]">
                  <ShoppingBag className="h-5 w-5" />
                  <Trophy className="h-5 w-5" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-[color:var(--foreground)]">
                  Commerce + gamification
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                  Cart, checkout, purchase rewards, weekly quiz payouts, and streak retention.
                </p>
              </Surface>
            </div>
          </div>
        </div>
      </Surface>

      <div className="grid gap-6 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Surface key={feature.title} className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--muted)] text-[color:var(--accent)]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-[color:var(--foreground)]">
                {feature.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                {feature.description}
              </p>
            </Surface>
          );
        })}
      </div>

      {loading ? (
        <Surface className="p-10 text-center">Loading catalog...</Surface>
      ) : error || !feed ? (
        <Surface className="p-10 text-center text-red-300">{error || "No feed found."}</Surface>
      ) : (
        <>
          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted-foreground)]">
                  Featured
                </p>
                <h2 className="mt-4 section-title text-[color:var(--foreground)]">
                  Featured releases
                </h2>
              </div>
              <Link href="/dashboard" className="text-sm font-semibold text-[color:var(--foreground)]">
                Open full dashboard
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {feed.featured.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {[
              { title: "Audio Books", items: feed.sections.audioBooks },
              { title: "PDF Books", items: feed.sections.pdfBooks },
              { title: "Book Store", items: feed.sections.storeBooks },
            ].map((section) => (
              <Surface key={section.title} className="p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                  {section.title}
                </p>
                <div className="mt-5 space-y-4">
                  {section.items.slice(0, 3).map((book) => (
                    <Link
                      key={book.id}
                      href={book.format === "STORE" ? "/store" : `/${book.format === "AUDIO" ? "audio-books" : "pdf-books"}/${book.slug}`}
                      className="flex items-center gap-4 rounded-[22px] bg-[color:var(--bg)] p-3 transition hover:-translate-y-0.5"
                    >
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-20 w-16 rounded-2xl object-cover"
                      />
                      <div>
                        <p className="font-semibold text-[color:var(--foreground)]">{book.title}</p>
                        <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{book.author}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Surface>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Surface className="p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted-foreground)]">
                Categories
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {feed.categories.map((category) => (
                  <div
                    key={category.slug}
                    className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--bg)] p-5"
                  >
                    <div
                      className="mb-4 h-2 w-24 rounded-full"
                      style={{ backgroundColor: category.accentColor }}
                    />
                    <h3 className="text-2xl font-semibold text-[color:var(--foreground)]">
                      {category.name}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                      {category.description}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-[color:var(--foreground)]">
                      {category.bookCount ?? 0} books
                    </p>
                  </div>
                ))}
              </div>
            </Surface>

            <Surface className="p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted-foreground)]">
                Famous quotes
              </p>
              <div className="mt-6 space-y-4">
                {feed.quotes.map((quote) => (
                  <blockquote
                    key={quote.id}
                    className="rounded-[24px] bg-[color:var(--bg)] p-5 text-[color:var(--foreground)]"
                  >
                    <p className="font-serif text-2xl leading-tight">“{quote.text}”</p>
                    <footer className="mt-4 text-sm text-[color:var(--muted-foreground)]">
                      {quote.author} • {quote.bookTitle}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </Surface>
          </section>
        </>
      )}
    </div>
  );
}
