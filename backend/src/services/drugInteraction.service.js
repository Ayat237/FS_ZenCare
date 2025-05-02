import axios from "axios";
import { load } from "cheerio";
import { ErrorHandlerClass, logger } from "../utils/index.js";
import { MedicationModel } from "../../database/models/medications.model.js";
import database from "../../database/databaseConnection.js";

const medicationModel = new MedicationModel(database);
export const fetchDrugInteractions = async (drugIds) => {
  try {
    const drugList = drugIds.join(",");
    const url = `https://www.drugs.com/interactions-check.php?drug_list=${drugList}`;
    const response = await axios.get(url, { timeout: 50000 });

    const html = response.data;
    const $ = load(html);

    // Step 1: Extract the interaction summary
    // const summaryElement = $("p.ddc-mgb-0");
    // const summaryText = summaryElement.text().trim() || "No interactions found between the selected drugs";

    // Step 2: Extract the list of drugs
    const drugs = [];
    $("p.ddc-mgb-0 + ul li").each((index, element) => {
      const drugName = $(element).find("b").text().trim();
      const genericName = $(element)
        .text()
        .replace(drugName, "")
        .trim()
        .replace(/^\(|\)$/g, "");
      drugs.push({ drugName, genericName });
    });

    // Step 3: Extract hidden form inputs (metadata)
    const drugListInput = $('input[name="drug_list"]').val() || "";
    const interactionListId =
      $('input[name="interaction_list_id"]').val() || "";
    const professionalValue = $('input[name="professional"]').val() || "0";

    // Step 4: Extract filter counts
    const filterCounts = {
      major: 0,
      moderate: 0,
      minor: 0,
      food: 0,
      therapeuticDuplication: 0,
    };
    $("#filters .ddc-form-check").each((index, element) => {
      const label = $(element).find("label span").text().trim(); // "Major (0)"
      const countMatch = label.match(/\((\d+)\)/); // Extract the number in parentheses
      const count = countMatch ? parseInt(countMatch[1], 10) : 0;

      if (label.includes("Major")) {
        filterCounts.major = count;
      } else if (label.includes("Moderate")) {
        filterCounts.moderate = count;
      } else if (label.includes("Minor")) {
        filterCounts.minor = count;
      } else if (label.includes("Food")) {
        filterCounts.food = count;
      } else if (label.includes("Therapeutic duplication")) {
        filterCounts.therapeuticDuplication = count;
      }
    });

    // Step 4: Extract interactions
    const interactions = [];
    const interactionsHeader = $(
      'h2:contains("Interactions between your drugs")'
    );
    if (interactionsHeader.length > 0) {
      const $wrapper = interactionsHeader.next(
        ".interactions-reference-wrapper"
      );
      if ($wrapper.length > 0) {
        $wrapper.find(".interactions-reference").each((index, element) => {
          const $interaction = $(element);

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

          // Extract description
          let descriptionHeader = $(".interactions-reference-header");
          let description = descriptionHeader
            .next("p")
            .text()
            .trim()
            .split(".")[0]; // Take the first sentence;

          // Clean up description (remove extra spaces, etc.)
          description = description.replace(/\s*\$\s*0\s*/, "").trim();

          interactions.push({
            severity,
            description,
            drugs: interactionDrugs,
          });
        });
      }
    }

    // Step 5: Summarize the first interaction (if any) for the summary field
    let summaryText = "No interactions found between the selected drugs.";
    if (interactions.length > 0) {
      const firstDescription = interactions[0].description;
      summaryText =
        firstDescription
          .split(".")
          .slice(0, 2) // Take the first two sentences
          .join(". ")
          .trim() + ".";
    }
    const summary = `<p>${summaryText}</p>`;

    return {
      summary,
      drugs,
      metadata: {
        drugList: drugListInput,
        interactionListId,
        professional: professionalValue === "1",
      },
      filterCounts,
      interactions,
    };
  } catch (error) {
    logger.error("Error fetching drug interactions:", {
      error: error.message,
      stack: error.stack,
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

// Service to check drug interactions
export const checkDrugInteractionsService = async (patientId, ...drugIds) => {
  try {
    const medications = await medicationModel.find(
      { patientId },
      { select: "drugId" }
    );
    if (!medications || medications.length === 0) {
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

    const existingDrugIds = medications
      .map((med) => med.drugId)
      .filter((id) => id && !drugIds.includes(id));
    const allDrugIds = [...new Set([...existingDrugIds, ...drugIds])];

    // Step 4: If fewer than 2 drugs, return a default response (no interactions possible)
    if (allDrugIds.length < 2) {
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
      };
    }

    return await fetchDrugInteractions(allDrugIds);
  } catch (error) {
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
