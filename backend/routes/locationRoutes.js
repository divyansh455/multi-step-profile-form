// backend/routes/locationRoutes.js
import express from "express";
import {
  getCountries,
  getStates,
  getCities,
} from "../controllers/locationController.js";

const router = express.Router();

router.get("/countries", getCountries);
router.get("/states/:countryId", getStates); // Use countryId or countryName as param
router.get("/cities/:stateId", getCities); // Use stateId or stateName as param

export default router;
