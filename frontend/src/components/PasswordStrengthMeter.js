// frontend/src/components/PasswordStrengthMeter.js
import React from "react";
// Assuming utils is one level up from components: ../utils/
import { calculatePasswordStrength } from "../utils/validation";

const PasswordStrengthMeter = ({ password }) => {
  const strength = calculatePasswordStrength(password); // Score 0-3

  const getStrengthProps = () => {
    switch (strength) {
      case 1:
        return {
          width: "33%",
          color: "#dc3545",
          text: "Weak",
          className: "strength-weak",
        }; // Red
      case 2:
        return {
          width: "66%",
          color: "#ffc107",
          text: "Medium",
          className: "strength-medium",
        }; // Yellow
      case 3:
        return {
          width: "100%",
          color: "#28a745",
          text: "Strong",
          className: "strength-strong",
        }; // Green
      default: // Score 0 or empty password
        return { width: "0%", color: "#eee", text: "", className: "" };
    }
  };

  const { width, color, text, className } = getStrengthProps();

  return (
    <div>
      <div className="password-strength-meter">
        <div
          className="strength-bar"
          style={{ width: width, backgroundColor: color }}></div>
      </div>
      {text && <div className={`strength-text ${className}`}>{text}</div>}
    </div>
  );
};

export default PasswordStrengthMeter;
