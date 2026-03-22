"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
        };
      };
    };
    onTelegramAuth?: (user: Record<string, string | number>) => void;
  }
}

const GOOGLE_SCRIPT_ID = "google-identity-script";
const TELEGRAM_SCRIPT_ID = "telegram-login-script";

const loadScript = (id: string, src: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.appendChild(script);
  });

export function SocialAuthPanel() {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const telegramContainerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [pendingProvider, setPendingProvider] = useState<"google" | "telegram" | "">("");

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    const initializeGoogle = async () => {
      await loadScript(GOOGLE_SCRIPT_ID, "https://accounts.google.com/gsi/client");

      if (!window.google?.accounts.id || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) {
            setError("Google token olinmadi.");
            return;
          }

          setPendingProvider("google");
          setError("");

          const result = await signIn("google-oauth", {
            idToken: response.credential,
            redirect: false,
          });

          if (result?.error) {
            setError("Google orqali kirish muvaffaqiyatsiz yakunlandi.");
            setPendingProvider("");
            return;
          }

          router.push("/dashboard");
          router.refresh();
        },
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 320,
      });
    };

    void initializeGoogle().catch(() => {
      setError("Google login skriptini yuklab bo‘lmadi.");
    });
  }, [router]);

  useEffect(() => {
    const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

    if (!telegramBotUsername || !telegramContainerRef.current) {
      return;
    }

    window.onTelegramAuth = async (user) => {
      setPendingProvider("telegram");
      setError("");

      const result = await signIn("telegram-login", {
        id: String(user.id ?? ""),
        first_name: String(user.first_name ?? ""),
        last_name: String(user.last_name ?? ""),
        username: String(user.username ?? ""),
        photo_url: String(user.photo_url ?? ""),
        auth_date: String(user.auth_date ?? ""),
        hash: String(user.hash ?? ""),
        redirect: false,
      });

      if (result?.error) {
        setError("Telegram orqali kirish muvaffaqiyatsiz yakunlandi.");
        setPendingProvider("");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    };

    const renderTelegramWidget = async () => {
      const container = telegramContainerRef.current;

      if (!container) {
        return;
      }

      container.innerHTML = "";
      await loadScript(TELEGRAM_SCRIPT_ID, "https://telegram.org/js/telegram-widget.js?22");

      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute("data-telegram-login", telegramBotUsername);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "999");
      script.setAttribute("data-request-access", "write");
      script.setAttribute("data-userpic", "false");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      container.appendChild(script);
    };

    void renderTelegramWidget().catch(() => {
      setError("Telegram widgetini yuklab bo‘lmadi.");
    });

    return () => {
      delete window.onTelegramAuth;
    };
  }, [router]);

  const googleReady = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const telegramReady = Boolean(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);

  return (
    <div className="grid gap-4 rounded-[28px] border border-[color:var(--border)] bg-[color:var(--bg)] p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
          Social Login
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
          Google va Telegram integratsiyasi
        </h3>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
          Google OAuth 2.0 ID token va Telegram Login Widget backend’da tekshirilib, yakunda
          session ichiga JWT joylanadi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[22px] border border-[color:var(--border)] p-4">
          <p className="mb-3 text-sm font-semibold text-[color:var(--foreground)]">Google</p>
          {googleReady ? (
            <div ref={googleButtonRef} className="min-h-11" />
          ) : (
            <p className="text-sm text-[color:var(--muted-foreground)]">
              `NEXT_PUBLIC_GOOGLE_CLIENT_ID` yo‘q.
            </p>
          )}
        </div>

        <div className="rounded-[22px] border border-[color:var(--border)] p-4">
          <p className="mb-3 text-sm font-semibold text-[color:var(--foreground)]">Telegram</p>
          {telegramReady ? (
            <div ref={telegramContainerRef} className="min-h-11" />
          ) : (
            <p className="text-sm text-[color:var(--muted-foreground)]">
              `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` yo‘q.
            </p>
          )}
        </div>
      </div>

      {pendingProvider ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {pendingProvider === "google" ? "Google" : "Telegram"} orqali session yaratilmoqda...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <p className="text-xs leading-6 text-[color:var(--muted-foreground)]">
        Eslatma: Telegram Login Widget email bermaydi. Shu sababli Telegram orqali kirgan foydalanuvchi
        uchun `email` maydoni bo‘sh bo‘lishi mumkin.
      </p>
    </div>
  );
}
