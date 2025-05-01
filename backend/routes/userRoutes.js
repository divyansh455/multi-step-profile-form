import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  checkUsernameAvailability,
} from "../controllers/userController.js";
// import { protect } from '../middleware/authMiddleware.js'; // Optional: Add authentication middleware

const router = express.Router();

// Route to check username availability (publicly accessible)
router.get("/check-username/:username", checkUsernameAvailability);

// Routes requiring user ID (potentially protected)
// Ensure the GET request for profile uses :userId parameter
router
  .route("/profile/:userId")
  .get(/* protect, */ getUserProfile) // GET request for fetching
  .put(/* protect, */ updateUserProfile); // PUT request for updating

export default router;
