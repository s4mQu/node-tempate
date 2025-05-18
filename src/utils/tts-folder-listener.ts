import chokidar from "chokidar";
import path from "path";
import fs from "fs";

// Update the path to match the Docker container path
const TTS_AUDIO_DIR = path.join("/usr/src/app/src/audio/tts");

export function watchTTSFolder() {
  console.log("Watching TTS directory:", TTS_AUDIO_DIR);

  // Ensure directory exists
  if (!fs.existsSync(TTS_AUDIO_DIR)) {
    console.log("Creating TTS directory:", TTS_AUDIO_DIR);
    fs.mkdirSync(TTS_AUDIO_DIR, { recursive: true });
  }

  const watcher = chokidar.watch(TTS_AUDIO_DIR, {
    persistent: true,
    ignoreInitial: false, // Changed to false to detect existing files
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100,
    },
    usePolling: true, // Added polling
    interval: 100, // Poll every 100ms
    binaryInterval: 100,
  });

  // Log all events
  watcher
    .on("add", (filePath) => {
      console.log(`New file added: ${filePath}`);
      // Verify file exists and is readable
      try {
        const stats = fs.statSync(filePath);
        console.log("File stats:", {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        });
      } catch (error) {
        console.error("Error checking file:", error);
      }
    })
    .on("change", (filePath) => {
      console.log(`File changed: ${filePath}`);
    })
    .on("unlink", (filePath) => {
      console.log(`File removed: ${filePath}`);
    })
    .on("error", (error) => {
      console.error("Error occurred while watching folder:", error);
    })
    .on("ready", () => {
      console.log("File watcher is ready");
      // List all files in the directory
      const files = fs.readdirSync(TTS_AUDIO_DIR);
      console.log("Current files in directory:", files);
    });

  return watcher;
}
