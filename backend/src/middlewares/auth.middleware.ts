import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { verifyAccessToken } from "../lib/jwt";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  files?:
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | Express.Multer.File[];
}

const readBearerToken = (req: Request) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice(7);
};

export const optionalAuthenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const token = readBearerToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
  } catch {
    req.user = undefined;
  }

  next();
};

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = readBearerToken(req);

  if (!token) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired access token." });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== UserRole.ADMIN) {
    res.status(403).json({ message: "Admin access required." });
    return;
  }

  next();
};
