import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "../utils/logger";
import { FileWatcherService } from "../services/file-watcher-service";

let io: Server;
let fileWatcher: FileWatcherService;

export const initializeWebSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Initialize file watcher service
  fileWatcher = new FileWatcherService(io);

  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Start watching for new audio files when a client connects
    fileWatcher.startWatching();

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);

      // If no clients are connected, stop watching
      if (io.engine.clientsCount === 0) {
        fileWatcher.stopWatching();
      }
    });
  });

  return io;
};
