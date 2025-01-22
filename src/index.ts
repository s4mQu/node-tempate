import "reflect-metadata";
import express from "express";
import { Container } from "inversify";
import { config } from "dotenv";
import cors from "cors";
import helmet from "helmet";

// Load environment variables
config();

const app = express();
const container = new Container();
const port = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Basic health check endpoint
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { app, container };
