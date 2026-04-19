import express from "express";
import cors from "cors";
import path from "path";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import bookRoutes from "./routes/book.routes";
import catalogRoutes from "./routes/catalog.routes";
import progressRoutes from "./routes/progress.routes";
import quizRoutes from "./routes/quiz.routes";
import storeRoutes from "./routes/store.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler, notFoundHandler } from "./lib/errors";
import { getDatabaseHealth } from "./lib/prisma";
import { ensureUploadDirectories } from "./lib/uploads";

const app = express();
const uploadsDirectory = path.resolve(__dirname, "../uploads");

ensureUploadDirectories();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(uploadsDirectory));

app.get("/", (_req, res) => {
  res.status(200).json({
    name: "Bookora API",
    status: "ok",
    docs: {
      health: "/health",
      apiHealth: "/api/health",
      catalog: "/api/catalog/home",
    },
    timestamp: new Date().toISOString(),
  });
});

const healthHandler = async (_req: express.Request, res: express.Response) => {
  const database = await getDatabaseHealth();

  res.status(database.ok ? 200 : 503).json({
    status: database.ok ? "ok" : "degraded",
    service: "bookora-api",
    database: database.ok ? "ok" : "unavailable",
    ...(database.ok
      ? {}
      : {
          message: "Database connection failed.",
          ...(process.env.NODE_ENV !== "production"
            ? {
                details: database.error,
              }
            : {}),
        }),
    timestamp: new Date().toISOString(),
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
