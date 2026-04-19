import "dotenv/config";
import app from "./app";
import { assertDatabaseConnection } from "./lib/prisma";

const port = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await assertDatabaseConnection();
  } catch (error) {
    console.error("Database preflight failed.", error);

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }

  app.listen(port, () => {
    console.log(`Bookora API running on http://localhost:${port}`);
  });
};

void startServer();
