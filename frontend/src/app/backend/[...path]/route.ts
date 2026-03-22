import { NextRequest, NextResponse } from "next/server";

const resolveBackendBaseUrl = () => {
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/$/, "");
  }

  if (process.env.BACKEND_HOSTPORT) {
    return `http://${process.env.BACKEND_HOSTPORT}/api`;
  }

  return "http://127.0.0.1:5001/api";
};

const backendBaseUrl = resolveBackendBaseUrl();

const buildBackendUrl = (path: string[]) => {
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
  const targetUrl = new URL(buildBackendUrl(path));
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = Buffer.from(await request.arrayBuffer());
  }

  const response = await fetch(targetUrl, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const dynamic = "force-dynamic";

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
