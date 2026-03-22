"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Flame, Headphones, Library, Sparkles, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import { AuthGuard } from "@/components/features/auth-guard";
import { BookCard } from "@/components/books/book-card";
import { Pill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Surface } from "@/components/ui/surface";
import { apiFetch, getToken } from "@/lib/api";
import { DashboardData, ProgressRecord } from "@/lib/types";
import { formatRelativeDate, resolveAssetUrl, resolveBookHref } from "@/lib/utils";

function ContinueCard({ item }: { item: ProgressRecord }) {
  if (!item.book) {
    return null;
  }

  return (
    <Link
      href={resolveBookHref(item.book)}
      className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--bg)] p-5 transition hover:-translate-y-1"
    >
      <div className="flex gap-4">
        <div className="relative h-28 w-20 overflow-hidden rounded-[18px]">
          <Image
            src={resolveAssetUrl(item.book.coverImage)}
            alt={item.book.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[color:var(--muted-foreground)]">{item.book.author}</p>
          <h3 className="mt-2 text-xl font-semibold text-[color:var(--foreground)]">
            {item.book.title}
          </h3>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-[color:var(--muted-foreground)]">
              <span>Progress</span>
              <span>{Math.round(item.percentage)}%</span>
            </div>
            <ProgressBar value={item.percentage} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const token = getToken(session ?? null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadDashboard = async () => {
      try {
        const response = await apiFetch<DashboardData>("/users/dashboard", { token });
        setData(response);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
      }
    };

    void loadDashboard();
  }, [token]);

  return (
    <AuthGuard>
      {error ? (
        <Surface className="p-10 text-center text-red-300">{error}</Surface>
      ) : !data ? (
        <Surface className="p-10 text-center">Loading dashboard...</Surface>
      ) : (
        <div className="page-grid">
          <Surface className="overflow-hidden p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <Pill>
                  <Sparkles className="h-3.5 w-3.5" />
                  User dashboard
                </Pill>
                <h1 className="mt-5 section-title text-[color:var(--foreground)]">
                  {data.user.name}, your learning system is active.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
                  Monitor reading and listening, protect streaks, collect points, and move through
                  recommendations designed from your behavior.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Surface className="p-6">
                  <Flame className="h-5 w-5 text-[color:var(--accent)]" />
                  <p className="mt-5 text-3xl font-semibold text-[color:var(--foreground)]">
                    {data.user.streakDays} days
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Current streak</p>
                </Surface>
                <Surface className="p-6">
                  <Trophy className="h-5 w-5 text-[color:var(--accent)]" />
                  <p className="mt-5 text-3xl font-semibold text-[color:var(--foreground)]">
                    {data.user.points}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Reward points</p>
                </Surface>
                <Surface className="p-6">
                  <Library className="h-5 w-5 text-[color:var(--accent)]" />
                  <p className="mt-5 text-3xl font-semibold text-[color:var(--foreground)]">
                    {data.stats.completedTitles}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Completed titles</p>
                </Surface>
                <Surface className="p-6">
                  <Headphones className="h-5 w-5 text-[color:var(--accent)]" />
                  <p className="mt-5 text-3xl font-semibold text-[color:var(--foreground)]">
                    {data.stats.readingHours}h
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Listening time</p>
                </Surface>
              </div>
            </div>
          </Surface>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Surface className="space-y-6 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                    Continue
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                    Reading and listening
                  </h2>
                </div>
              </div>

              <div className="grid gap-4">
                {data.continueReading.map((item) => (
                  <ContinueCard key={item.book?.id ?? item.id} item={item} />
                ))}
                {data.continueListening.map((item) => (
                  <ContinueCard key={item.book?.id ?? item.id} item={item} />
                ))}
              </div>
            </Surface>

            <Surface className="space-y-6 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                  Weekly quiz
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                  {data.weeklyQuiz?.title ?? "No quiz this week"}
                </h2>
              </div>
              <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">
                {data.weeklyQuiz?.description ??
                  "When a weekly quiz is published it appears here with score history."}
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--bg)]"
              >
                Open quiz
                <ArrowRight className="h-4 w-4" />
              </Link>
              {data.weeklyQuiz?.submission ? (
                <div className="rounded-[22px] bg-[color:var(--bg)] p-4 text-sm text-[color:var(--muted-foreground)]">
                  Submitted on {formatRelativeDate(data.weeklyQuiz.submission.createdAt)} with{" "}
                  {data.weeklyQuiz.submission.score} pts.
                </div>
              ) : null}
            </Surface>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Surface className="space-y-5 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                  Rewards log
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                  Recent point events
                </h2>
              </div>
              {data.rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[color:var(--foreground)]">{reward.title}</p>
                    <span className="text-sm font-semibold text-[color:var(--accent)]">
                      +{reward.pointsChange}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                    {reward.description}
                  </p>
                </div>
              ))}
            </Surface>

            <Surface className="space-y-5 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                  Recommendations
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                  AI-style picks from your history
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {data.recommendations.map((book) => (
                  <div key={book.id} className="space-y-3">
                    <BookCard book={book} compact />
                    <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">
                      {book.reason}
                    </p>
                  </div>
                ))}
              </div>
            </Surface>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
            <Surface className="space-y-5 p-6">
              <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Leaderboard</h2>
              {data.leaderboard.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-[20px] bg-[color:var(--bg)] px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-[color:var(--foreground)]">
                      #{index + 1} {user.name}
                    </p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {user.streakDays} day streak
                    </p>
                  </div>
                  <span className="font-semibold text-[color:var(--accent)]">{user.points} pts</span>
                </div>
              ))}
            </Surface>

            <Surface className="space-y-5 p-6">
              <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Quotes</h2>
              {data.quotes.map((quote) => (
                <blockquote key={quote.id} className="rounded-[20px] bg-[color:var(--bg)] p-4">
                  <p className="font-serif text-2xl text-[color:var(--foreground)]">“{quote.text}”</p>
                  <footer className="mt-3 text-sm text-[color:var(--muted-foreground)]">
                    {quote.author}
                  </footer>
                </blockquote>
              ))}
            </Surface>

            <Surface className="space-y-5 p-6">
              <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Recent orders</h2>
              {data.orders.map((order) => (
                <div key={order.id} className="rounded-[20px] bg-[color:var(--bg)] p-4">
                  <p className="font-semibold text-[color:var(--foreground)]">
                    {order.paymentReference ?? order.id}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                    {order.items.length} item(s) • {order.total}
                  </p>
                </div>
              ))}
            </Surface>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
