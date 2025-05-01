// backend/controllers/locationController.js
// Placeholder controller for fetching location data

// @desc    Get list of countries
// @route   GET /api/locations/countries
// @access  Public
const getCountries = async (req, res) => {
  // In a real app, fetch this from your DB or an external API
  // Example placeholder data:
  const countries = [
    { id: "USA", name: "United States" },
    { id: "CAN", name: "Canada" },
    { id: "IND", name: "India" },
    // ... add more countries
  ];
  res.json(countries);
};

// @desc    Get list of states for a country
// @route   GET /api/locations/states/:countryId
// @access  Public
const getStates = async (req, res) => {
  const countryId = req.params.countryId;
  // In a real app, fetch states based on countryId
  // Example placeholder data:
  let states = [];
  if (countryId === "USA") {
    states = [
      { id: "NY", name: "New York" },
      { id: "CA", name: "California" },
    ];
  } else if (countryId === "CAN") {
    states = [
      { id: "ON", name: "Ontario" },
      { id: "QC", name: "Quebec" },
    ];
  } else if (countryId === "IND") {
    states = [
      { id: "DL", name: "Delhi" },
      { id: "MH", name: "Maharashtra" },
    ];
  }
  // ... add more logic
  res.json(states);
};

// @desc    Get list of cities for a state
// @route   GET /api/locations/cities/:stateId
// @access  Public
const getCities = async (req, res) => {
  const stateId = req.params.stateId;
  // In a real app, fetch cities based on stateId
  // Example placeholder data:
  let cities = [];
  if (stateId === "CA") {
    cities = [
      { id: "LA", name: "Los Angeles" },
      { id: "SF", name: "San Francisco" },
    ];
  } else if (stateId === "MH") {
    cities = [
      { id: "MUM", name: "Mumbai" },
      { id: "PUN", name: "Pune" },
    ];
  }
  // ... add more logic
  res.json(cities);
};

export { getCountries, getStates, getCities };
