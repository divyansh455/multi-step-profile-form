// backend/middleware/validationMiddleware.js
// Custom validation helpers (no third-party libs)

// --- Basic Field Validation ---
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required.`;
  }
  return null; // No error
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

// --- Username Validation ---
export const validateUsername = (username) => {
  let errors = [];
  const requiredError = validateRequired(username, "Username");
  if (requiredError) errors.push(requiredError);

  const minLengthError = validateMinLength(username, 4, "Username");
  if (minLengthError) errors.push(minLengthError);

  const maxLengthError = validateMaxLength(username, 20, "Username");
  if (maxLengthError) errors.push(maxLengthError);

  // Check for spaces
  if (/\s/.test(username)) {
    errors.push("Username cannot contain spaces.");
  }
  return errors.length > 0 ? errors : null;
};

// --- Password Complexity Validation ---
export const validatePasswordComplexity = (password) => {
  let errors = [];
  if (!password) return ["New Password is required."]; // Should be caught by required check too

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }
  // Regex checks: 1 number, 1 special character
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number.");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character.");
  }
  return errors.length > 0 ? errors : null;
};

// --- Date of Birth Validation ---
export const validateDOB = (dobString) => {
  if (!dobString) return null; // Optional field might not need validation if empty
  const dob = new Date(dobString);
  const today = new Date();
  // Set hours to 0 to compare dates only
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

// --- File Validation Helpers (used with Multer) ---
export const validateFileType = (
  file,
  allowedTypes = ["image/jpeg", "image/png"]
) => {
  return allowedTypes.includes(file.mimetype);
};

export const validateFileSize = (file, maxSizeMB = 2) => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to Bytes
  return file.size <= maxSize;
};
