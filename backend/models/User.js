// backend/models/User.js
// Mongoose schema for the User profile

import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // For password hashing

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true, // Ensures username is unique in the database
      trim: true, // Removes whitespace from start and end
      minlength: [4, "Username must be at least 4 characters long"],
      maxlength: [20, "Username cannot exceed 20 characters"],
      // Custom validator to prevent spaces (can also use regex)
      validate: {
        validator: function (v) {
          // Returns true if the username does NOT contain spaces
          return !/\s/.test(v);
        },
        message: "Username cannot contain spaces",
      },
    },
    // Store only the hashed password
    password: {
      type: String,
      required: [true, "Password is required"],
      // Password complexity validation will be handled in controller/middleware
      // We don't store the 'currentPassword' or 'newPassword' fields directly
    },
    profilePhoto: {
      type: String, // Store the path or URL to the uploaded image
      // required: [true, 'Profile photo is required'], // Making it optional for update
      default: "/uploads/default_avatar.png", // Optional: Provide a default image path
    },
    profession: {
      type: String,
      enum: ["Student", "Developer", "Entrepreneur", "Other"], // Allowed values
      // required: [true, 'Profession is required'], // Making it optional for update
    },
    // Field for custom gender input if 'Other' is selected (as per initial requirement text)
    // Note: The field list image didn't include gender, but the text did. Adding it for completeness.
    // If you strictly follow the *final* field list, you can remove this.
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      // required: true // Assuming gender is required
    },
    customGender: {
      type: String,
      // This field is only relevant if gender is 'Other'
      // Validation can be handled in the controller based on the 'gender' field value
    },
    companyName: {
      type: String,
      trim: true,
      // Validation: Required only if profession is 'Entrepreneur' (handled in controller/middleware)
    },
    addressLine1: {
      type: String,
      // required: [true, 'Address Line 1 is required'], // Making it optional for update
      trim: true,
    },
    country: {
      type: String, // Store country name or ID
      // required: [true, 'Country is required'], // Making it optional for update
    },
    state: {
      type: String, // Store state name or ID
      // required: [true, 'State is required'], // Making it optional for update
    },
    city: {
      type: String, // Store city name or ID
      // required: [true, 'City is required'], // Making it optional for update
    },
    // Added Date of Birth based on requirements text
    dateOfBirth: {
      type: Date,
      // required: true, // Make it required if necessary
      // Validation for future dates handled in controller/middleware
    },
    subscriptionPlan: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"],
      // required: [true, 'Subscription plan is required'], // Making it optional for update
      default: "Basic",
    },
    newsletter: {
      type: Boolean,
      default: true, // Default checked
    },
    // Add timestamps for createdAt and updatedAt fields
  },
  {
    timestamps: true,
  }
);

// --- Password Hashing Middleware ---
// Hash password before saving a new user or when password is modified
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    console.log(
      "[User Model - pre save] Password not modified, skipping hash."
    ); // Debug Log
    return next();
  }

  try {
    console.log(
      "[User Model - pre save] Password modified, generating salt and hashing..."
    ); // Debug Log
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10); // 10 rounds of salting
    this.password = await bcrypt.hash(this.password, salt);
    console.log("[User Model - pre save] Password hashing successful."); // Debug Log
    next();
  } catch (error) {
    console.error("[User Model - pre save] Error hashing password:", error); // Debug Log
    next(error); // Pass error to the next middleware/handler
  }
});

// --- Password Comparison Method ---
// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Use bcrypt to compare the plain text password with the stored hash
  console.log("[User Model - matchPassword] Comparing entered password..."); // Debug Log
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log("[User Model - matchPassword] Comparison result:", isMatch); // Debug Log
  return isMatch;
};

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

export default User;
