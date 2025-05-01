// frontend/src/api/index.js
// Helper functions for making API calls using Axios

import axios from "axios";

// Get the API base URL from environment variables
// Use REACT_APP_ for Create React App, VITE_ for Vite
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

// Create an Axios instance with default settings
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // *** REMOVED DEFAULT HEADERS ***
  // Let Axios set Content-Type automatically based on request data (JSON or FormData)
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// --- User API Calls ---

/**
 * Fetches the user profile data.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} - The user profile data.
 */
export const fetchUserProfile = async (userId) => {
  try {
    const { data } = await apiClient.get(`/users/profile/${userId}`);
    return data;
  } catch (error) {
    console.error(
      "Error fetching user profile:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch profile");
  }
};

/**
 * Updates the user profile.
 * @param {string} userId - The ID of the user.
 * @param {object} profileData - The updated profile data.
 * @returns {Promise<object>} - The updated user profile data.
 */
export const updateUserProfileAPI = async (userId, profileData) => {
  try {
    // Axios will set Content-Type to application/json for this automatically
    const { data } = await apiClient.put(
      `/users/profile/${userId}`,
      profileData
    );
    return data;
  } catch (error) {
    console.error(
      "Error updating user profile:",
      error.response?.data || error.message
    );
    // Rethrow the error object which might contain validation errors
    throw error.response?.data || new Error("Failed to update profile");
  }
};

/**
 * Checks if a username is available.
 * @param {string} username - The username to check.
 * @returns {Promise<boolean>} - True if available, false otherwise.
 */
export const checkUsername = async (username) => {
  try {
    const { data } = await apiClient.get(`/users/check-username/${username}`);
    return data.isAvailable; // Expecting { isAvailable: true/false }
  } catch (error) {
    console.error(
      "Error checking username:",
      error.response?.data || error.message
    );
    // Assume unavailable on error, or handle differently
    return false;
  }
};

// --- Location API Calls ---

/**
 * Fetches the list of countries.
 * @returns {Promise<Array>} - Array of country objects.
 */
export const fetchCountries = async () => {
  try {
    const { data } = await apiClient.get("/locations/countries");
    return data;
  } catch (error) {
    console.error(
      "Error fetching countries:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch countries");
  }
};

/**
 * Fetches states for a given country.
 * @param {string} countryId - The ID or identifier of the country.
 * @returns {Promise<Array>} - Array of state objects.
 */
export const fetchStates = async (countryId) => {
  if (!countryId) return []; // Don't fetch if no country is selected
  try {
    const { data } = await apiClient.get(`/locations/states/${countryId}`);
    return data;
  } catch (error) {
    console.error(
      "Error fetching states:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch states");
  }
};

/**
 * Fetches cities for a given state.
 * @param {string} stateId - The ID or identifier of the state.
 * @returns {Promise<Array>} - Array of city objects.
 */
export const fetchCities = async (stateId) => {
  if (!stateId) return []; // Don't fetch if no state is selected
  try {
    const { data } = await apiClient.get(`/locations/cities/${stateId}`);
    return data;
  } catch (error) {
    console.error(
      "Error fetching cities:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to fetch cities");
  }
};

// --- Upload API Call ---

/**
 * Uploads the profile picture file.
 * @param {File} file - The image file to upload.
 * @returns {Promise<object>} - Object containing the filePath of the uploaded image.
 */
export const uploadProfilePicAPI = async (file) => {
  // Use FormData to send the file
  const formData = new FormData();
  formData.append("profilePhoto", file); // 'profilePhoto' must match Multer field name

  try {
    // Axios will set Content-Type to multipart/form-data automatically for FormData
    const { data } = await apiClient.post("/upload/profile-picture", formData);
    // Removed explicit headers object as it's not needed here
    // headers: {},
    return data; // Expecting { message: '...', filePath: '...' }
  } catch (error) {
    console.error(
      "Error uploading profile picture:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to upload picture");
  }
};

// Export all functions
export default {
  fetchUserProfile,
  updateUserProfileAPI,
  checkUsername,
  fetchCountries,
  fetchStates,
  fetchCities,
  uploadProfilePicAPI,
};
