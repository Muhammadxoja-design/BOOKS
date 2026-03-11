import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: DefaultSession["user"] & {
      id: string;
      role: "USER" | "ADMIN";
      points: number;
      streakDays: number;
    };
  }

  interface User {
    role: "USER" | "ADMIN";
    points: number;
    streakDays: number;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
    points?: number;
    streakDays?: number;
    accessToken?: string;
  }
}
