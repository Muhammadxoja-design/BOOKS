import bcrypt from "bcryptjs";
import { AuthProvider, Prisma, UserRole } from "@prisma/client";
import prisma from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { AppError } from "../lib/errors";
import { GoogleProfile, TelegramProfile } from "../lib/social-auth";

const authUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  points: true,
  streakDays: true,
  telegramId: true,
  authProvider: true,
});

export type AuthenticatedUser = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;

type SignedInUser = Omit<AuthenticatedUser, "isActive">;

const buildUserPayload = (user: SignedInUser) => ({
  id: user.id,
  email: user.email ?? "",
  name: user.name,
  role: user.role,
  avatarUrl: user.avatarUrl,
  points: user.points,
  streakDays: user.streakDays,
  telegramId: user.telegramId,
  authProvider: user.authProvider,
});

export const createAuthResponse = (user: SignedInUser) => ({
  token: signAccessToken({
    id: user.id,
    email: user.email ?? "",
    role: user.role,
    name: user.name,
  }),
  user: buildUserPayload(user),
});

export const registerWithCredentials = async (input: {
  name?: string;
  email?: string;
  password?: string;
}) => {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required.", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters.", 400);
  }

  const existingUser = await prisma.user.findFirst({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      authProvider: AuthProvider.CREDENTIALS,
      cart: { create: {} },
    },
    select: authUserSelect,
  });

  return createAuthResponse(user);
};

export const loginWithCredentials = async (input: {
  email?: string;
  password?: string;
}) => {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...authUserSelect,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user?.passwordHash) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("This user account is disabled.", 403);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  const { passwordHash: _passwordHash, isActive: _isActive, ...safeUser } = user;
  return createAuthResponse(safeUser);
};

const ensureCart = async (userId: string) => {
  await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
};

export const loginWithGoogle = async (profile: GoogleProfile) => {
  const existingByGoogle = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
    select: authUserSelect,
  });

  if (existingByGoogle) {
    if (!existingByGoogle.isActive) {
      throw new AppError("This user account is disabled.", 403);
    }

    await ensureCart(existingByGoogle.id);
    return createAuthResponse(existingByGoogle);
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: profile.email },
    select: { id: true },
  });

  const user = existingByEmail
    ? await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          googleId: profile.googleId,
          name: profile.name,
          avatarUrl: profile.avatarUrl ?? undefined,
          authProvider: AuthProvider.GOOGLE,
        },
        select: authUserSelect,
      })
    : await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl ?? undefined,
          authProvider: AuthProvider.GOOGLE,
          cart: { create: {} },
        },
        select: authUserSelect,
      });

  if (!user.isActive) {
    throw new AppError("This user account is disabled.", 403);
  }

  await ensureCart(user.id);
  return createAuthResponse(user);
};

export const loginWithTelegram = async (profile: TelegramProfile) => {
  const existingByTelegram = await prisma.user.findUnique({
    where: { telegramId: profile.telegramId },
    select: authUserSelect,
  });

  if (existingByTelegram) {
    if (!existingByTelegram.isActive) {
      throw new AppError("This user account is disabled.", 403);
    }

    const user = await prisma.user.update({
      where: { id: existingByTelegram.id },
      data: {
        name: profile.name,
        telegramUsername: profile.username ?? undefined,
        avatarUrl: profile.avatarUrl ?? undefined,
      },
      select: authUserSelect,
    });

    await ensureCart(user.id);
    return createAuthResponse(user);
  }

  const user = await prisma.user.create({
    data: {
      name: profile.name,
      telegramId: profile.telegramId,
      telegramUsername: profile.username ?? undefined,
      avatarUrl: profile.avatarUrl ?? undefined,
      authProvider: AuthProvider.TELEGRAM,
      cart: { create: {} },
    },
    select: authUserSelect,
  });

  return createAuthResponse(user);
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      authProvider: true,
      telegramId: true,
      telegramUsername: true,
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
    throw new AppError("User not found.", 404);
  }

  return {
    ...user,
    email: user.email ?? "",
    cartCount: user.cart?.items.length ?? 0,
  };
};

export const assertAdmin = (role?: UserRole) => {
  if (role !== UserRole.ADMIN) {
    throw new AppError("Admin access required.", 403);
  }
};
