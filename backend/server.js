// --- backend/server.js ---
// Make sure this file correctly defines __dirname and serves static files

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import path from "path";
import { fileURLToPath } from "url"; // Needed for __dirname in ES Modules

dotenv.config();
connectDB();
const app = express();

// --- ES Module equivalent of __dirname ---
// Gets the path to the current file (server.js)
const __filename = fileURLToPath(import.meta.url);
// Gets the directory name of the current file (the 'backend' folder)
const __dirname = path.dirname(__filename);

app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- API Routes ---
app.get("/api", (req, res) => {
  res.send("API is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/upload", uploadRoutes);

// --- Serve Uploads Statically ---
// Construct the absolute path to the 'uploads' directory inside 'backend'
const uploadsPath = path.join(__dirname, "uploads");
console.log(`[Server] Serving static files from directory: ${uploadsPath}`); // Debug Log
// Serve files from the 'uploads' directory at the '/uploads' URL path
app.use("/uploads", express.static(uploadsPath));

// --- Error Handling Middleware ---
app.use(notFound); // Handle 404 errors first
app.use(errorHandler); // Handle all other errors

// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(
    `[Server] Running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
