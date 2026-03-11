"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Moon, ShoppingBag, Sparkles, Sun } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/audio-books", label: "Audio Books" },
  { href: "/pdf-books", label: "PDF Books" },
  { href: "/store", label: "Book Store" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quiz", label: "Weekly Quiz" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-[color:var(--foreground)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white shadow-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="font-serif text-2xl tracking-tight">Bookora</p>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
              Reading OS
            </p>
          </div>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-2 text-sm font-medium">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === link.href
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 transition",
                  active
                    ? "bg-[color:var(--foreground)] text-[color:var(--bg)]"
                    : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] transition hover:-translate-y-0.5"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <Link
            href="/cart"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] transition hover:-translate-y-0.5"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </Link>

          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-3 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-2">
              <button
                type="button"
                onClick={() => router.push(session.user.role === "ADMIN" ? "/admin" : "/dashboard")}
                className="flex items-center gap-3 rounded-full px-3 py-1.5 text-left transition hover:bg-[color:var(--muted)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-sm font-bold text-white">
                  {session.user.name?.slice(0, 1) ?? "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    {session.user.points} pts
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--muted-foreground)] transition hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)]"
              >
                <Sparkles className="h-4 w-4" />
                Start
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
