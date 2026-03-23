import { NextRequest, NextResponse } from "next/server";
import { resolvePrimaryBackendBaseUrl } from "@/lib/backend-url";

export async function POST(request: NextRequest) {
  const backendUrl = `${resolvePrimaryBackendBaseUrl()}/auth/register`;

  try {
    const body = await request.text();

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Registration failed" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Backend request failed" },
      { status: 500 },
    );
  }
}
