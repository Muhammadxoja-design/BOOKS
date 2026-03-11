import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bookora | Premium book platform",
  description:
    "Production-style book platform with audiobooks, PDF reading, store, rewards, quizzes, and admin tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[color:var(--bg)] font-sans text-[color:var(--foreground)] antialiased">
        <AuthProvider>
          <div className="relative min-h-screen overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.15),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.18),transparent_24%),linear-gradient(180deg,var(--bg),color-mix(in_oklab,var(--bg)_82%,white))]" />
            <SiteHeader />
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
