import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL;

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

export default prisma;
