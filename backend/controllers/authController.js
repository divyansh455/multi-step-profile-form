// backend/controllers/authController.js
// Handles user registration and login logic

import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Ensure bcryptjs is imported if not already via User model methods
import {
  validateRequired,
  validatePasswordComplexity,
  validateUsername,
} from "../middleware/validationMiddleware.js";

// Function to generate JWT
const generateToken = (id) => {
  // Sign the token with the user ID and your JWT secret
  // Set an expiration time (e.g., '30d' for 30 days)
  // Ensure JWT_SECRET is set in your .env file
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not defined.");
    // In a real app, you might throw a more specific internal server error
    throw new Error("Server configuration error: JWT Secret not found.");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      username,
      password /* other required fields like email if added */,
    } = req.body;

    // --- Basic Validation ---
    let errors = {};
    const usernameErrors = validateUsername(username); // Use existing username validator
    if (usernameErrors) errors.username = usernameErrors;

    const passwordErrors = validatePasswordComplexity(password); // Use existing password validator
    if (passwordErrors) errors.password = passwordErrors;

    // Add validation for other required fields if you extend registration
    // Example:
    // const emailError = validateRequired(email, 'Email');
    // if (emailError) errors.email = [emailError];
    // // Add email format validation if needed

    if (Object.keys(errors).length > 0) {
      console.log("[Register User] Validation failed:", errors);
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // --- Check if user already exists ---
    const userExists = await User.findOne({ username });

    if (userExists) {
      console.log(`[Register User] User already exists: ${username}`);
      // Return a specific error for username being taken
      return res
        .status(400)
        .json({
          message: "Username already exists",
          errors: { username: ["Username is already taken."] },
        });
    }

    // --- Create new user ---
    // Note: The password will be hashed automatically by the pre-save hook in User.js
    console.log(`[Register User] Creating new user: ${username}`);
    const user = await User.create({
      username,
      password,
      // Add default values for other required fields from your User model if necessary
      // e.g., if 'profession' is required but not part of registration form:
      // profession: 'Student', // Or fetch from req.body if added to form
    });

    if (user) {
      console.log(`[Register User] User created successfully: ${user._id}`);
      // Generate token and send back user info (excluding password)
      const token = generateToken(user._id);
      res.status(201).json({
        // 201 Created status
        _id: user._id,
        username: user.username,
        // Include any other fields you want to return immediately after registration
        // profilePhoto: user.profilePhoto, // Example
        token: token, // Send the token to the frontend
      });
    } else {
      // This case might be less likely if validation passes, but handle defensively
      console.log("[Register User] Failed to create user after validation.");
      res.status(400); // Bad request
      throw new Error("Invalid user data");
    }
  } catch (error) {
    // Catch errors from User.create or other await calls
    console.error(`[Register User] Error: ${error.message}`, error.stack);
    // Avoid sending detailed internal errors to the client unless necessary
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500; // Keep existing error status if set
    res
      .status(statusCode)
      .json({ message: error.message || "User registration failed" });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // --- Basic Validation ---
    let errors = {};
    const usernameError = validateRequired(username, "Username");
    if (usernameError) errors.username = [usernameError];
    const passwordError = validateRequired(password, "Password");
    if (passwordError) errors.password = [passwordError];

    if (Object.keys(errors).length > 0) {
      console.log("[Login User] Validation failed:", errors);
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // --- Find user by username ---
    console.log(`[Login User] Attempting login for: ${username}`);
    const user = await User.findOne({ username });

    // --- Check if user exists and password matches ---
    // Use the matchPassword method defined in the User model
    if (user && (await user.matchPassword(password))) {
      console.log(`[Login User] Login successful for: ${username}`);
      // Generate token and send back user info (excluding password)
      const token = generateToken(user._id);
      res.json({
        _id: user._id,
        username: user.username,
        // Include any other user details needed by the frontend after login
        // profilePhoto: user.profilePhoto, // Example
        token: token, // Send the token
      });
    } else {
      console.log(`[Login User] Invalid credentials for: ${username}`);
      // Use a generic error message for security
      // Don't specify whether username or password was wrong
      res.status(401); // Unauthorized
      throw new Error("Invalid username or password");
    }
  } catch (error) {
    console.error(`[Login User] Error: ${error.message}`, error.stack);
    // Avoid sending detailed internal errors to the client unless necessary
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500; // Keep existing error status if set
    res.status(statusCode).json({ message: error.message || "Login failed" });
  }
};

export { registerUser, loginUser };
