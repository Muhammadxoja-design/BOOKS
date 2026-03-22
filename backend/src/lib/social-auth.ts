import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "./errors";

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

export interface TelegramProfile {
  telegramId: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
}

let googleClient: OAuth2Client | null = null;

const getGoogleClientId = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new AppError("GOOGLE_CLIENT_ID is not configured.", 500);
  }

  return clientId;
};

const getTelegramBotToken = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new AppError("TELEGRAM_BOT_TOKEN is not configured.", 500);
  }

  return token;
};

const getGoogleClient = () => {
  if (!googleClient) {
    googleClient = new OAuth2Client(getGoogleClientId());
  }

  return googleClient;
};

export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleProfile> => {
  const ticket = await getGoogleClient().verifyIdToken({
    idToken,
    audience: getGoogleClientId(),
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || !payload.name) {
    throw new AppError("Google account payload is incomplete.", 400);
  }

  if (!payload.email_verified) {
    throw new AppError("Google email is not verified.", 400);
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name,
    avatarUrl: payload.picture ?? null,
  };
};

export const verifyTelegramLogin = (payload: Record<string, string>): TelegramProfile => {
  const { hash, auth_date: authDate, id, first_name: firstName, last_name: lastName } = payload;

  if (!hash || !authDate || !id || !firstName) {
    throw new AppError("Telegram login payload is incomplete.", 400);
  }

  const authTimestamp = Number(authDate);

  if (!Number.isFinite(authTimestamp)) {
    throw new AppError("Telegram auth date is invalid.", 400);
  }

  const ageInSeconds = Math.abs(Math.floor(Date.now() / 1000) - authTimestamp);

  if (ageInSeconds > 60 * 10) {
    throw new AppError("Telegram login payload has expired.", 401);
  }

  const dataCheckString = Object.entries(payload)
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(getTelegramBotToken())
    .digest();

  const expectedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (expectedHash !== hash) {
    throw new AppError("Telegram login signature is invalid.", 401);
  }

  return {
    telegramId: id,
    name: `${firstName}${lastName ? ` ${lastName}` : ""}`.trim(),
    username: payload.username ?? null,
    avatarUrl: payload.photo_url ?? null,
  };
};
