import { Session } from "next-auth";

const resolveBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "/backend";
  }

  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/$/, "");
  }

  if (process.env.BACKEND_HOSTPORT) {
    return `http://${process.env.BACKEND_HOSTPORT}/api`;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  return "http://127.0.0.1:5001/api";
};

const baseUrl = resolveBaseUrl();
const browserProxyBase = "/backend";

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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiUpload<T>(
  path: string,
  options: {
    method?: string;
    body: FormData;
    token?: string;
    headers?: HeadersInit;
  },
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: options.method ?? "POST",
    headers: {
      ...(options.token
        ? {
            Authorization: `Bearer ${options.token}`,
          }
        : {}),
      ...options.headers,
    },
    body: options.body,
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const resolveAssetUrl = (value?: string | null) => {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/backend/")) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `${browserProxyBase}${value}`;
  }

  return value;
};

export const getToken = (session: Session | null) => session?.accessToken ?? "";
