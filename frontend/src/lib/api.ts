import { Session } from "next-auth";

const resolveBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window === "undefined") {
    if (process.env.BACKEND_INTERNAL_URL) {
      return process.env.BACKEND_INTERNAL_URL.replace(/\/$/, "");
    }

    if (process.env.BACKEND_HOSTPORT) {
      return `http://${process.env.BACKEND_HOSTPORT}/api`;
    }

    return "http://127.0.0.1:5001/api";
  }

  return "/backend";
};

const baseUrl = resolveBaseUrl();

const buildUrl = (path: string) =>
  `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
    headers?: HeadersInit;
  } = {},
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token
        ? {
            Authorization: `Bearer ${options.token}`,
          }
        : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Request failed";

    try {
      const payload = await response.json();
      message = payload?.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export const getToken = (session: Session | null) => session?.accessToken ?? "";
