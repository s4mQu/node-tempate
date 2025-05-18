import { Router } from "express";
import { audioHandler } from "../handlers/audio-handler";
import { upload } from "../middleware/multer-config";
import fs from "fs/promises";
import path from "path";
import { logger } from "../utils/logger";

const router = Router();

// Route for audio transcription
router.post("/transcribe", upload.single("audio"), audioHandler.transcribe);

// Test endpoint to check TTS directory
router.get("/tts-test", async (req, res) => {
  try {
    const ttsDir = path.join(__dirname, "..", "audio", "tts");

    // Check if directory exists
    try {
      await fs.access(ttsDir);
    } catch (error) {
      return res.status(404).json({
        error: "TTS directory not found",
        path: ttsDir,
      });
    }

    // List directory contents
    const files = await fs.readdir(ttsDir);
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(ttsDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      })
    );

    res.json({
      directory: ttsDir,
      exists: true,
      files: fileDetails,
    });
  } catch (error) {
    logger.error("Error checking TTS directory:", error);
    res.status(500).json({
      error: "Failed to check TTS directory",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
