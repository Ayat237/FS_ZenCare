import axios from "axios";
import { load } from "cheerio";
import { ErrorHandlerClass, logger } from "../utils/index.js";
import { MedicationModel } from "../../database/models/medications.model.js";
import database from "../../database/databaseConnection.js";


const inferSeverity = (description) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('serious') || lowerDesc.includes('severe')) return 'Major';
  if (lowerDesc.includes('moderate')) return 'Moderate';
  return 'Minor';
};

const medicationModel = new MedicationModel(database);
export const fetchDrugInteractions = async (drugIds) => {
  try {
    const drugList = drugIds.join(",");
    const url = `https://www.drugs.com/interactions-check.php?drug_list=${drugList}`;
    const response = await axios.get(url, { timeout: 50000 });

    const html = response.data;
    const $ = load(html);

    // Step 1: Extract the interaction summary
    const summaryElement = $("p.ddc-mgb-0");
    const summaryText = summaryElement.text().trim() || "No summary available";;

    // Step 2: Extract the list of drugs
    const drugs = [];
    $('p.ddc-mgb-0 + ul li').each((index, element) => {
      const drugName = $(element).find('b').text().trim(); 
      const genericName = $(element).text().replace(drugName, '').trim().replace(/^\(|\)$/g, ''); 
      drugs.push({ drugName, genericName });
    });

    // Step 3: Extract hidden form inputs (metadata)
    const drugListInput = $('input[name="drug_list"]').val() || '';
    const interactionListId = $('input[name="interaction_list_id"]').val() || '';
    const professionalValue = $('input[name="professional"]').val() || '0';

   
    // Step 4: Extract filter counts
    const filterCounts = {
      major: 0,
      moderate: 0,
      minor: 0,
      food: 0,
      therapeuticDuplication: 0,
    };
    $('#filters .ddc-form-check').each((index, element) => {
      const label = $(element).find('label span').text().trim(); // e.g., "Major (0)"
      const countMatch = label.match(/\((\d+)\)/); // Extract the number in parentheses
      const count = countMatch ? parseInt(countMatch[1], 10) : 0;

      if (label.includes('Major')) {
        filterCounts.major = count;
      } else if (label.includes('Moderate')) {
        filterCounts.moderate = count;
      } else if (label.includes('Minor')) {
        filterCounts.minor = count;
      } else if (label.includes('Food')) {
        filterCounts.food = count;
      } else if (label.includes('Therapeutic duplication')) {
        filterCounts.therapeuticDuplication = count;
      }
    });

    // Step 5: Extract interactions
    const interactions = [];
    const interactionWrapper = $('.interactions-reference');

    const noInteractionsMessage = interactionWrapper.find('p b').text().trim();
    if (noInteractionsMessage.includes('No drug interactions were found')) {
      // No interactions to process
      return {
        summary: summaryText,
        drugs,
        metadata: {
          drugList: drugListInput,
          interactionListId,
          professional: professionalValue === '1' ? true : false,
        },
        filterCounts, // New field with counts for each interaction type
        interactions: [],
      };
    } else {
      const interactionHeader = interactionWrapper.find('.interactions-reference-header');
      if (interactionHeader.length) {
        const description = interactionHeader.find('p').text().trim();
        if (description) {
          const severity = inferSeverity(description);
          interactions.push({ severity ,description });
        }
      }

      $('.interactions-list .interaction-item').each((index, element) => {
        const severity = $(element).find('.severity').text().trim() || 'Unknown';
        const description = $(element).find('.description').text().trim() || 'No description available';
        interactions.push({ severity, description });
      });
    }
    return{
      summary: summaryText,
       drugs,
      metadata: {
        drugList: drugListInput,
        interactionListId,
        professional: professionalValue === '1' ? true : false,
      },
      filterCounts, // New field with counts for each interaction type
      interactions,
    }

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
export const checkDrugInteractionsService = async (patientId, drugId) => {
  try {
    const medications = await medicationModel.find({ patientId }, { select: 'drugId' });
    if (!medications || medications.length === 0) {
      return {
        summary: 'No existing medications found for the patient',
        drugs: [{ drugId }], 
        metadata: { drugList: drugId, interactionListId: '0', professional: false },
        filterCounts: { major: 0, moderate: 0, minor: 0, food: 0, therapeuticDuplication: 0 },
        interactions: [],
      };
    }

    const existingDrugIds = medications.map((med) => med.drugId);
    const allDrugIds = [...existingDrugIds, drugId];

    return await fetchDrugInteractions(allDrugIds);
  } catch (error) {
    throw error instanceof ErrorHandlerClass
      ? error
      : new ErrorHandlerClass(
          'Error checking drug interactions',
          500,
          'Server Error',
          'Error in checkDrugInteractionsService',
          { error: error.message }
        );
  }
};