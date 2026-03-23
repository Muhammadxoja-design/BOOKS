import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseCandidates, shouldTryNextBackendCandidate } from "@/lib/backend-url";

const buildBackendUrl = (backendBaseUrl: string, path: string[]) => {
  if (path.length === 0) {
    return backendBaseUrl;
  }

  if (path[0] === "health") {
    return backendBaseUrl.replace(/\/api$/, "/health");
  }

  if (path[0] === "uploads") {
    return `${backendBaseUrl.replace(/\/api$/, "")}/${path.join("/")}`;
  }

  if (path[0] === "api") {
    return `${backendBaseUrl.replace(/\/api$/, "")}/${path.join("/")}`;
  }

  return `${backendBaseUrl}/${path.join("/")}`;
};

const proxy = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) => {
  const { path } = await context.params;
  const headers = new Headers(request.headers);
  headers.delete("host");

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? Buffer.from(await request.arrayBuffer())
      : undefined;

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
    body,
  };

  let lastError: unknown;

  for (const backendBaseUrl of getBackendBaseCandidates()) {
    const targetUrl = new URL(buildBackendUrl(backendBaseUrl, path));
    targetUrl.search = request.nextUrl.search;

    try {
      const response = await fetch(targetUrl, init);

      if (shouldTryNextBackendCandidate(response.status)) {
        lastError = new Error(`Backend responded with ${response.status} for ${targetUrl}`);
        continue;
      }

      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete("content-encoding");
      responseHeaders.delete("content-length");

      return new NextResponse(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (error) {
      lastError = error;
    }
  }

  return NextResponse.json(
    {
      message:
        lastError instanceof Error
          ? lastError.message
          : "Backend service is unavailable. Check backend port/env configuration.",
    },
    { status: 502 },
  );
};

export const dynamic = "force-dynamic";

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
