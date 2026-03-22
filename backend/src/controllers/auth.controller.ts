import { Response } from "express";
import { asyncHandler } from "../lib/async-handler";
import { AppError } from "../lib/errors";
import { isObject } from "../lib/http";
import { verifyGoogleIdToken, verifyTelegramLogin } from "../lib/social-auth";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  getUserProfile,
  loginWithCredentials,
  loginWithGoogle,
  loginWithTelegram,
  registerWithCredentials,
} from "../services/auth.service";

export const register = asyncHandler(async (req, res: Response) => {
  const payload = await registerWithCredentials(req.body as Record<string, string>);
  res.status(201).json(payload);
});

export const login = asyncHandler(async (req, res: Response) => {
  const payload = await loginWithCredentials(req.body as Record<string, string>);
  res.status(200).json(payload);
});

export const googleLogin = asyncHandler(async (req, res: Response) => {
  const idToken = String(req.body?.idToken ?? "").trim();

  if (!idToken) {
    throw new AppError("Google ID token is required.", 400);
  }

  const googleProfile = await verifyGoogleIdToken(idToken);
  const payload = await loginWithGoogle(googleProfile);

  res.status(200).json(payload);
});

export const telegramLogin = asyncHandler(async (req, res: Response) => {
  if (!isObject(req.body)) {
    throw new AppError("Telegram login payload is invalid.", 400);
  }

  const normalizedPayload = Object.entries(req.body).reduce<Record<string, string>>(
    (accumulator, [key, value]) => {
      if (typeof value === "string") {
        accumulator[key] = value;
      }

      return accumulator;
    },
    {},
  );

  const telegramProfile = verifyTelegramLogin(normalizedPayload);
  const payload = await loginWithTelegram(telegramProfile);

  res.status(200).json(payload);
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Authentication required.", 401);
  }

  const user = await getUserProfile(req.user.id);
  const preferences = isObject(user.preferences) ? user.preferences : {};

  res.status(200).json({
    ...user,
    preferences,
  });
});
