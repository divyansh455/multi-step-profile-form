// frontend/src/components/Summary.js
import React from "react";
import ImagePreview from "./ImagePreview"; // Reuse image preview

const Summary = ({ formData }) => {
  // Helper to display boolean values nicely
  const formatBoolean = (value) => (value ? "Yes" : "No");

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <div className="summary-section">
      <h2>Review Your Information</h2>

      {/* Display Profile Picture Preview */}
      <div style={{ marginBottom: "1rem" }}>
        <strong>Profile Photo:</strong>
        {/* Pass the File object from formData for preview */}
        <ImagePreview
          file={formData.profilePhotoFile}
          existingImageUrl={formData.profilePhoto}
        />
        {/* Display filename if a new file was selected */}
        {formData.profilePhotoFile && (
          <p style={{ fontSize: "0.9em", marginTop: "5px" }}>
            New file selected: {formData.profilePhotoFile.name}
          </p>
        )}
      </div>

      <p>
        <strong>Username:</strong> {formData.username || "N/A"}
      </p>
      <p>
        <strong>Date of Birth:</strong> {formatDate(formData.dateOfBirth)}
      </p>
      {/* Do NOT display passwords */}
      {formData.newPassword && (
        <p>
          <strong>Password:</strong> Will be updated
        </p>
      )}

      <hr style={{ margin: "1.5rem 0" }} />

      <p>
        <strong>Profession:</strong> {formData.profession || "N/A"}
      </p>
      {formData.profession === "Entrepreneur" && (
        <p>
          <strong>Company Name:</strong> {formData.companyName || "N/A"}
        </p>
      )}
      <p>
        <strong>Address Line 1:</strong> {formData.addressLine1 || "N/A"}
      </p>

      <hr style={{ margin: "1.5rem 0" }} />

      <p>
        <strong>Country:</strong> {formData.country || "N/A"}
      </p>
      <p>
        <strong>State:</strong> {formData.state || "N/A"}
      </p>
      <p>
        <strong>City:</strong> {formData.city || "N/A"}
      </p>

      <hr style={{ margin: "1.5rem 0" }} />

      <p>
        <strong>Subscription Plan:</strong> {formData.subscriptionPlan || "N/A"}
      </p>
      <p>
        <strong>Newsletter Subscription:</strong>{" "}
        {formatBoolean(formData.newsletter)}
      </p>
      <p>
        <strong>Gender:</strong> {formData.gender || "N/A"}
      </p>
      {formData.gender === "Other" && (
        <p>
          <strong>Specified Gender:</strong> {formData.customGender || "N/A"}
        </p>
      )}
    </div>
  );
};

export default Summary;
