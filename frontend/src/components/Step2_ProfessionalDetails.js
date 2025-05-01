// frontend/src/components/Step2_ProfessionalDetails.js
import React from "react";
// Assuming utils is one level up from components: ../utils/
import { validateRequired } from "../utils/validation";

const Step2_ProfessionalDetails = ({
  formData,
  handleChange,
  errors,
  setErrors,
}) => {
  const handleProfessionChange = (e) => {
    handleChange(e); // Update form data
    const { value } = e.target;
    // Clear company name error if profession is not Entrepreneur
    if (value !== "Entrepreneur") {
      setErrors((prev) => ({ ...prev, companyName: null }));
      // Optionally clear the company name value itself
      // handleChange({ target: { name: 'companyName', value: '' } });
    } else {
      // Re-validate company name if switching TO Entrepreneur
      const companyError = validateRequired(
        formData.companyName,
        "Company Name"
      );
      setErrors((prev) => ({
        ...prev,
        companyName: companyError ? [companyError] : null,
      }));
    }
  };

  const handleCompanyNameChange = (e) => {
    handleChange(e);
    if (formData.profession === "Entrepreneur") {
      const companyError = validateRequired(e.target.value, "Company Name");
      setErrors((prev) => ({
        ...prev,
        companyName: companyError ? [companyError] : null,
      }));
    }
  };

  const handleAddressChange = (e) => {
    handleChange(e);
    const addressError = validateRequired(e.target.value, "Address Line 1");
    setErrors((prev) => ({
      ...prev,
      addressLine1: addressError ? [addressError] : null,
    }));
  };

  return (
    <div className="form-step">
      <h2>Step 2: Professional & Address Details</h2>

      {/* Profession */}
      <div className="form-group">
        <label htmlFor="profession">Profession</label>
        <select
          id="profession"
          name="profession"
          value={formData.profession || ""}
          onChange={handleProfessionChange}
          required>
          <option value="" disabled>
            -- Select Profession --
          </option>
          <option value="Student">Student</option>
          <option value="Developer">Developer</option>
          <option value="Entrepreneur">Entrepreneur</option>
          {/* Add 'Other' if needed based on your model */}
          {/* <option value="Other">Other</option> */}
        </select>
        {errors?.profession && (
          <p className="error-message">{errors.profession.join(", ")}</p>
        )}
      </div>

      {/* Company Name (Conditional) */}
      {formData.profession === "Entrepreneur" && (
        <div className="form-group">
          <label htmlFor="companyName">
            Company Name (Required for Entrepreneurs)
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName || ""}
            onChange={handleCompanyNameChange}
            required={formData.profession === "Entrepreneur"} // HTML5 required
          />
          {errors?.companyName && (
            <p className="error-message">{errors.companyName.join(", ")}</p>
          )}
        </div>
      )}

      {/* Address Line 1 */}
      <div className="form-group">
        <label htmlFor="addressLine1">Address Line 1</label>
        <input
          type="text"
          id="addressLine1"
          name="addressLine1"
          value={formData.addressLine1 || ""}
          onChange={handleAddressChange}
          required
        />
        {errors?.addressLine1 && (
          <p className="error-message">{errors.addressLine1.join(", ")}</p>
        )}
      </div>
    </div>
  );
};

export default Step2_ProfessionalDetails;
