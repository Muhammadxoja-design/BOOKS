import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
};

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export const signAccessToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
