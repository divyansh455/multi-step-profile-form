// backend/routes/uploadRoutes.js
import express from "express";
import { uploadProfilePicture } from "../controllers/uploadController.js";
// import { protect } from '../middleware/authMiddleware.js'; // Optional: Protect upload route

const router = express.Router();

// Define the POST route for uploading the profile picture
// The actual file handling is done within the controller using Multer middleware
router.post("/profile-picture", /* protect, */ uploadProfilePicture);

export default router;
