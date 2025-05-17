import { spawn } from "child_process";
import path from "path";

export class TTSService {
  private readonly pythonScriptPath: string;
  private readonly pythonCommand: string;

  constructor() {
    this.pythonScriptPath = path.join(__dirname, "kokoro-tts", "use-kokoro.py");
    // Try python3 first, fall back to python
    this.pythonCommand = process.platform === "win32" ? "python" : "python3";
  }

  async generateSpeech(text: string, voice: string = "bf_emma"): Promise<string> {
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
          outputPath = match[1];
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

        resolve(outputPath);
      });
    });
  }
}
