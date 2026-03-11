export const getErrorMessage = (
  error: unknown,
  fallback = "Unexpected server error",
) => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
