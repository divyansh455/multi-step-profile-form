// frontend/src/utils/validation.js
// Frontend validation utility functions (mirroring backend logic)

// Re-exporting basic validators (can share code if using monorepo)
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required.`;
  }
  return null;
};

export const validateMinLength = (value, min, fieldName) => {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters long.`;
  }
  return null;
};

export const validateMaxLength = (value, max, fieldName) => {
  if (value && value.length > max) {
    return `${fieldName} cannot exceed ${max} characters.`;
  }
  return null;
};

// Username specific validation (client-side checks)
export const validateUsernameFormat = (username) => {
  let errors = [];
  const requiredError = validateRequired(username, "Username");
  if (requiredError) errors.push(requiredError);

  const minLengthError = validateMinLength(username, 4, "Username");
  if (minLengthError) errors.push(minLengthError);

  const maxLengthError = validateMaxLength(username, 20, "Username");
  if (maxLengthError) errors.push(maxLengthError);

  if (/\s/.test(username)) {
    errors.push("Username cannot contain spaces.");
  }
  return errors.length > 0 ? errors : null;
};

// Password complexity (client-side check)
export const validatePasswordComplexity = (password) => {
  let errors = [];
  // Don't require if it's not being changed (logic handled in component)
  if (!password) return null; // If empty, let required validation handle it if needed

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number.");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character.");
  }
  return errors.length > 0 ? errors : null;
};

// Calculate password strength score (0-3)
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  // Optional: Add checks for uppercase/lowercase for a higher score
  return score;
};

// Date of Birth (client-side check)
export const validateDOB = (dobString) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dob.setHours(0, 0, 0, 0);

  if (isNaN(dob.getTime())) {
    return "Invalid Date of Birth format.";
  }
  if (dob >= today) {
    return "Date of Birth cannot be today or a future date.";
  }
  return null;
};

// File Validation (client-side)
export const validateFile = (
  file,
  maxSizeMB = 2,
  allowedTypes = ["image/jpeg", "image/png"]
) => {
  if (!file) return "Profile photo is required."; // Or handle optional case

  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Only ${allowedTypes
      .map((t) => t.split("/")[1])
      .join(", ")} allowed.`;
  }

  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return `File too large. Maximum size is ${maxSizeMB}MB.`;
  }

  return null; // No error
};
