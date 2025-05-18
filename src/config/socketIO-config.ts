import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "../utils/logger";

let io: Server;

export const initializeWebSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const emitLog = (level: string, message: string, error?: any) => {
  if (io) {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      error: error
        ? {
            message: error.message || error,
            stack: error.stack,
          }
        : undefined,
    };

    io.emit("log", logData);
  }
};
