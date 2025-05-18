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
    console.log("result", result);

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
// export const checkDrugInteractionsService = async (
//   patientId,
//   existingDrugIds,
//   newDrugIds
// ) => {
//   logger.info("Starting drug interaction check", {
//     patientId,
//     existingDrugCount: existingDrugIds.length,
//     newDrugCount: newDrugIds.length,
//   });

//   try {
//     // Step 1: Combine all drug IDs (existing + new)
//     const allDrugIds = Array.from(new Set([...existingDrugIds, ...newDrugIds]));
//     console.log("existing drug ids",existingDrugIds);
//     console.log("new drug ids",newDrugIds);
//     console.log("all drug ids",allDrugIds);

//     // Step 3: If fewer than 2 drugs, return a default response
//     if (allDrugIds.length < 2) {
//       logger.info("Insufficient drugs for interaction check", {
//         drugCount: allDrugIds.length,
//         existingDrugCount: existingDrugIds.length,
//         newDrugCount: drugIds.length,
//       });
//       return {
//         summary:
//           allDrugIds.length === 0
//             ? "No medications found for the patient"
//             : "No interactions possible with fewer than 2 drugs",
//         drugs: allDrugIds.map((drugId) => ({
//           drugName: drugId,
//           genericName: "",
//         })),
//         metadata: {
//           drugList: allDrugIds.join(","),
//           interactionListId: "0",
//           professional: false,
//         },
//         filterCounts: {
//           major: 0,
//           moderate: 0,
//           minor: 0,
//           food: 0,
//           therapeuticDuplication: 0,
//         },
//         interactions: [],
//         interactionsByDrug: [],
//       };
//     }

//     logger.info("Checking interactions for all drugs", {
//       totalDrugCount: allDrugIds.length,
//     });
//     const interactionResult = await fetchDrugInteractions(allDrugIds);

//     const { drugs, metadata, interactions, filterCounts } = interactionResult;

//     //mapping drugId with drugName and put it into object
//     const drugIds = metadata.drugList.split(",");
//     const drugMap = Object.fromEntries(
//       drugIds.map((id, idx) => [id, drugs[idx]?.drugName])
//     );

//     const newDrugNames = newDrugIds.map((id) => drugMap[id]);

//     //if there are interactions with new drugs then filter it
//     const filteredInteractions = interactions.filter((interaction) =>
//       interaction.drugs.some((drug) => newDrugNames.includes(drug.drugName))
//     );

//     // Step 4: Group interactions by new drug
//     const interactionsByDrug = newDrugIds.map((newDrugId) => {
//       const drugName = drugMap[newDrugId];
//       const drugInteractions = filteredInteractions.filter((interaction) =>
//         interaction.drugs.some((drug) => drug.drugName === drugName)
//       );

//       const majorInteractions = drugInteractions
//         .filter((i) => i.severity.toLowerCase() === "major")
//         .map((i) => i.description);
//       const moderateInteractions = drugInteractions
//         .filter((i) => i.severity.toLowerCase() === "moderate")
//         .map((i) => i.description);
//       const minorInteractions = drugInteractions
//         .filter((i) => i.severity.toLowerCase() === "minor")
//         .map((i) => i.description);
//       const therapeuticDuplications = drugInteractions
//         .filter((i) => i.severity.toLowerCase() === "therapeutic duplication")
//         .map((i) => i.description);

//       let summary = `No significant interactions found for ${drugName}.`;
//       if (majorInteractions.length > 0) {
//         summary = `Major interactions for ${drugName}: ${majorInteractions.join(". ")}`;
//       } else {
//         const summaries = [];
//         if (therapeuticDuplications.length)
//           summaries.push(
//             `Therapeutic duplications for ${drugName}: ${therapeuticDuplications.join(". ")}`
//           );
//         if (moderateInteractions.length)
//           summaries.push(
//             `Moderate interactions for ${drugName}: ${moderateInteractions.join(". ")}`
//           );
//         if (minorInteractions.length)
//           summaries.push(
//             `Minor interactions for ${drugName}: ${minorInteractions.join(". ")}`
//           );
//         summary = summaries.join(". ") || summary;
//       }

//       return {
//         drugName,
//         drugId: newDrugId,
//         summary,
//         interactions: drugInteractions,
//       };
//     }).filter((drug) => drug.interactions.length > 0); // Only include drugs with interactions

//     let majorCount = 0;
//     let moderateCount = 0;
//     let minorCount = 0;
//     let foodCount = 0;
//     let therapeuticDuplicationCount = 0;

//     filteredInteractions.forEach((i) => {
//       const severity = i.severity.toLowerCase();
//       if (severity === "major") majorCount++;
//       else if (severity === "moderate") moderateCount++;
//       else if (severity === "minor") minorCount++;
//       else if (severity === "food") foodCount++;
//       else if (severity === "therapeutic duplication")
//         therapeuticDuplicationCount++;
//     });

//     interactions = filteredInteractions;
//     filterCounts = {
//       major: majorCount,
//       moderate: moderateCount,
//       minor: minorCount,
//       food: foodCount,
//       therapeuticDuplication: therapeuticDuplicationCount,
//     };
//     interactionResult.interactionsByDrug = interactionsByDrug;

//     logger.info("Filtered interactions involving new drugs", {
//       interactionCount: filteredInteractions.length,
//     });

//     return await interactionResult;

//   } catch (error) {
//     logger.error("Error in drug interaction check", {
//       error: error.message,
//       patientId,
//       drugCount: drugIds.length,
//     });
//     throw error instanceof ErrorHandlerClass
//       ? error
//       : new ErrorHandlerClass(
//           "Error checking drug interactions",
//           500,
//           "Server Error",
//           "Error in checkDrugInteractionsService",
//           { error: error.message }
//         );
//   }
// };

export const checkDrugInteractionsService = async (
  patientId,
  existingDrugIds,
  newDrugs
) => {
  logger.info("Starting drug interaction check", {
    patientId,
    existingDrugCount: existingDrugIds.length,
    newDrugCount: newDrugs.length,
  });

  try {
    // Step 1: Combine all drug IDs (existing + new)
    const newDrugIds = newDrugs.map((drug) => drug.drugId);
    const allDrugIds = Array.from(new Set([...existingDrugIds, ...newDrugIds]));
    console.log("existing drug ids", existingDrugIds);
    console.log("new drug ids", newDrugIds);
    console.log("all drug ids", allDrugIds);

    // Step 2: If fewer than 2 drugs, return a default response
    if (allDrugIds.length < 2) {
      logger.info("Insufficient drugs for interaction check", {
        drugCount: allDrugIds.length,
        existingDrugCount: existingDrugIds.length,
        newDrugCount: newDrugIds.length,
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
        interactionsByDrug: [],
      };
    }

    logger.info("Checking interactions for all drugs", {
      totalDrugCount: allDrugIds.length,
    });
    const interactionResult = await fetchDrugInteractions(allDrugIds);

    const { drugs, metadata, interactions, filterCounts } = interactionResult;

    // Mapping drugId with drugName
    const drugIds = metadata.drugList.split(",");
    const drugMap = Object.fromEntries(
      drugIds.map((id, idx) => [id, drugs[idx]?.drugName || id])
    );

    const newDrugNames = newDrugs.map((drug) => drugMap[drug.drugId]);

    // Filter interactions involving new drugs
    const filteredInteractions = interactions.filter((interaction) =>
      interaction.drugs.some((drug) => newDrugNames.includes(drug.drugName))
    );

    // Group interactions by new drug
    const interactionsByDrug = newDrugs
      .map((newDrug) => {
        const drugName = drugMap[newDrug.drugId] || newDrug.drugName;
        const drugInteractions = filteredInteractions.filter((interaction) =>
          interaction.drugs.some((drug) => drug.drugName === drugName)
        );

        const majorInteractions = drugInteractions
          .filter((i) => i.severity.toLowerCase() === "major")
          .map((i) => i.description);
        const moderateInteractions = drugInteractions
          .filter((i) => i.severity.toLowerCase() === "moderate")
          .map((i) => i.description);
        const minorInteractions = drugInteractions
          .filter((i) => i.severity.toLowerCase() === "minor")
          .map((i) => i.description);
        const therapeuticDuplications = drugInteractions
          .filter((i) => i.severity.toLowerCase() === "therapeutic duplication")
          .map((i) => i.description);

        let summary = `No significant interactions found for ${drugName}.`;
        if (majorInteractions.length > 0) {
          summary = `Major interactions for ${drugName}: ${majorInteractions.join(
            ". "
          )}`;
        } else {
          const summaries = [];
          if (therapeuticDuplications.length)
            summaries.push(
              `Therapeutic duplications for ${drugName}: ${therapeuticDuplications.join(
                ". "
              )}`
            );
          if (moderateInteractions.length)
            summaries.push(
              `Moderate interactions for ${drugName}: ${moderateInteractions.join(
                ". "
              )}`
            );
          if (minorInteractions.length)
            summaries.push(
              `Minor interactions for ${drugName}: ${minorInteractions.join(
                ". "
              )}`
            );
          summary = summaries.join(". ") || summary;
        }

        return {
          drugName,
          drugId: newDrug.drugId,
          summary,
          interactions: drugInteractions,
        };
      })
      .filter((drug) => drug.interactions.length > 0);

    // Update interactionResult
    interactionResult.interactions = filteredInteractions;
    interactionResult.filterCounts = {
      major: filteredInteractions.filter(
        (i) => i.severity.toLowerCase() === "major"
      ).length,
      moderate: filteredInteractions.filter(
        (i) => i.severity.toLowerCase() === "moderate"
      ).length,
      minor: filteredInteractions.filter(
        (i) => i.severity.toLowerCase() === "minor"
      ).length,
      food: filteredInteractions.filter(
        (i) => i.severity.toLowerCase() === "food"
      ).length,
      therapeuticDuplication: filteredInteractions.filter(
        (i) => i.severity.toLowerCase() === "therapeutic duplication"
      ).length,
    };
    interactionResult.interactionsByDrug = interactionsByDrug;

    logger.info("Filtered interactions involving new drugs", {
      interactionCount: filteredInteractions.length,
    });

    return interactionResult;
  } catch (error) {
    logger.error("Error in drug interaction check", {
      error: error.message,
      patientId,
      drugCount: allDrugIds.length,
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
