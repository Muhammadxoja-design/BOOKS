"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { Surface } from "@/components/ui/surface";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "register") {
        await apiFetch("/auth/register", {
          method: "POST",
          body: {
            name,
            email,
            password,
          },
        });
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Email yoki parol noto'g'ri.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Authentication failed.",
      );
    } finally {
      setPending(false);
    }
  };

  const isRegister = mode === "register";

  return (
    <Surface className="mx-auto max-w-xl overflow-hidden">
      <div className="grid gap-8 p-8 md:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted-foreground)]">
            {isRegister ? "Create account" : "Welcome back"}
          </p>
          <h1 className="mt-4 font-serif text-5xl text-[color:var(--foreground)]">
            {isRegister ? "Build your reading engine" : "Continue your streak"}
          </h1>
          <p className="mt-4 text-[color:var(--muted-foreground)]">
            Secure JWT-backed authentication through NextAuth credentials flow.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {isRegister ? (
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--foreground)]">Full name</span>
              <input
                required
                name="name"
                placeholder="Nodira Karimova"
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]"
              />
            </label>
          ) : null}

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[color:var(--foreground)]">Email</span>
            <input
              required
              type="email"
              name="email"
              placeholder="reader@bookora.app"
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[color:var(--foreground)]">Password</span>
            <input
              required
              type="password"
              minLength={8}
              name="password"
              placeholder="At least 8 characters"
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-3 rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--bg)] disabled:opacity-60"
          >
            {pending
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-[color:var(--muted-foreground)]">
          {isRegister ? "Already have an account?" : "Need a new account?"}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-semibold text-[color:var(--foreground)]"
          >
            {isRegister ? "Sign in" : "Register"}
          </Link>
        </p>
      </div>
    </Surface>
  );
}
