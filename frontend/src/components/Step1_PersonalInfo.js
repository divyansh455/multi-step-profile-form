// frontend/src/components/Step1_PersonalInfo.js
import React, { useState, useEffect, useCallback } from "react";
import ImagePreview from "./ImagePreview";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import api from "../api"; // For username check
// Assuming utils is one level up from components: ../utils/
import {
  validateUsernameFormat,
  validatePasswordComplexity,
  validateFile,
  validateDOB,
} from "../utils/validation";

const Step1_PersonalInfo = ({
  formData,
  handleChange,
  errors,
  setErrors,
  triggerValidation,
}) => {
  const [selectedFile, setSelectedFile] = useState(null); // Store the File object
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null | true | false
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false); // Track if user interacted

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  // Debounced username check function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkUsernameDebounced = useCallback(
    debounce(async (username) => {
      if (!username || validateUsernameFormat(username)) {
        // Only check if format is valid
        setUsernameAvailable(null);
        setUsernameLoading(false);
        return;
      }
      setUsernameLoading(true);
      try {
        const isAvailable = await api.checkUsername(username);
        setUsernameAvailable(isAvailable);
        // Update errors state if username is taken
        setErrors((prevErrors) => ({
          ...prevErrors,
          username: isAvailable ? null : ["Username is already taken."],
        }));
      } catch (error) {
        setUsernameAvailable(false); // Assume not available on error
        setErrors((prevErrors) => ({
          ...prevErrors,
          username: ["Error checking username."],
        }));
      } finally {
        setUsernameLoading(false);
      }
    }, 500), // 500ms delay
    [setErrors] // Dependency for useCallback
  );

  const handleUsernameChange = (e) => {
    const { name, value } = e.target;
    setUsernameTouched(true); // Mark as touched
    handleChange(e); // Update main form data
    setUsernameAvailable(null); // Reset availability status on change
    setErrors((prev) => ({ ...prev, username: validateUsernameFormat(value) })); // Basic format validation
    if (value && !validateUsernameFormat(value)) {
      setUsernameLoading(true); // Show loading indicator immediately
      checkUsernameDebounced(value); // Trigger debounced API check
    } else {
      setUsernameLoading(false); // Hide loading if format is invalid or empty
      // checkUsernameDebounced.cancel?.(); // Cancel any pending debounced call if needed (requires specific debounce implementation)
      // For basic debounce, just let it timeout if input becomes invalid
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileError = validateFile(file); // Validate file immediately
      if (fileError) {
        setErrors((prev) => ({ ...prev, profilePhoto: [fileError] }));
        setSelectedFile(null); // Clear selection if invalid
        handleChange({ target: { name: "profilePhotoFile", value: null } }); // Clear file in parent state
        handleChange({
          target: { name: "profilePhoto", value: formData.profilePhoto },
        }); // Keep existing path if upload fails
      } else {
        setSelectedFile(file);
        setErrors((prev) => ({ ...prev, profilePhoto: null })); // Clear error
        // Store the file object itself in a temporary state key for upload later
        // Or trigger upload immediately (depends on strategy)
        handleChange({ target: { name: "profilePhotoFile", value: file } }); // Pass file object up
        // We won't update formData.profilePhoto until upload is successful
      }
    }
  };

  // Handle password change for strength meter
  const handlePasswordChange = (e) => {
    handleChange(e);
    const passwordErrors = validatePasswordComplexity(e.target.value);
    setErrors((prev) => ({ ...prev, newPassword: passwordErrors }));
  };

  // Handle DOB change for validation
  const handleDOBChange = (e) => {
    handleChange(e);
    const dobError = validateDOB(e.target.value);
    setErrors((prev) => ({
      ...prev,
      dateOfBirth: dobError ? [dobError] : null,
    }));
  };

  // Function to get today's date in YYYY-MM-DD format for max attribute
  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="form-step">
      <h2>Step 1: Personal Information</h2>

      {/* Profile Photo */}
      <div className="form-group">
        {/* *** FIXED SYNTAX ERROR HERE by changing label text *** */}
        <label htmlFor="profilePhoto">
          Profile Photo (Required, max. 2MB, JPG/PNG)
        </label>
        <input
          type="file"
          id="profilePhoto"
          name="profilePhoto" // Keep name for label association, handle via specific state
          accept=".jpg, .jpeg, .png"
          onChange={handleFileChange}
        />
        {/* Pass the selectedFile state to ImagePreview */}
        <ImagePreview
          file={selectedFile}
          existingImageUrl={formData.profilePhoto}
        />
        {errors?.profilePhoto && (
          <p className="error-message">{errors.profilePhoto.join(", ")}</p>
        )}
      </div>

      {/* Username */}
      <div className="form-group">
        <label htmlFor="username">
          Username (Unique, 4-20 chars, no spaces)
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username || ""}
          onChange={handleUsernameChange}
          onBlur={() => setUsernameTouched(true)} // Check on blur if not touched yet
          required
        />
        {usernameLoading && <p>Checking availability...</p>}
        {!usernameLoading &&
          usernameTouched &&
          usernameAvailable === true &&
          formData.username &&
          !validateUsernameFormat(formData.username) && (
            <p className="success-message">Username available!</p>
          )}
        {!usernameLoading &&
          usernameTouched &&
          usernameAvailable === false &&
          formData.username && (
            <p className="error-message">Username is already taken.</p>
          )}
        {errors?.username && (
          <p className="error-message">{errors.username.join(", ")}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="form-group">
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth ? formData.dateOfBirth.split("T")[0] : ""} // Format for date input
          onChange={handleDOBChange}
          max={getTodayDate()} // Disable future dates
        />
        {errors?.dateOfBirth && (
          <p className="error-message">{errors.dateOfBirth.join(", ")}</p>
        )}
      </div>

      {/* Password Update Section */}
      <fieldset>
        <legend>Update Password (Optional)</legend>
        <p style={{ fontSize: "0.9em", color: "#666", marginBottom: "1rem" }}>
          Leave fields blank if you do not want to change your password.
        </p>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword || ""}
            onChange={handleChange}
            // required only if newPassword is set (validation handled in MultiStepForm/backend)
          />
          {errors?.currentPassword && (
            <p className="error-message">{errors.currentPassword.join(", ")}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">
            New Password (8+ chars, 1 special, 1 number)
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword || ""}
            onChange={handlePasswordChange} // Use specific handler for strength meter
            // required only if changing password
          />
          <PasswordStrengthMeter password={formData.newPassword || ""} />
          {errors?.newPassword && (
            <p className="error-message">{errors.newPassword.join(", ")}</p>
          )}
        </div>
      </fieldset>

      {/* Gender (Example based on req text, adjust if not needed) */}
      <div className="form-group">
        <label>Gender</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={formData.gender === "Male"}
              onChange={handleChange}
            />{" "}
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={formData.gender === "Female"}
              onChange={handleChange}
            />{" "}
            Female
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Other"
              checked={formData.gender === "Other"}
              onChange={handleChange}
            />{" "}
            Other
          </label>
        </div>
        {errors?.gender && (
          <p className="error-message">{errors.gender.join(", ")}</p>
        )}
      </div>

      {/* Custom Gender Input (Conditional) */}
      {formData.gender === "Other" && (
        <div className="form-group">
          <label htmlFor="customGender">Please specify:</label>
          <input
            type="text"
            id="customGender"
            name="customGender"
            value={formData.customGender || ""}
            onChange={handleChange}
            required // Required if gender is 'Other'
          />
          {errors?.customGender && (
            <p className="error-message">{errors.customGender.join(", ")}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Step1_PersonalInfo;
