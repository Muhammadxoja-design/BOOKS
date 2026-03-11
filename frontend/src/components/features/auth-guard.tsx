"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { Surface } from "@/components/ui/surface";

export function AuthGuard({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Surface className="p-10 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
          Loading session
        </p>
        <h2 className="mt-4 font-serif text-3xl text-[color:var(--foreground)]">
          Preparing your workspace
        </h2>
      </Surface>
    );
  }

  if (status !== "authenticated") {
    return (
      <Surface className="mx-auto max-w-2xl p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--muted)] text-[color:var(--accent)]">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="mt-6 font-serif text-4xl text-[color:var(--foreground)]">
          Sign in required
        </h2>
        <p className="mt-4 text-[color:var(--muted-foreground)]">
          This area is protected because it uses account progress, notes, rewards, or commerce.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--bg)]"
        >
          Continue to sign in
        </Link>
      </Surface>
    );
  }

  if (adminOnly && session.user.role !== "ADMIN") {
    return (
      <Surface className="mx-auto max-w-2xl p-10 text-center">
        <h2 className="font-serif text-4xl text-[color:var(--foreground)]">Admin only</h2>
        <p className="mt-4 text-[color:var(--muted-foreground)]">
          Your account is authenticated, but it does not have admin permissions.
        </p>
      </Surface>
    );
  }

  return <>{children}</>;
}
