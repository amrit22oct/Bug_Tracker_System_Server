import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import requestLogger from "./middlewares/requestLogger.js";
import logger from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Full Request/Response Logger
app.use(requestLogger);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Base Route
app.get("/", (req, res) => {
  res.json({ message: "🚀 API is running successfully" });
});

// Routes
app.use("/", routes);

// 404 Handler
app.use((req, res) => {
  logger.warn("ROUTE NOT FOUND", {
    method: req.method,
    url: req.originalUrl,
  });

  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error("UNHANDLED SERVER ERROR", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
  });

  if (err.name === "MulterError" || err.message === "Invalid file type") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
