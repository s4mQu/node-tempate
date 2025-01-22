import * as fs from "fs";
import * as path from "path";

const directories = [
  // Application layer
  "src/application/interfaces/repositories",
  "src/application/interfaces/services",
  "src/application/interfaces/use-cases",
  "src/application/services/agent",
  "src/application/services/speech",
  "src/application/services/llm",
  "src/application/use-cases/agent",
  "src/application/use-cases/code-review",
  "src/application/use-cases/documentation",

  // Domain layer
  "src/domain/entities",
  "src/domain/value-objects",
  "src/domain/events",

  // Infrastructure layer
  "src/infrastructure/config",
  "src/infrastructure/persistence/mongoose",
  "src/infrastructure/persistence/repositories",
  "src/infrastructure/speech/whisper",
  "src/infrastructure/speech/tts",
  "src/infrastructure/llm/langchain",
  "src/infrastructure/llm/llama",

  // Interfaces layer
  "src/interfaces/http/controllers",
  "src/interfaces/http/middlewares",
  "src/interfaces/http/routes",
  "src/interfaces/websocket/handlers",
  "src/interfaces/websocket/events",

  // Shared layer
  "src/shared/types",
  "src/shared/utils",
  "src/shared/errors",

  // Tests
  "tests/unit",
  "tests/integration",
  "tests/e2e",
];

function createDirectories() {
  directories.forEach((dir) => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Create base domain entity files
function createBaseFiles() {
  const entityFiles = [
    "src/domain/entities/Agent.ts",
    "src/domain/entities/CodeReview.ts",
    "src/domain/entities/Documentation.ts",
  ];

  entityFiles.forEach((file) => {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, "// TODO: Implement entity\n");
      console.log(`Created file: ${file}`);
    }
  });
}

createDirectories();
createBaseFiles();
