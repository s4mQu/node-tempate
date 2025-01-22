import { exec } from "child_process";
import { promisify } from "util";
import { stat } from "fs/promises";
import { logger } from "../utils/logger";

const execAsync = promisify(exec);

export class AudioService {
  async transcribeAudio(filePath: string): Promise<string> {
    try {
      // Log file details before processing
      const fileStats = await stat(filePath);
      logger.info(`File details:`, {
        path: filePath,
        size: fileStats.size,
        created: fileStats.birthtime,
        modified: fileStats.mtime,
      });

      // Here you would integrate with your chosen speech-to-text service
      logger.info(`Transcribing audio file: ${filePath}`);

      // Return the file path for now
      return `Audio file saved at: ${filePath}`;
    } catch (error) {
      logger.error("Error in transcription service:", error);
      throw new Error("Failed to transcribe audio");
    }
  }
}
