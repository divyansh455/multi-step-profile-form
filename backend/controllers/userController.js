// backend/controllers/userController.js
// Controller for user-related operations

import User from "../models/User.js"; // Import User model
import bcrypt from "bcryptjs"; // For password comparison/hashing
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateUsername,
  validatePasswordComplexity,
  validateDOB,
} from "../middleware/validationMiddleware.js"; // Import custom validators

// @desc    Get user profile data
// @route   GET /api/users/profile/:userId
// @access  Private (should add auth middleware)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password"); // Exclude password

    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    // Use the errorMiddleware via next(error) for consistency, or handle here
    console.error(`Error in getUserProfile: ${error.message}`);
    const statusCode =
      res.statusCode === 200
        ? error.message === "User not found"
          ? 404
          : 500
        : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile/:userId
// @access  Private (should add auth middleware)
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`[Update Profile] Attempting to update user: ${userId}`); // Debug Log
    console.log(`[Update Profile] Received data:`, req.body); // Debug Log

    const user = await User.findById(userId);

    if (!user) {
      console.log(`[Update Profile] User not found: ${userId}`); // Debug Log
      res.status(404);
      throw new Error("User not found");
    }

    // --- Extract data from request body ---
    const {
      username,
      currentPassword, // For password change validation
      newPassword, // The new password
      profilePhoto, // Path from upload endpoint or existing path
      profession,
      gender, // Added based on req text
      customGender, // Added based on req text
      companyName,
      addressLine1,
      country,
      state,
      city,
      dateOfBirth, // Added based on req text
      subscriptionPlan,
      newsletter,
    } = req.body;

    // --- Perform Backend Validations ---
    let errors = {};
    console.log("[Update Profile] Starting validation..."); // Debug Log

    // Username validation (if changed)
    if (username && username !== user.username) {
      console.log(
        `[Update Profile] Validating username change: ${user.username} -> ${username}`
      ); // Debug Log
      const usernameErrors = validateUsername(username);
      if (usernameErrors) errors.username = usernameErrors;
      // Check uniqueness
      const existingUser = await User.findOne({ username: username });
      if (existingUser && existingUser._id.toString() !== userId) {
        console.log(`[Update Profile] Username ${username} is already taken.`); // Debug Log
        if (!errors.username) errors.username = [];
        errors.username.push("Username is already taken.");
      }
    }

    // Password change validation
    let passwordChanged = false;
    if (newPassword) {
      console.log("[Update Profile] Validating password change attempt."); // *** Debug Log ***
      const requiredCurrentPwdError = validateRequired(
        currentPassword,
        "Current Password"
      );
      if (requiredCurrentPwdError) {
        console.log(
          "[Update Profile] Current Password is required but missing."
        ); // *** Debug Log ***
        if (!errors.currentPassword) errors.currentPassword = [];
        errors.currentPassword.push(requiredCurrentPwdError);
      } else {
        // Check if current password matches
        console.log("[Update Profile] Checking current password match..."); // *** Debug Log ***
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          console.log("[Update Profile] Current password does not match."); // *** Debug Log ***
          if (!errors.currentPassword) errors.currentPassword = [];
          errors.currentPassword.push("Incorrect current password.");
        } else {
          console.log("[Update Profile] Current password matched."); // *** Debug Log ***
        }
      }
      // Validate new password complexity regardless of current password match for feedback
      const passwordComplexityErrors = validatePasswordComplexity(newPassword);
      if (passwordComplexityErrors) {
        console.log(
          "[Update Profile] New password complexity validation failed:",
          passwordComplexityErrors
        ); // *** Debug Log ***
        errors.newPassword = passwordComplexityErrors;
      } else {
        console.log(
          "[Update Profile] New password complexity validation passed."
        ); // *** Debug Log ***
      }

      // Only proceed with password change if *all* password-related validations passed
      if (!errors.currentPassword && !errors.newPassword) {
        passwordChanged = true;
        console.log(
          "[Update Profile] Password change validation fully passed. Flag set."
        ); // *** Debug Log ***
      } else {
        console.log(
          "[Update Profile] Password change validation failed overall:",
          { current: errors.currentPassword, new: errors.newPassword }
        ); // *** Debug Log ***
      }
    } else {
      console.log(
        "[Update Profile] No new password provided, skipping password change validation."
      ); // *** Debug Log ***
    }

    // Other field validations (add more as needed based on requirements)
    const professionError = validateRequired(profession, "Profession");
    if (professionError) errors.profession = [professionError];

    // Conditional validation: Company Name required if profession is Entrepreneur
    if (profession === "Entrepreneur") {
      const companyNameError = validateRequired(companyName, "Company Name");
      if (companyNameError) errors.companyName = [companyNameError];
    } else if (!companyName) {
      // Clear company name if profession is not Entrepreneur (optional)
      // user.companyName = undefined; // Or null
    }

    const addressError = validateRequired(addressLine1, "Address Line 1");
    if (addressError) errors.addressLine1 = [addressError];

    const countryError = validateRequired(country, "Country");
    if (countryError) errors.country = [countryError];

    const stateError = validateRequired(state, "State");
    if (stateError) errors.state = [stateError];

    const cityError = validateRequired(city, "City");
    if (cityError) errors.city = [cityError];

    const dobError = validateDOB(dateOfBirth);
    if (dobError) errors.dateOfBirth = [dobError];

    // Gender validation (if added)
    const genderError = validateRequired(gender, "Gender");
    if (genderError) errors.gender = [genderError];
    if (gender === "Other") {
      const customGenderError = validateRequired(customGender, "Custom Gender");
      if (customGenderError) errors.customGender = [customGenderError];
    }

    console.log(
      "[Update Profile] Validation finished. Errors:",
      JSON.stringify(errors)
    ); // Debug Log

    // --- If Validation Errors Exist, Return Them ---
    if (Object.keys(errors).length > 0) {
      console.log("[Update Profile] Validation failed, returning 400."); // Debug Log
      res.status(400).json({ message: "Validation failed", errors });
      return; // Stop execution
    }

    // --- Update User Fields ---
    console.log("[Update Profile] Updating user fields..."); // Debug Log
    user.username = username || user.username;
    // *** IMPORTANT: Use the profilePhoto path received in the request body ***
    // This path should have been updated by the separate upload call
    user.profilePhoto = profilePhoto || user.profilePhoto;
    user.profession = profession || user.profession;
    user.gender = gender || user.gender; // If added
    user.customGender = gender === "Other" ? customGender : undefined; // Clear if not 'Other'
    user.companyName =
      profession === "Entrepreneur"
        ? companyName || user.companyName
        : undefined; // Clear if not Entrepreneur
    user.addressLine1 = addressLine1 || user.addressLine1;
    user.country = country || user.country;
    user.state = state || user.state;
    user.city = city || user.city;
    user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth; // Store as Date object
    user.subscriptionPlan = subscriptionPlan || user.subscriptionPlan;
    // Checkbox value might be boolean `false` or absent, handle accordingly
    user.newsletter =
      newsletter === undefined ? user.newsletter : Boolean(newsletter);

    // Update password only if validation passed and new password provided
    if (passwordChanged) {
      console.log(
        "[Update Profile] Setting new password on user model (will be hashed on save)."
      ); // *** Debug Log ***
      user.password = newPassword; // The pre-save hook will hash it
    } else {
      console.log(
        "[Update Profile] passwordChanged flag is false, not updating password on model."
      ); // *** Debug Log ***
    }

    // --- Save Updated User ---
    console.log("[Update Profile] Calling user.save()..."); // *** Debug Log ***
    const updatedUser = await user.save();
    console.log("[Update Profile] User saved successfully."); // Debug Log

    // --- Return Updated User Data (excluding password) ---
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      profilePhoto: updatedUser.profilePhoto,
      profession: updatedUser.profession,
      gender: updatedUser.gender, // If added
      customGender: updatedUser.customGender, // If added
      companyName: updatedUser.companyName,
      addressLine1: updatedUser.addressLine1,
      country: updatedUser.country,
      state: updatedUser.state,
      city: updatedUser.city,
      dateOfBirth: updatedUser.dateOfBirth, // If added
      subscriptionPlan: updatedUser.subscriptionPlan,
      newsletter: updatedUser.newsletter,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    // Handle potential errors during find or save
    console.error(
      `[Update Profile] Error caught: ${error.message}`,
      error.stack
    ); // Debug Log
    const statusCode =
      res.statusCode && res.statusCode >= 400 ? res.statusCode : 500; // Keep existing status code if set (e.g., 400, 404)
    res
      .status(statusCode)
      .json({ message: error.message, errors: error.errors || {} }); // Include Mongoose validation errors if available
  }
};

// @desc    Check if username is available
// @route   GET /api/users/check-username/:username
// @access  Public
const checkUsernameAvailability = async (req, res) => {
  try {
    const username = req.params.username;
    // Simple check: Does a user with this username already exist?
    const userExists = await User.findOne({ username: username });

    res.json({ isAvailable: !userExists }); // Send back true if username is available, false otherwise
  } catch (error) {
    console.error(`Error in checkUsernameAvailability: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error checking username", error: error.message });
  }
};

export { getUserProfile, updateUserProfile, checkUsernameAvailability };
