// frontend/src/components/Step3_Preferences.js
import React, { useState, useEffect } from "react";
import api from "../api"; // Import API helper
// Assuming utils is one level up from components: ../utils/
import { validateRequired } from "../utils/validation";

const Step3_Preferences = ({ formData, handleChange, errors, setErrors }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const data = await api.fetchCountries();
        setCountries(data || []);
      } catch (error) {
        console.error("Failed to load countries:", error);
        setErrors((prev) => ({
          ...prev,
          country: ["Failed to load countries"],
        }));
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, [setErrors]); // Dependency: setErrors

  // Fetch states when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (!formData.country) {
        setStates([]);
        setCities([]); // Also clear cities if country is cleared
        return;
      }
      setLoadingStates(true);
      setStates([]); // Clear previous states
      setCities([]); // Clear previous cities
      try {
        // Find the country object to get its ID (assuming API uses ID)
        // Adjust if your API uses name directly
        const selectedCountry = countries.find(
          (c) => c.name === formData.country
        );
        const countryId = selectedCountry
          ? selectedCountry.id
          : formData.country; // Use ID if found, else assume name is identifier

        const data = await api.fetchStates(countryId);
        setStates(data || []);
      } catch (error) {
        console.error("Failed to load states:", error);
        setErrors((prev) => ({ ...prev, state: ["Failed to load states"] }));
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.country, countries, setErrors]); // Dependencies: country value, countries list, setErrors

  // Fetch cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (!formData.state) {
        setCities([]);
        return;
      }
      setLoadingCities(true);
      setCities([]); // Clear previous cities
      try {
        // Find the state object to get its ID (assuming API uses ID)
        // Adjust if your API uses name directly
        const selectedState = states.find((s) => s.name === formData.state);
        const stateId = selectedState ? selectedState.id : formData.state; // Use ID if found, else assume name is identifier

        const data = await api.fetchCities(stateId);
        setCities(data || []);
      } catch (error) {
        console.error("Failed to load cities:", error);
        setErrors((prev) => ({ ...prev, city: ["Failed to load cities"] }));
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.state, states, setErrors]); // Dependencies: state value, states list, setErrors

  // Handle country change: update formData, reset state/city, validate
  const handleCountryChange = (e) => {
    const { name, value } = e.target;
    handleChange({ target: { name, value } }); // Update country
    // Reset state and city in formData
    handleChange({ target: { name: "state", value: "" } });
    handleChange({ target: { name: "city", value: "" } });
    // Clear dependent errors and validate country
    setErrors((prev) => ({
      ...prev,
      state: null,
      city: null,
      country: validateRequired(value, "Country")
        ? ["Country is required."]
        : null,
    }));
  };

  // Handle state change: update formData, reset city, validate
  const handleStateChange = (e) => {
    const { name, value } = e.target;
    handleChange({ target: { name, value } }); // Update state
    handleChange({ target: { name: "city", value: "" } }); // Reset city
    // Clear city error and validate state
    setErrors((prev) => ({
      ...prev,
      city: null,
      state: validateRequired(value, "State") ? ["State is required."] : null,
    }));
  };

  // Handle city change: update formData, validate
  const handleCityChange = (e) => {
    const { name, value } = e.target;
    handleChange({ target: { name, value } }); // Update city
    // Validate city
    setErrors((prev) => ({
      ...prev,
      city: validateRequired(value, "City") ? ["City is required."] : null,
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    handleChange({ target: { name, value: checked } });
  };

  return (
    <div className="form-step">
      <h2>Step 3: Location & Preferences</h2>

      {/* Country Dropdown */}
      <div className="form-group">
        <label htmlFor="country">Country</label>
        <select
          id="country"
          name="country"
          value={formData.country || ""}
          onChange={handleCountryChange}
          required
          disabled={loadingCountries}>
          <option value="" disabled>
            {loadingCountries ? "Loading countries..." : "-- Select Country --"}
          </option>
          {countries.map((country) => (
            // Use country name as value for simplicity, or country.id if preferred
            <option key={country.id || country.name} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        {errors?.country && (
          <p className="error-message">{errors.country.join(", ")}</p>
        )}
      </div>

      {/* State Dropdown */}
      <div className="form-group">
        <label htmlFor="state">State</label>
        <select
          id="state"
          name="state"
          value={formData.state || ""}
          onChange={handleStateChange}
          required
          disabled={!formData.country || loadingStates || states.length === 0} // Disable if no country or loading/no states
        >
          <option value="" disabled>
            {loadingStates
              ? "Loading states..."
              : formData.country
              ? "-- Select State --"
              : "Select Country first"}
          </option>
          {states.map((state) => (
            <option key={state.id || state.name} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>
        {errors?.state && (
          <p className="error-message">{errors.state.join(", ")}</p>
        )}
        {!loadingStates && formData.country && states.length === 0 && (
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            No states found for selected country.
          </p>
        )}
      </div>

      {/* City Dropdown */}
      <div className="form-group">
        <label htmlFor="city">City</label>
        <select
          id="city"
          name="city"
          value={formData.city || ""}
          onChange={handleCityChange}
          required
          disabled={!formData.state || loadingCities || cities.length === 0} // Disable if no state or loading/no cities
        >
          <option value="" disabled>
            {loadingCities
              ? "Loading cities..."
              : formData.state
              ? "-- Select City --"
              : "Select State first"}
          </option>
          {cities.map((city) => (
            <option key={city.id || city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
        {errors?.city && (
          <p className="error-message">{errors.city.join(", ")}</p>
        )}
        {!loadingCities && formData.state && cities.length === 0 && (
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            No cities found for selected state.
          </p>
        )}
      </div>

      {/* Subscription Plan */}
      <div className="form-group">
        <label>Subscription Plan</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="subscriptionPlan"
              value="Basic"
              checked={formData.subscriptionPlan === "Basic"}
              onChange={handleChange}
            />{" "}
            Basic
          </label>
          <label>
            <input
              type="radio"
              name="subscriptionPlan"
              value="Pro"
              checked={formData.subscriptionPlan === "Pro"}
              onChange={handleChange}
            />{" "}
            Pro
          </label>
          <label>
            <input
              type="radio"
              name="subscriptionPlan"
              value="Enterprise"
              checked={formData.subscriptionPlan === "Enterprise"}
              onChange={handleChange}
            />{" "}
            Enterprise
          </label>
        </div>
        {/* Add error display if subscription is required */}
        {errors?.subscriptionPlan && (
          <p className="error-message">{errors.subscriptionPlan.join(", ")}</p>
        )}
      </div>

      {/* Newsletter */}
      <div className="form-group">
        <div className="checkbox-group">
          <label htmlFor="newsletter">
            <input
              type="checkbox"
              id="newsletter"
              name="newsletter"
              checked={formData.newsletter || false} // Handle undefined case
              onChange={handleCheckboxChange}
            />
            Subscribe to newsletter
          </label>
        </div>
        {/* Add error display if newsletter selection is required */}
        {errors?.newsletter && (
          <p className="error-message">{errors.newsletter.join(", ")}</p>
        )}
      </div>
    </div>
  );
};

export default Step3_Preferences;
