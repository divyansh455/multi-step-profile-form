// backend/controllers/uploadController.js
// Controller for handling file uploads using Multer

import multer from "multer";
import path from "path";
import fs from "fs"; // File system module
import {
  validateFileType,
  validateFileSize,
} from "../middleware/validationMiddleware.js";

// --- Multer Configuration ---

// Define storage settings for uploaded files
const storage = multer.diskStorage({
  // Set the destination directory for uploads
  destination: (req, file, cb) => {
    // Correct path relative to the project root (assuming server.js is in backend/)
    const uploadPath = path.join(process.cwd(), "backend", "uploads");
    console.log(`[Multer Destination] Attempting to use path: ${uploadPath}`); // Debug Log
    // Create the directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath); // callback(error, destination)
  },
  // Define how files should be named
  filename: (req, file, cb) => {
    // Create a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(
      file.originalname
    )}`;
    console.log(`[Multer Filename] Generated filename: ${filename}`); // Debug Log
    cb(null, filename);
  },
});

// File filter function to validate file type and size
const fileFilter = (req, file, cb) => {
  // *** Debugging Log ***
  console.log(
    "[File Filter] Checking file:",
    file?.originalname,
    file?.mimetype
  ); // Added optional chaining

  // Validate file type (JPG/PNG)
  if (!validateFileType(file, ["image/jpeg", "image/png"])) {
    console.log("[File Filter] Rejected: Invalid file type"); // *** Debugging Log ***
    // Reject file with a specific error message
    return cb(new Error("Invalid file type. Only JPG and PNG allowed."), false);
  }

  console.log("[File Filter] Accepted file:", file.originalname); // *** Debugging Log ***
  cb(null, true); // Accept the file
};

// Create the Multer instance with storage, file filter, and limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB size limit
  },
}).single("profilePhoto"); // Expect a single file with field name 'profilePhoto'

// @desc    Upload profile picture
// @route   POST /api/upload/profile-picture
// @access  Private (should add auth middleware in real app)
const uploadProfilePicture = (req, res) => {
  // Use the Multer middleware
  upload(req, res, (err) => {
    // *** Debugging Logs ***
    console.log("[Upload Handler] Multer callback executed.");
    console.log("[Upload Handler] Error:", err);
    console.log("[Upload Handler] req.file:", req.file); // Log the file object processed by multer
    console.log("[Upload Handler] req.body:", req.body); // Log any text fields sent along

    // Handle Multer-specific errors (like file size limit)
    if (err instanceof multer.MulterError) {
      console.error("[Upload Handler] Multer Error:", err.code); // *** Debugging Log ***
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File too large. Maximum size is 2MB." });
      }
      // Handle other Multer errors if necessary
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Handle other errors (like the file type error from our filter)
      console.error("[Upload Handler] Other Error:", err.message); // *** Debugging Log ***
      return res.status(400).json({ message: err.message });
    }

    // Check if a file was actually uploaded *by multer*
    if (!req.file) {
      console.log("[Upload Handler] Failed: req.file is undefined/null."); // *** Debugging Log ***
      return res.status(400).json({ message: "No file uploaded." });
    }

    // File validation passed, file is uploaded.
    // Return the path to the uploaded file.
    console.log("[Upload Handler] Success: File uploaded to", req.file.path); // *** Debugging Log ***
    // The path needs to be accessible by the frontend (e.g., /uploads/filename.jpg)
    // Ensure the '/uploads' route is statically served in server.js
    res.status(200).json({
      message: "File uploaded successfully",
      // IMPORTANT: Send back the web-accessible path, not the full system path
      filePath: `/uploads/${req.file.filename}`,
    });
  });
};

export { uploadProfilePicture };
