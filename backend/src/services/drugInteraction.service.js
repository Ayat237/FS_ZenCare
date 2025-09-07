import axios from "axios";
import { load } from "cheerio";
import { ErrorHandlerClass, logger } from "../utils/index.js";
import { MedicationModel } from "../../database/models/medications.model.js";
import database from "../../database/databaseConnection.js";
import { setTimeout } from "timers/promises"; // For retry delays

const medicationModel = new MedicationModel(database);

// Configure axios with retry logic
const axiosInstance = axios.create({
  timeout: 30000, // Reduced timeout for faster failure detection
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
});

// Retry logic for axios requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await axiosInstance.get(url);
    } catch (error) {
      if (i === retries - 1) throw error; // Last retry, throw the error
      logger.warn(`Retrying API request (${i + 1}/${retries})`, {
        url,
        error: error.message,
      });
      await setTimeout(RETRY_DELAY * (i + 1)); // Exponential backoff
    }
  }
};

/**
 * Fetches drug interactions from Drugs.com for the given drug IDs
 * @param {Array<string>} drugIds - Array of drug IDs to check interactions for
 * @returns {Promise<DrugInteractionResult>} Object containing interaction results
 * @throws {ErrorHandlerClass} Throws an error if the request fails
 */
export const fetchDrugInteractions = async (drugIds) => {
  logger.info("Starting drug interaction fetch", { drugCount: drugIds.length });

  try {
    const drugList = drugIds.join(",");
    const url = `https://www.drugs.com/interactions-check.php?drug_list=${drugList}`;
    logger.debug("Fetching interactions from Drugs.com", { url });

    // Fetch with retry logic
    const response = await fetchWithRetry(url);
    const html = response.data;

    // Load HTML with cheerio, optimized for faster parsing
    const $ = load(html, { normalizeWhitespace: true, decodeEntities: false });

    // Step 1: Extract the list of drugs
    const drugs = [];
    const drugElements = $("p.ddc-mgb-0 + ul li");
    for (let i = 0; i < drugElements.length; i++) {
      const element = drugElements.eq(i);
      const drugName = element.find("b").text().trim();
      const genericName = element
        .text()
        .replace(drugName, "")
        .trim()
        .replace(/^\(|\)$/g, "");
      drugs.push({ drugName, genericName });
    }

    // Step 2: Extract hidden form inputs (metadata)
    const metadata = {
      drugList: $('input[name="drug_list"]').val() || "",
      interactionListId: $('input[name="interaction_list_id"]').val() || "",
      professional: ($('input[name="professional"]').val() || "0") === "1",
    };

    // Step 3: Extract filter counts
    const filterCounts = {
      major: 0,
      moderate: 0,
      minor: 0,
      food: 0,
      therapeuticDuplication: 0,
    };
    const filterElements = $("#filters .ddc-form-check");
    for (let i = 0; i < filterElements.length; i++) {
      const label = filterElements.eq(i).find("label span").text().trim();
      const countMatch = label.match(/\((\d+)\)/);
      const count = countMatch ? parseInt(countMatch[1], 10) : 0;

      if (label.includes("Major")) filterCounts.major = count;
      else if (label.includes("Moderate")) filterCounts.moderate = count;
      else if (label.includes("Minor")) filterCounts.minor = count;
      else if (label.includes("Food")) filterCounts.food = count;
      else if (label.includes("Therapeutic duplication"))
        filterCounts.therapeuticDuplication = count;
    }

    // Step 4: Extract interactions under the specific header
    const interactions = [];
    const interactionsHeader = $(
      'h2:contains("Interactions between your drugs")'
    );
    if (interactionsHeader.length > 0) {
      const $wrapper = interactionsHeader.next(
        ".interactions-reference-wrapper"
      );
      if ($wrapper.length > 0) {
        const interactionElements = $wrapper.find(".interactions-reference");
        for (let i = 0; i < interactionElements.length; i++) {
          const $interaction = interactionElements.eq(i);

          // Extract severity
          const severity =
            $interaction.find(".ddc-status-label").text().trim() || "Unknown";

          // Extract drugs involved
          const appliesToText = $interaction
            .find(".interactions-reference-header p")
            .text()
            .trim();
          const appliesToMatch = appliesToText.match(
            /Applies to: ([\w\s-]+),\s*([\w\s-]+(?:\s*\([\w\s-]+\))?)/
          );
          const interactionDrugs = appliesToMatch
            ? [
                { drugName: appliesToMatch[1].trim(), genericName: "" },
                {
                  drugName: appliesToMatch[2]
                    .replace(/\s*\([\w\s-]+\)/, "")
                    .trim(),
                  genericName:
                    appliesToMatch[2].match(/\(([\w\s-]+)\)/)?.[1] || "",
                },
              ]
            : [];

          // Extract description (first sentence only)
          let descriptionHeader = $interaction.find(
            ".interactions-reference-header"
          );
          let description = "";
          let currentElement = descriptionHeader.next();

          while (
            currentElement.length &&
            !currentElement.hasClass("interactions-reference-header")
          ) {
            if (currentElement.is("p")) {
              description += currentElement.text().trim().split(".")[0] + " ";
            }
            currentElement = currentElement.next();
          }

          description = description.replace(/\s*\$\s*0\s*/, "").trim();

          interactions.push({
            severity,
            description,
            drugs: interactionDrugs,
          });
        }
      }
    }

    const result = {
      drugs,
      metadata,
      filterCounts,
      interactions,
    };

    logger.info("Drug interaction check completed", {
      drugCount: drugIds.length,
      interactionCount: interactions.length,
    });

    return result;
  } catch (error) {
    logger.error("Error fetching drug interactions", {
      error: error.message,
      drugCount: drugIds.length,
    });
    throw new ErrorHandlerClass(
      "Failed to fetch drug interactions",
      500,
      "Server Error",
      "Error fetching interactions from Drugs.com",
      { error: error.message }
    );
  }
};

/**
 * Service to check drug interactions for a patient's medications
 * @param {string} patientId - The ID of the patient
 * @param {...string} drugIds - One or more drug IDs to check interactions for
 * @returns {Promise<DrugInteractionResult>} Object containing interaction results
 * @throws {ErrorHandlerClass} Throws an error if the check fails
 */
export const checkDrugInteractionsService = async (patientId, ...drugIds) => {
  logger.info("Starting drug interaction check", {
    patientId,
    drugCount: drugIds.length,
  });

  try {
    // Step 1: Fetch patient's existing medications with projection
    const medications = await medicationModel.find(
      { patientId, isActive: true },
      { drugId: 1, _id: 0 } // Project only drugId, exclude _id
    );

    if (!medications || medications.length === 0) {
      logger.info("No existing medications found for patient", { patientId });
      return {
        summary: "No existing medications found for the patient",
        drugs: [],
        metadata: { drugList: [], interactionListId: "0", professional: false },
        filterCounts: {
          major: 0,
          moderate: 0,
          minor: 0,
          food: 0,
          therapeuticDuplication: 0,
        },
        interactions: [],
      };
    }

    // Step 2: Process existing medications
    const existingDrugIds = Array.from(
      new Set(
        medications
          .map((med) => med.drugId)
          .filter((id) => id && !drugIds.includes(id))
      )
    );
    const allDrugIds = Array.from(new Set([...existingDrugIds, ...drugIds]));

    // Step 3: If fewer than 2 drugs, return a default response
    if (allDrugIds.length < 2) {
      logger.info("Insufficient drugs for interaction check", {
        drugCount: allDrugIds.length,
        existingDrugCount: existingDrugIds.length,
        newDrugCount: drugIds.length,
      });
      return {
        summary:
          allDrugIds.length === 0
            ? "No medications found for the patient"
            : "No interactions possible with fewer than 2 drugs",
        drugs: allDrugIds.map((drugId) => ({
          drugName: drugId,
          genericName: "",
        })),
        metadata: {
          drugList: allDrugIds.join(","),
          interactionListId: "0",
          professional: false,
        },
        filterCounts: {
          major: 0,
          moderate: 0,
          minor: 0,
          food: 0,
          therapeuticDuplication: 0,
        },
        interactions: [],
      };
    }

    logger.info("Checking interactions for all drugs", {
      totalDrugCount: allDrugIds.length,
      existingDrugCount: existingDrugIds.length,
      newDrugCount: drugIds.length,
    });
    return await fetchDrugInteractions(allDrugIds);
  } catch (error) {
    logger.error("Error in drug interaction check", {
      error: error.message,
      patientId,
      drugCount: drugIds.length,
    });
    throw error instanceof ErrorHandlerClass
      ? error
      : new ErrorHandlerClass(
          "Error checking drug interactions",
          500,
          "Server Error",
          "Error in checkDrugInteractionsService",
          { error: error.message }
        );
  }
};
