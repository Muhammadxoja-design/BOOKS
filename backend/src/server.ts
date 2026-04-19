import "dotenv/config";
import app from "./app";
import { assertDatabaseConnection } from "./lib/prisma";

const port = Number(process.env.PORT || 5000);
const host = process.env.SERVER_HOST || "0.0.0.0";
const shouldExitOnDbPreflightFailure = process.env.REQUIRE_DB_ON_START === "true";

const startServer = async () => {
  try {
    await assertDatabaseConnection();
  } catch (error) {
    console.error("Database preflight failed.", error);

    if (shouldExitOnDbPreflightFailure) {
      process.exit(1);
    }

    console.warn(
      "Starting API without confirmed database connectivity. Health and database-backed routes may return 503 until the database is reachable.",
    );
  }

  app.listen(port, host, () => {
    console.log(`Bookora API running on http://${host}:${port}`);
  });
};

void startServer();
