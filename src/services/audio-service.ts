import { exec } from "child_process";
import { promisify } from "util";
import { stat } from "fs/promises";
import { logger } from "../utils/logger";
import { nodewhisper } from "nodejs-whisper";
import path from "path";
import { filterWhisperOutput } from "../utils/filterWhisperOutput";

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

      logger.info(`Starting transcription for file: ${filePath}`);

      // Convert to proper WAV format first
      const outputPath = path.join(path.dirname(filePath), `converted-${path.basename(filePath)}`);

      logger.info(`Converting audio to proper WAV format: ${outputPath}`);

      // Convert to 16kHz, 16-bit, mono WAV
      await execAsync(`ffmpeg -i "${filePath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputPath}"`);

      logger.info(`Conversion complete, starting whisper transcription`);

      // Transcribe using Whisper
      const result = await nodewhisper(outputPath, {
        modelName: "tiny.en",
        logger: console,
        whisperOptions: {
          outputInJsonFull: true,
          language: "en",
          timestamps_length: 14,
        },
      });

      logger.info(`Transcription completed successfully`);

      const cleanTranscription = filterWhisperOutput(result);
      console.log(cleanTranscription);
      return cleanTranscription;
    } catch (error) {
      logger.error("Error in transcription service:", error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }
}
