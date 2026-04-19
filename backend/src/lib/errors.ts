import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("Route not found.", 404));
};

const isDatabaseConnectionError = (error: Error) =>
  /Can't reach database server|ECONNREFUSED|ECONNRESET|ENOTFOUND|ETIMEDOUT|Connection terminated unexpectedly/i.test(
    error.message,
  );

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
    return;
  }

  if (error instanceof Error) {
    console.error(error);

    if (isDatabaseConnectionError(error)) {
      res.status(503).json({
        message:
          "Database is currently unavailable. Check DATABASE_URL, SSL settings, and database network access.",
        ...(process.env.NODE_ENV !== "production"
          ? {
              details: error.message,
            }
          : {}),
      });
      return;
    }

    res.status(500).json({
      message: error.message || "Unexpected server error.",
    });
    return;
  }

  res.status(500).json({
    message: "Unexpected server error.",
  });
};
