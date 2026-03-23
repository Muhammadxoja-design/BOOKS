import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getBackendBaseCandidates, shouldTryNextBackendCandidate } from "./backend-url";

const exchangeWithBackend = async (path: string, body: Record<string, string>) => {
  for (const apiUrl of getBackendBaseCandidates()) {
    try {
      const response = await fetch(`${apiUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (shouldTryNextBackendCandidate(response.status)) {
          continue;
        }

        return null;
      }

      const payload = await response.json();

      if (!payload?.token || !payload?.user) {
        return null;
      }

      return {
        id: payload.user.id,
        name: payload.user.name,
        email: payload.user.email,
        role: payload.user.role,
        image: payload.user.avatarUrl,
        points: payload.user.points,
        streakDays: payload.user.streakDays,
        accessToken: payload.token,
        telegramId: payload.user.telegramId,
        authProvider: payload.user.authProvider,
      };
    } catch {
      continue;
    }
  }

  return null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [
    Credentials({
      id: "credentials",
      name: "Email Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) =>
        exchangeWithBackend("/auth/login", {
          email: String(credentials?.email ?? "").trim(),
          password: String(credentials?.password ?? ""),
        }),
    }),
    Credentials({
      id: "google-oauth",
      name: "Google OAuth",
      credentials: {
        idToken: { label: "Google ID Token", type: "text" },
      },
      authorize: async (credentials) =>
        exchangeWithBackend("/auth/google", {
          idToken: String(credentials?.idToken ?? ""),
        }),
    }),
    Credentials({
      id: "telegram-login",
      name: "Telegram Login",
      credentials: {
        id: { label: "Telegram ID", type: "text" },
        first_name: { label: "First name", type: "text" },
        last_name: { label: "Last name", type: "text" },
        username: { label: "Username", type: "text" },
        photo_url: { label: "Photo URL", type: "text" },
        auth_date: { label: "Auth Date", type: "text" },
        hash: { label: "Hash", type: "text" },
      },
      authorize: async (credentials) =>
        exchangeWithBackend("/auth/telegram", {
          id: String(credentials?.id ?? ""),
          first_name: String(credentials?.first_name ?? ""),
          last_name: String(credentials?.last_name ?? ""),
          username: String(credentials?.username ?? ""),
          photo_url: String(credentials?.photo_url ?? ""),
          auth_date: String(credentials?.auth_date ?? ""),
          hash: String(credentials?.hash ?? ""),
        }),
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.picture = user.image;
        token.points = user.points;
        token.streakDays = user.streakDays;
        token.accessToken = user.accessToken;
        token.telegramId = user.telegramId;
        token.authProvider = user.authProvider;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
        session.user.image = (token.picture as string | null | undefined) ?? null;
        session.user.points = Number(token.points ?? 0);
        session.user.streakDays = Number(token.streakDays ?? 0);
        session.user.telegramId = (token.telegramId as string | undefined) ?? "";
        session.user.authProvider =
          (token.authProvider as "CREDENTIALS" | "GOOGLE" | "TELEGRAM" | undefined) ??
          "CREDENTIALS";
      }

      session.accessToken = (token.accessToken as string | undefined) ?? "";
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
