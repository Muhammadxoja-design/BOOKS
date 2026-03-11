import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { getErrorMessage, isObject } from "../lib/http";
import { signAccessToken } from "../lib/jwt";
import { AuthRequest } from "../middlewares/auth.middleware";

const buildAuthPayload = (user: {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
  points: number;
  streakDays: number;
}) => {
  const token = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return {
    token,
    user,
  };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required." });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        cart: { create: {} },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        points: true,
        streakDays: true,
      },
    });

    res.status(201).json(buildAuthPayload(user));
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        points: true,
        streakDays: true,
        passwordHash: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    res.status(200).json(buildAuthPayload(safeUser));
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        headline: true,
        points: true,
        streakDays: true,
        longestStreak: true,
        lastActiveAt: true,
        preferences: true,
        cart: {
          select: {
            items: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const preferences = isObject(user.preferences) ? user.preferences : {};

    res.status(200).json({
      ...user,
      preferences,
      cartCount: user.cart?.items.length ?? 0,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
