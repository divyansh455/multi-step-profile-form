// frontend/src/components/MultiStepForm.js
import React, { useState, useEffect } from "react";
import Step1_PersonalInfo from "./Step1_PersonalInfo";
import Step2_ProfessionalDetails from "./Step2_ProfessionalDetails";
import Step3_Preferences from "./Step3_Preferences";
import Summary from "./Summary";
import api from "../api"; // Import API helper
// Assuming utils is one level up from components: ../utils/
import {
  validateRequired,
  validateUsernameFormat,
  validatePasswordComplexity,
  validateFile,
  validateDOB,
} from "../utils/validation";

const TOTAL_STEPS = 4; // 3 steps + 1 summary

const MultiStepForm = ({ initialData, userId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Initialize with initialData or defaults
    username: "",
    currentPassword: "", // Keep separate, don't fetch from backend
    newPassword: "", // Keep separate
    profilePhoto: "", // Stores the *path* of the current/uploaded photo
    profilePhotoFile: null, // Stores the actual File object for upload
    profession: "",
    companyName: "",
    addressLine1: "",
    country: "",
    state: "",
    city: "",
    dateOfBirth: null, // Initialize DOB
    subscriptionPlan: "Basic",
    newsletter: true,
    gender: "", // Initialize gender
    customGender: "", // Initialize custom gender
    ...initialData, // Spread initial data, potentially overwriting defaults
    // Ensure date is formatted correctly if coming from backend (might be ISO string)
    dateOfBirth: initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
      : null,
    // Ensure boolean is handled correctly
    newsletter:
      initialData?.newsletter !== undefined ? initialData.newsletter : true,
    // Clear passwords on load
    currentPassword: "",
    newPassword: "",
    profilePhotoFile: null, // Always start with null file
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    error: null,
    success: null,
  }); // { error: 'message', success: 'message' }

  // --- Input Change Handler ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // *** Special handling for file input to store the File object ***
    if (name === "profilePhotoFile") {
      setFormData((prev) => ({
        ...prev,
        profilePhotoFile: value, // 'value' here is the File object from Step1
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // --- Basic Real-time Validation (Optional but good UX) ---
    // Clear the specific error when user starts typing in a field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    // Clear file error when a new file is potentially selected
    if (name === "profilePhotoFile" && errors.profilePhoto) {
      setErrors((prev) => ({ ...prev, profilePhoto: null }));
    }
  };

  // --- Step Validation Logic ---
  const validateStep = (step) => {
    let stepErrors = {};
    const data = formData; // Current form data

    // --- Step 1 Validation ---
    if (step === 1) {
      // Profile Photo (Check if new file is selected OR if existing photo is missing and it's required initially)
      // Requirement says "Required", let's assume for update it means *having* one is required.
      // If they haven't uploaded a new one, the existing one should suffice.
      // We only validate the *new* file if one is selected.
      if (data.profilePhotoFile) {
        const fileError = validateFile(data.profilePhotoFile);
        if (fileError) stepErrors.profilePhoto = [fileError];
      } else if (!data.profilePhoto) {
        // If no new file AND no existing photo path, then it's missing.
        stepErrors.profilePhoto = ["Profile photo is required."];
      }

      // Username
      const usernameFormatErrors = validateUsernameFormat(data.username);
      if (usernameFormatErrors) stepErrors.username = usernameFormatErrors;
      // Note: Uniqueness check happens async via API, error added in Step1 component

      // DOB
      const dobError = validateDOB(data.dateOfBirth);
      if (dobError) stepErrors.dateOfBirth = [dobError];

      // Password (only if new password is entered)
      if (data.newPassword) {
        const currentPwdError = validateRequired(
          data.currentPassword,
          "Current Password"
        );
        if (currentPwdError) stepErrors.currentPassword = [currentPwdError];

        const newPwdErrors = validatePasswordComplexity(data.newPassword);
        if (newPwdErrors) stepErrors.newPassword = newPwdErrors;
      } else if (data.currentPassword && !data.newPassword) {
        // Prevent entering current without new
        stepErrors.newPassword = ["Please enter the new password."];
      }

      // Gender & Custom Gender
      const genderError = validateRequired(data.gender, "Gender");
      if (genderError) stepErrors.gender = [genderError];
      if (data.gender === "Other") {
        const customGenderError = validateRequired(
          data.customGender,
          "Custom Gender"
        );
        if (customGenderError) stepErrors.customGender = [customGenderError];
      }
    }

    // --- Step 2 Validation ---
    else if (step === 2) {
      const professionError = validateRequired(data.profession, "Profession");
      if (professionError) stepErrors.profession = [professionError];

      if (data.profession === "Entrepreneur") {
        const companyNameError = validateRequired(
          data.companyName,
          "Company Name"
        );
        if (companyNameError) stepErrors.companyName = [companyNameError];
      }

      const addressError = validateRequired(
        data.addressLine1,
        "Address Line 1"
      );
      if (addressError) stepErrors.addressLine1 = [addressError];
    }

    // --- Step 3 Validation ---
    else if (step === 3) {
      const countryError = validateRequired(data.country, "Country");
      if (countryError) stepErrors.country = [countryError];

      const stateError = validateRequired(data.state, "State");
      if (stateError) stepErrors.state = [stateError];

      const cityError = validateRequired(data.city, "City");
      if (cityError) stepErrors.city = [cityError];

      // Add validation for subscription plan if it's required
      // const subPlanError = validateRequired(data.subscriptionPlan, 'Subscription Plan');
      // if (subPlanError) stepErrors.subscriptionPlan = [subPlanError];
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0; // Return true if no errors
  };

  // --- Navigation Handlers ---
  const nextStep = () => {
    if (validateStep(currentStep)) {
      // Clear errors before moving to next step
      setErrors({});
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
      }
    }
    // If validation fails, errors state is already set by validateStep
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Clear errors when going back (optional, maybe keep them?)
      // setErrors({});
      setCurrentStep((prev) => prev - 1);
      // Clear submission status if going back from summary
      setSubmitStatus({ error: null, success: null });
    }
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Final validation across all steps (optional, but good practice)
    // const isValid = validateStep(1) && validateStep(2) && validateStep(3);
    // if (!isValid) {
    //     console.error("Validation errors exist across steps.");
    //     // Maybe navigate back to the first step with errors?
    //     // setCurrentStep(1); // Example
    //     return;
    // }

    setIsSubmitting(true);
    setSubmitStatus({ error: null, success: null });

    let finalProfilePhotoPath = formData.profilePhoto; // Start with existing path

    // --- Handle File Upload (if a new file was selected) ---
    if (formData.profilePhotoFile) {
      // *** ADDED CONSOLE LOG TO CHECK FILE OBJECT BEFORE UPLOAD ***
      console.log(
        "[handleSubmit] Attempting to upload file:",
        formData.profilePhotoFile
      );
      // Verify it's actually a File object
      if (!(formData.profilePhotoFile instanceof File)) {
        console.error(
          "[handleSubmit] formData.profilePhotoFile is not a File object:",
          formData.profilePhotoFile
        );
        setSubmitStatus({
          error: "Invalid file data selected.",
          success: null,
        });
        setIsSubmitting(false);
        return;
      }

      try {
        const uploadData = await api.uploadProfilePicAPI(
          formData.profilePhotoFile
        );
        console.log(
          "[handleSubmit] Upload successful, path:",
          uploadData.filePath
        ); // Log success
        finalProfilePhotoPath = uploadData.filePath; // Get the path from backend
      } catch (uploadError) {
        console.error(
          "[handleSubmit] Profile picture upload failed:",
          uploadError
        ); // Log error object
        setSubmitStatus({
          error: `Profile picture upload failed: ${
            uploadError.message || "Server error"
          }`,
          success: null,
        });
        // Set error specific to profile photo field if possible
        setErrors((prev) => ({
          ...prev,
          profilePhoto: [uploadError.message || "Upload failed"],
        }));
        setIsSubmitting(false);
        return; // Stop submission if upload fails
      }
    } else {
      console.log(
        "[handleSubmit] No new profile photo file selected for upload."
      ); // Log if no file
    }

    // --- Prepare Data for Backend ---
    // Exclude temporary fields like 'profilePhotoFile'
    const dataToSubmit = { ...formData };
    delete dataToSubmit.profilePhotoFile; // Don't send the file object itself
    dataToSubmit.profilePhoto = finalProfilePhotoPath; // Send the final path (new or existing)

    // Format date correctly if needed by backend (e.g., ensure it's ISO string or Date object)
    if (dataToSubmit.dateOfBirth) {
      // Ensure it's a valid date string before converting
      if (!isNaN(new Date(dataToSubmit.dateOfBirth).getTime())) {
        dataToSubmit.dateOfBirth = new Date(
          dataToSubmit.dateOfBirth
        ).toISOString();
      } else {
        console.warn(
          "[handleSubmit] Invalid dateOfBirth format before sending:",
          dataToSubmit.dateOfBirth
        );
        // Decide how to handle: send null, undefined, or keep original invalid string?
        // Sending null might be safer if backend expects a valid date or null.
        dataToSubmit.dateOfBirth = null;
      }
    }

    console.log(
      "[handleSubmit] Data being sent to updateUserProfileAPI:",
      dataToSubmit
    ); // Log data before final submit

    // --- Call Update API ---
    try {
      const updatedUser = await api.updateUserProfileAPI(userId, dataToSubmit);
      setSubmitStatus({
        success: "Profile updated successfully!",
        error: null,
      });
      console.log("[handleSubmit] Update successful:", updatedUser);
      // Optionally update formData with the response from backend, clear sensitive fields
      setFormData((prev) => ({
        ...prev,
        ...updatedUser,
        // Reformat date if needed for display
        dateOfBirth: updatedUser.dateOfBirth
          ? new Date(updatedUser.dateOfBirth).toISOString().split("T")[0]
          : null,
        currentPassword: "", // Clear password fields
        newPassword: "",
        profilePhotoFile: null, // Clear file object state
      }));
      // Maybe redirect or show a persistent success message after a delay
    } catch (error) {
      console.error("[handleSubmit] Profile update failed:", error); // Log error object
      const errorMessage =
        error.message || "An error occurred during submission.";
      setSubmitStatus({ error: errorMessage, success: null });
      // If backend returns validation errors in error.errors object:
      if (error.errors) {
        console.log("[handleSubmit] Backend validation errors:", error.errors);
        setErrors((prev) => ({ ...prev, ...error.errors })); // Merge backend errors
        // Optionally, navigate back to the first step with errors
        // Find the first step with an error key from error.errors and navigate there
        // Example: Find first error key and map to step number
        // const firstErrorField = Object.keys(error.errors)[0];
        // let errorStep = 1; // Default to step 1
        // if (['profession', 'companyName', 'addressLine1'].includes(firstErrorField)) errorStep = 2;
        // if (['country', 'state', 'city'].includes(firstErrorField)) errorStep = 3;
        // setCurrentStep(errorStep);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1_PersonalInfo
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <Step2_ProfessionalDetails
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 3:
        return (
          <Step3_Preferences
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 4:
        return <Summary formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Display current step content */}
      {renderStep()}

      {/* Display Submission Status */}
      {submitStatus.error && (
        <p
          className="error-message"
          style={{ textAlign: "center", marginTop: "1rem" }}>
          {submitStatus.error}
        </p>
      )}
      {submitStatus.success && (
        <p className="success-message">{submitStatus.success}</p>
      )}

      {/* Navigation Buttons */}
      {!submitStatus.success && ( // Hide navigation after successful submission
        <div className="form-navigation">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="prev-button">
            Previous
          </button>

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting} // Disable next if submitting
              className="next-button">
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-button">
              {isSubmitting ? "Submitting..." : "Submit Profile"}
            </button>
          )}
        </div>
      )}
    </form>
  );
};

export default MultiStepForm;
