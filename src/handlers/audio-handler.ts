import { Request, Response } from "express";
import { AudioService } from "../services/audio-service";
import { logger } from "../utils/logger";
import { callOllama } from "../services/llm/functions/call-ollama";

class AudioHandler {
  private audioService: AudioService;

  constructor() {
    this.audioService = new AudioService();
  }

  transcribe = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info("Received audio transcription request");

      if (!req.file) {
        logger.error("No file received in request");
        res.status(400).json({ error: "No audio file provided" });
        return;
      }

      // Log file details
      logger.info("Received file details:", {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });

      const transcription = await this.audioService.transcribeAudio(req.file.path);

      const response = await callOllama(transcription);

      console.log(response);

      res.status(200).json({
        success: true,
        transcription,
        fileDetails: {
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      logger.error("Error in audio transcription:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process audio file",
      });
    }
  };
}

export const audioHandler = new AudioHandler();
