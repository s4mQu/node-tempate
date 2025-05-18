import { watch } from "fs";
import path from "path";
import { logger } from "../utils/logger";
import { Server } from "socket.io";
import fs from "fs/promises";

export class FileWatcherService {
  private io: Server;
  private ttsDir: string;
  private watcher: ReturnType<typeof watch> | null = null;
  private processedFiles: Set<string> = new Set();

  constructor(io: Server) {
    this.io = io;
    this.ttsDir = path.join(__dirname, "..", "audio", "tts");
  }

  async startWatching() {
    if (this.watcher) {
      logger.info("File watcher is already running");
      return;
    }

    // Verify directory exists
    try {
      await fs.access(this.ttsDir);
      logger.info(`TTS directory exists at: ${this.ttsDir}`);
    } catch (error) {
      logger.error(`TTS directory not found at: ${this.ttsDir}`);
      throw new Error(`TTS directory not found: ${this.ttsDir}`);
    }

    logger.info(`Starting file watcher for directory: ${this.ttsDir}`);

    this.watcher = watch(this.ttsDir, async (eventType, filename) => {
      if (!filename) {
        logger.warn("Received watch event with no filename");
        return;
      }

      logger.debug(`Watch event: ${eventType} for file: ${filename}`);

      if (eventType === "rename" && filename.endsWith(".wav")) {
        const filePath = path.join(this.ttsDir, filename);

        try {
          // Verify file exists and is accessible
          await fs.access(filePath);
          const stats = await fs.stat(filePath);

          // Check if we've already processed this file
          if (this.processedFiles.has(filePath)) {
            logger.debug(`File already processed: ${filename}`);
            return;
          }

          // Add to processed files set
          this.processedFiles.add(filePath);

          // Emit the new audio file to all connected clients
          const fileInfo = {
            filename,
            path: filePath,
            timestamp: stats.mtime.getTime(),
            size: stats.size,
          };

          this.io.emit("newAudioFile", fileInfo);
          logger.info(`Emitted new audio file: ${filename}`, fileInfo);

          // Log connected clients
          const connectedClients = this.io.engine.clientsCount;
          logger.info(`Number of connected clients: ${connectedClients}`);
        } catch (error) {
          logger.error(`Error processing file ${filename}:`, error);
        }
      }
    });

    this.watcher.on("error", (error) => {
      logger.error("Error watching TTS directory:", error);
      this.stopWatching();
    });

    // Log initial directory contents
    try {
      const files = await fs.readdir(this.ttsDir);
      logger.info(`Initial directory contents: ${files.length} files found`);
      files.forEach((file) => logger.debug(`- ${file}`));
    } catch (error) {
      logger.error("Error reading initial directory contents:", error);
    }
  }

  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      logger.info("Stopped file watcher");
    }
  }

  // Add method to check watcher status
  getStatus() {
    return {
      isWatching: this.watcher !== null,
      directory: this.ttsDir,
      processedFilesCount: this.processedFiles.size,
      connectedClients: this.io.engine.clientsCount,
    };
  }
}
