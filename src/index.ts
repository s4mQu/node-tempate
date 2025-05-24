import { config } from "dotenv";
config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { logger } from "./utils/logger";
import { testRoute } from "./routes/test-route";

// Load environment variables

const app = express();

const port = process.env.PORT || 3030;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
    exposedHeaders: ["Content-Range", "Accept-Ranges", "Content-Length", "Content-Type"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());

// Routes
app.use("/api/test", testRoute);

// Basic health check endpoint
app.get("/health", (res: express.Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

export { app };
