import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const resolveApiUrl = () => {
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/$/, "");
  }

  if (process.env.BACKEND_HOSTPORT) {
    return `http://${process.env.BACKEND_HOSTPORT}/api`;
  }

  return "http://127.0.0.1:5001/api";
};

const apiUrl = resolveApiUrl();

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [
    Credentials({
      name: "Bookora Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const response = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
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
        };
      },
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
      }

      session.accessToken = (token.accessToken as string | undefined) ?? "";
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
