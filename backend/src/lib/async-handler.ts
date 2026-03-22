import { NextFunction, Request, Response } from "express";

export const asyncHandler =
  <TRequest extends Request = Request>(
    handler: (req: TRequest, res: Response, next: NextFunction) => Promise<unknown>,
  ) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req as TRequest, res, next)).catch(next);
