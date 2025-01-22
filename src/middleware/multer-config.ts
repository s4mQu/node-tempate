import multer from "multer";
import path from "path";

const uploadsDir = path.join(__dirname, "../../uploads");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Using absolute path
  },
  filename: (req, file, cb) => {
    cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Configure file filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept audio files only
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported! Please upload an audio file."));
  }
};

// Create multer instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
