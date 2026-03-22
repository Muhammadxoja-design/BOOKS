import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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
import { ensureUploadDirectories } from "./lib/uploads";

dotenv.config();

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

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "bookora-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "bookora-api",
    timestamp: new Date().toISOString(),
  });
});

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
