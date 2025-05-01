// frontend/src/App.js
// Main application component

import React, { useState, useEffect } from "react";
import MultiStepForm from "./components/MultiStepForm";
import api from "./api"; // Import the API helper
import "./App.css"; // Import basic styling

function App() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- User ID Set ---
  // This ID corresponds to the user whose profile will be loaded/updated.
  const userId = "6813803f901d94862a009fd7"; // <-- User ID

  useEffect(() => {
    // Fetch initial user data when the component mounts
    const loadInitialData = async () => {
      // This check is now less likely to trigger unless the ID is manually removed again
      if (!userId || userId === "YOUR_USER_ID") {
        console.error(
          "User ID is missing or still set to the placeholder in App.js"
        );
        setError("User ID not configured.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching profile for user ID: ${userId}`); // Added log
        const data = await api.fetchUserProfile(userId);
        console.log("User data received:", data); // Added log
        setUserData(data);
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError(err.message || "Could not load user profile.");
        // Log the specific error from the API if available
        if (err.response?.data) {
          console.error("API Error details:", err.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [userId]); // Re-run if userId changes (though it's hardcoded here)

  return (
    <div className="App">
      <header className="App-header">
        <h1>User Profile Update</h1>
      </header>
      <main>
        {loading && <p>Loading profile...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {/* Render the form only when user data is loaded and no error */}
        {!loading && !error && userData && (
          <MultiStepForm initialData={userData} userId={userId} />
        )}
        {/* Message if loading finished, no error, but still no user data (e.g., user ID not found) */}
        {!loading && !error && !userData && userId !== "YOUR_USER_ID" && (
          <p>
            User not found or could not be loaded for ID: {userId}. Please check
            the ID and ensure the backend server is running and connected to the
            database.
          </p>
        )}
        {/* Message if the placeholder ID is somehow still present */}
        {userId === "YOUR_USER_ID" && !error && (
          <p className="error-message">
            Please configure a valid User ID in <code>frontend/src/App.js</code>{" "}
            to load the form.
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
