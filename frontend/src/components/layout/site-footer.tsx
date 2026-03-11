import Link from "next/link";
import { Headphones, Library, ShieldCheck, Store, Trophy } from "lucide-react";

const footerLinks = [
  { href: "/audio-books", label: "Audio Books", icon: Headphones },
  { href: "/pdf-books", label: "PDF Library", icon: Library },
  { href: "/store", label: "Book Store", icon: Store },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]/70">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted-foreground)]">
            Production-grade book platform
          </p>
          <h2 className="max-w-xl font-serif text-4xl leading-tight text-[color:var(--foreground)]">
            Audio, reading, commerce, community, and gamification in one product.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            Built with Next.js, Express, Prisma, PostgreSQL, JWT/NextAuth, reusable components,
            and admin tooling. Seeded to run locally without writing mock UI from scratch.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-2 text-sm text-[color:var(--foreground)]">
            <ShieldCheck className="h-4 w-4 text-[color:var(--accent)]" />
            Secure auth, clean architecture, responsive premium UI
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {footerLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--bg)] p-5 transition hover:-translate-y-1 hover:border-[color:var(--accent)]"
              >
                <Icon className="mb-6 h-5 w-5 text-[color:var(--accent)]" />
                <p className="font-semibold text-[color:var(--foreground)]">{link.label}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
