import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getBackendBaseCandidates } from "./backend-url";

class ServiceUnavailableCredentialsError extends CredentialsSignin {
  code = "service_unavailable";

  constructor(message = "Authentication service is temporarily unavailable.") {
    super(message);
  }
}

const resolveAuthSecret = () => {
  const configuredSecret =
    process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET;

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "bookora-dev-auth-secret";
  }

  return undefined;
};

const shouldTryNextBackendCandidateForAuth = (status?: number) =>
  status === 404 || status === 502 || status === 504;

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
        if (shouldTryNextBackendCandidateForAuth(response.status)) {
          continue;
        }

        if (response.status >= 500 || response.status === 503) {
          throw new ServiceUnavailableCredentialsError();
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
    } catch (error) {
      if (error instanceof ServiceUnavailableCredentialsError) {
        throw error;
      }

      continue;
    }
  }

  throw new ServiceUnavailableCredentialsError();
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: resolveAuthSecret(),
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  logger: {
    error(error) {
      if (
        error instanceof CredentialsSignin &&
        error.code === "service_unavailable"
      ) {
        console.warn(
          "[auth][warn] Authentication service is temporarily unavailable.",
        );
        return;
      }

      const name = error instanceof Error && "type" in error ? String(error.type) : error.name;
      console.error(`[auth][error] ${name}: ${error.message}`);

      if (
        "cause" in error &&
        error.cause &&
        typeof error.cause === "object" &&
        "err" in error.cause &&
        error.cause.err instanceof Error
      ) {
        console.error("[auth][cause]:", error.cause.err.stack);
      } else if (error.stack) {
        console.error(error.stack.replace(/.*/, "").substring(1));
      }
    },
  },
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
