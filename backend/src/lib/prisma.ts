import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

const isSupabaseHost = (hostname: string) =>
  hostname.endsWith(".supabase.co") || hostname.endsWith(".pooler.supabase.com");

const isSupabaseDirectHost = (hostname: string) =>
  hostname.startsWith("db.") && hostname.endsWith(".supabase.co");

const isSupabasePoolerHost = (hostname: string) =>
  hostname.endsWith(".pooler.supabase.com");

const hasConfiguredRootCertificate = (parsed: URL) =>
  parsed.searchParams.has("sslrootcert") ||
  Boolean(process.env.PGSSLROOTCERT || process.env.DB_SSL_ROOT_CERT);

const normalizeDatabaseUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    const configuredSslMode = parsed.searchParams.get("sslmode");
    const hasRootCertificate = hasConfiguredRootCertificate(parsed);

    if (isSupabasePoolerHost(parsed.hostname)) {
      if (!configuredSslMode) {
        parsed.searchParams.set(
          "sslmode",
          hasRootCertificate ? "verify-full" : "require",
        );
      }

      if (
        parsed.searchParams.get("sslmode") === "verify-full" &&
        !hasRootCertificate
      ) {
        console.warn(
          "Supabase Session pooler with sslmode=verify-full requires a trusted root certificate. Falling back to sslmode=require with uselibpqcompat=true.",
        );
        parsed.searchParams.set("sslmode", "require");
      }

      if (
        parsed.searchParams.get("sslmode") === "require" &&
        !parsed.searchParams.has("uselibpqcompat")
      ) {
        parsed.searchParams.set("uselibpqcompat", "true");
      }
    } else if (isSupabaseHost(parsed.hostname) && !configuredSslMode) {
      parsed.searchParams.set("sslmode", "verify-full");
    }

    if (
      process.env.NODE_ENV === "production" &&
      isSupabaseDirectHost(parsed.hostname)
    ) {
      console.warn(
        "DATABASE_URL uses a direct Supabase host. On Render, prefer the Supavisor session pooler URL because direct Supabase hosts are IPv6-only.",
      );
    }

    return parsed.toString();
  } catch {
    return value;
  }
};

const databaseUrl = process.env.DATABASE_URL
  ? normalizeDatabaseUrl(process.env.DATABASE_URL)
  : undefined;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS ?? 5000),
  query_timeout: Number(process.env.DB_QUERY_TIMEOUT_MS ?? 10000),
  statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS ?? 10000),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS ?? 10000),
});

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const assertDatabaseConnection = async () => {
  await prisma.$queryRaw`SELECT 1`;
};

export const getDatabaseHealth = async () => {
  try {
    await assertDatabaseConnection();
    return {
      ok: true as const,
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unexpected database error.",
    };
  }
};

export default prisma;
