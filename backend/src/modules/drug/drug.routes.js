import express from "express";
import { getAllDrugs, searchDrugs } from "./drug.controller.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { searchDrugsSchema } from "./drug.validation.js";
import {  authenticattion } from "../../middlewares/authentication.middleware.js";
import { errorHandling } from "../../middlewares/error-hanling.middleware.js";

const router = express.Router();

/**
 * @route GET /drugs/all
 * @desc Get all drugs sorted alphabetically by name
 * @access Private
 */
router.get("/all", authenticattion(), errorHandling(getAllDrugs));

/**
 * @route GET /drugs/search
 * @desc Search drugs by name (case-insensitive partial match)
 * @access Private
 */
router.get(
  "/search",
  authenticattion(),
  validation(searchDrugsSchema),
  errorHandling(searchDrugs)
);

export const drugRoutes = router;