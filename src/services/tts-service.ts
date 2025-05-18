import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { getIO } from "../config/socketIO-config";
import { watchTTSFolder } from "../utils/tts-folder-listener";

export class TTSService {
  private readonly pythonScriptPath: string;
  private readonly pythonCommand: string;
  private readonly outputDir: string;

  constructor() {
    this.pythonScriptPath = path.join(__dirname, "kokoro-tts", "use-kokoro.py");
    // Try python3 first, fall back to python
    this.pythonCommand = process.platform === "win32" ? "python" : "python3";
    this.outputDir = path.join(__dirname, "..", "audio", "tts");
  }

  async generateSpeech(text: string, voice: string = "bf_emma"): Promise<string> {
    const io = getIO(); // this gives us access to the socket.io server instance.
    const watcher = watchTTSFolder(); // this is used to watch the tts folder for new files.

    // when a new file is added. send the wav file to the client:
    watcher.on("add", (filePath) => {
      console.log("TTS file detected:", filePath);
      try {
        // Check if file exists and get its stats
        const stats = fs.statSync(filePath);
        console.log("File stats:", {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        });

        const fileBuffer = fs.readFileSync(filePath);

        // Send the file
        io.emit("tts-file-added", fileBuffer);
      } catch (error) {
        console.error("Error reading TTS file:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
          });
        }
      }
    });

    watcher.on("error", (error) => {
      console.error("TTS folder watcher error:", error);
    });

    return new Promise((resolve, reject) => {
      // Spawn Python process with text as direct argument
      const pythonProcess = spawn(this.pythonCommand, [
        this.pythonScriptPath,
        "--text",
        text,
        "--voice",
        voice,
      ]);

      let outputPath: string | null = null;
      let errorOutput = "";

      pythonProcess.stdout.on("data", (data) => {
        const output = data.toString();
        // Look for the generated audio file path in the output
        const match = output.match(/Saved audio to: (.+\.wav)/);
        if (match) {
          // Convert the Python path to a relative path from the output directory
          const fullPath = match[1];
          const fileName = path.basename(fullPath);
          outputPath = path.join(this.outputDir, fileName);
        }
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on("error", (error) => {
        if (error.message.includes("ENOENT")) {
          reject(
            new Error(
              `Python command '${this.pythonCommand}' not found. Please ensure Python is installed and available in your PATH.`
            )
          );
        } else {
          reject(error);
        }
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
          return;
        }

        if (!outputPath) {
          reject(new Error("No audio file was generated"));
          return;
        }
        io.emit("tts-file-added", "TTS process completed successfully.");

        // Wait a bit before closing the watcher to ensure the file is detected
        setTimeout(() => {
          watcher.close();
          resolve(outputPath as string);
        }, 2000);
      });
    });
  }
}
