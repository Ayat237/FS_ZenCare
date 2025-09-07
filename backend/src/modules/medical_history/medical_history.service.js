import { DateTime } from "luxon";
import database from "../../../database/databaseConnection.js";
import {
  MedicalHistory,
  MedicalHistoryModel,
} from "../../../database/models/index.js";
import { uploadFile } from "../../utils/cloudinary.utils.js";
import { nanoid } from "nanoid";
import { logger } from "../../utils/logger.utils.js";
import cloudinaryConfig from "../../config/cloudinary.config.js";

const medicalHistoryModel = new MedicalHistoryModel(database);
/**
 * Adds or updates a patient's medical history with the provided data.
 * If the patient does not have an existing medical history, a new one is created.
 * Updates are made for diagnoses, tests and rays, surgeries, vaccinations, and lifestyles
 * only if they do not already exist in the patient's history.
 *
 * @param {String} patientId - The ID of the patient whose medical history is being updated.
 * @param {Object} data - The data containing details of the medical history to be added or updated.
 * @param {Array} data.diagnoses - Array of diagnoses to be added.
 * @param {Array} data.testsAndRays - Array of tests and rays to be added.
 * @param {Array} data.surgeries - Array of surgeries to be added.
 * @param {Array} data.vaccination - Array of vaccinations to be added.
 * @param {Array} data.lifeStyles - Array of lifestyles to be added.
 *
 * @returns {Promise<Object>} The updated medical history document.
 * @throws {Error} If there is an issue with adding or updating the medical history.
 */

function isSameDate(a, b) {
  return DateTime.fromJSDate(a).toISO() === DateTime.fromJSDate(b).toISO();
}

function isSameDateLuxon(date1, date2) {
  return (
    DateTime.fromJSDate(new Date(date1)).toISODate() ===
    DateTime.fromJSDate(new Date(date2)).toISODate()
  );
}

// async function handleAttachment(item, type, folderType) {
//   if (item.attachment?.file && item.attachment.file.path) {
//     const customId = item.name + nanoid();
//     const attachmentResult = await uploadFile({
//       file: item.attachment.file.path,
//       folder: `${process.env.UPLOAD_FILE}/medical_history/${folderType}/${customId}`,
//     });
//     item.attachment = {
//       URL: {
//         public_id: attachmentResult.public_id,
//         secure_url: attachmentResult.secure_url,
//       },
//       customId: customId || null,
//     };
//   }
//   return item;
// }

// export const addMedicalHistoryService = async (patientId, data) => {
//   try {
//     const {
//       diagnoses = [],
//       testsAndRays = [],
//       surgeries = [],
//       vaccination = [],
//       lifeStyles = [],
//     } = data;
//     let medicalHistory = await medicalHistoryModel.findOne({ patientId });
//     if (!medicalHistory) {
//       medicalHistory = new MedicalHistory({ patientId });
//     }

//     // Diagnoses
//     if (diagnoses && Array.isArray(diagnoses)) {
//       for (let newDiagnosis of diagnoses) {
//         const exists = medicalHistory.diagnoses.some(
//           (diag) =>
//             diag.name === newDiagnosis.name &&
//             isSameDate(diag.date, newDiagnosis.date)
//         );
//         if (!exists) {
//           newDiagnosis = await handleAttachment(
//             newDiagnosis,
//             "diagnosis",
//             "diagnoses"
//           );
//           medicalHistory.diagnoses.push(newDiagnosis);
//         }
//       }
//     }

//     // Tests and Rays
//     if (testsAndRays && Array.isArray(testsAndRays)) {
//       for (let newTest of testsAndRays) {
//         const exists = medicalHistory.testsAndRays.some(
//           (test) =>
//             test.name === newTest.name && isSameDate(test.date, newTest.date)
//         );
//         if (!exists) {
//           newTest = await handleAttachment(newTest, "test", "tests_rays");
//           medicalHistory.testsAndRays.push(newTest);
//         }
//       }
//     }

//     // Surgeries
//     if (surgeries && Array.isArray(surgeries)) {
//       for (let newSurgery of surgeries) {
//         const exists = medicalHistory.surgeries.some(
//           (surg) =>
//             surg.name === newSurgery.name &&
//             isSameDate(surg.date, newSurgery.date)
//         );
//         if (!exists) {
//           medicalHistory.surgeries.push(newSurgery);
//         }
//       }
//     }

//     // Vaccination
//     if (vaccination && Array.isArray(vaccination)) {
//       for (let newVaccine of vaccination) {
//         const exists = medicalHistory.vaccination.some(
//           (vacc) =>
//             vacc.name === newVaccine.name &&
//             isSameDate(vacc.date, newVaccine.date)
//         );
//         if (!exists) {
//           medicalHistory.vaccination.push(newVaccine);
//         }
//       }
//     }

//     // LifeStyles
//     if (lifeStyles && Array.isArray(lifeStyles)) {
//       for (let newLifeStyle of lifeStyles) {
//         const exists = medicalHistory.lifeStyles.some(
//           (life) => life.name === newLifeStyle.name
//         );
//         if (!exists) {
//           medicalHistory.lifeStyles.push(newLifeStyle);
//         }
//       }
//     }
//     console.log("medicalHistory1", medicalHistory);

//     // Always save at the end
//     await medicalHistoryModel.save(medicalHistory);

//     console.log("medicalHistory2", medicalHistory);

//     return {
//       status: 201,
//       success: true,
//       message: "Medical history added or updated successfully",
//       data: medicalHistory,
//     };
//   } catch (error) {
//     logger.error("Error adding medical history", { error: error.message });
//     throw new Error(`Failed to add medical history: ${error.message}`);
//   }
// };

async function handleAttachment(item, type, folderType, file) {
  console.log("Handling attachment for item:", item.name, "File:", file);
  if (file) {
    if (!file.path && file.buffer) {
      const customId = item.name + "_" + nanoid(5);
      const attachmentResult = await uploadFile({
        file: file.buffer,
        folder: `${process.env.UPLOAD_FILE}/medical_history/${folderType}/${customId}`,
      });
      console.log("Upload result:", attachmentResult);
      item.attachment = {
        URL: {
          public_id: attachmentResult.public_id,
          secure_url: attachmentResult.secure_url,
        },
        customId: customId || null,
      };
    } else if (file.path) {
      const customId = item.name + nanoid();
      const attachmentResult = await uploadFile({
        file: file.path,
        folder: `${process.env.UPLOAD_FILE}/medical_history/${folderType}/${customId}`,
      });
      console.log("Upload result:", attachmentResult);
      item.attachment = {
        URL: {
          public_id: attachmentResult.public_id,
          secure_url: attachmentResult.secure_url,
        },
        customId: customId || null,
      };
    } else {
      console.log("File object invalid:", file);
    }
  }
  return item;
}

export const addMedicalHistoryService = async (patientId, data, files) => {
  try {
    console.log("Received data:", data, "File:", files);
    const {
      diagnoses = [],
      testsAndRays = [],
      surgeries = [],
      vaccination = [],
      lifeStyles = [],
    } = data;
    let medicalHistory = await medicalHistoryModel.findOne({ patientId });
    if (!medicalHistory) {
      // Initialize with empty arrays to ensure pre-save middleware works correctly
      medicalHistory = new MedicalHistory({ 
        patientId,
        diagnoses: [],
        testsAndRays: [],
        surgeries: [],
        vaccination: [],
        lifeStyles: []
      });
    }
    console.log("testsAndRays", testsAndRays.length);

    // Handle attachments based on field names
    if (files) {
      if (diagnoses.length > 0 && files.diagnosisAttachment) {
        diagnoses[0] = await handleAttachment(
          diagnoses[0],
          "diagnosis",
          "diagnoses",
          files.diagnosisAttachment[0]
        );
      }
      if (testsAndRays.length > 0 && files.testsAndRaysAttachment) {
        testsAndRays[0] = await handleAttachment(
          testsAndRays[0],
          "test",
          "tests_rays",
          files.testsAndRaysAttachment[0]
        );
      }
    }

    // Diagnoses
    if (diagnoses && Array.isArray(diagnoses)) {
      for (let newDiagnosis of diagnoses) {
        const exists = medicalHistory.diagnoses.some(
          (diag) =>
            diag.name === newDiagnosis.name &&
            isSameDate(diag.date, newDiagnosis.date)
        );
        if (!exists) {
          medicalHistory.diagnoses.push(newDiagnosis);
        }
      }
    }

    // Tests and Rays
    if (testsAndRays && Array.isArray(testsAndRays)) {
      for (let newTest of testsAndRays) {
        const exists = medicalHistory.testsAndRays.some(
          (test) =>
            test.name === newTest.name && isSameDate(test.date, newTest.date)
        );
        if (!exists) {
          medicalHistory.testsAndRays.push(newTest);
        }
      }
    }

    // Surgeries
    if (surgeries && Array.isArray(surgeries)) {
      for (let newSurgery of surgeries) {
        const exists = medicalHistory.surgeries.some(
          (surg) =>
            surg.name === newSurgery.name &&
            isSameDate(surg.date, newSurgery.date)
        );
        if (!exists) {
          medicalHistory.surgeries.push(newSurgery);
        }
      }
    }

    // Vaccination
    if (vaccination && Array.isArray(vaccination)) {
      for (let newVaccine of vaccination) {
        const exists = medicalHistory.vaccination.some(
          (vacc) =>
            vacc.name === newVaccine.name &&
            isSameDate(vacc.date, newVaccine.date)
        );
        if (!exists) {
          medicalHistory.vaccination.push(newVaccine);
        }
      }
    }

    // LifeStyles (now array of strings)
    if (lifeStyles && Array.isArray(lifeStyles)) {
      for (const newLifeStyle of lifeStyles) {
        if (!medicalHistory.lifeStyles.includes(newLifeStyle)) {
          medicalHistory.lifeStyles.push(newLifeStyle);
        }
      }
    }

    await medicalHistoryModel.save(medicalHistory);

    return {
      status: 201,
      success: true,
      message: "Medical history added or updated successfully",
      data: medicalHistory.decryptData(),
    };
    logger.info("Medical history added or updated successfully");
  } catch (error) {
    logger.error("Error adding medical history", { error: error.message });
    throw new Error(`Failed to add medical history: ${error.message}`);
  }
};

/**
 * Retrieves the medical history for a specific patient by their ID.
 *
 * @param {String} patientId - The ID of the patient whose medical history is being retrieved.
 * @returns {Promise<Object>} The medical history document if found.
 * @throws {Error} If the medical history is not found or retrieval fails.
 */

export const getMedicalHistoryService = async (patientId) => {
  try {
    const medicalHistory = await MedicalHistory.findOne({ patientId });
    if (!medicalHistory) {
      throw new Error("Medical history not found for this patient");
    }
    return medicalHistory.decryptData();
  } catch (error) {
    throw new Error(`Failed to get medical history: ${error.message}`);
  }
};

async function handleAttachmentUpdate(
  item,
  type,
  folderType,
  file,
  existingAttachment
) {
  console.log("Handling attachment update for item:", item, "File:", file);
  // Delete old attachment from Cloudinary if it exists
  if (existingAttachment?.URL?.public_id) {
    try {
      await cloudinaryConfig().uploader.destroy(
        existingAttachment.URL.public_id,
        (error, result) => {
          if (error) {
            logger.warn("Failed to delete old attachment from Cloudinary", {
              error,
              publicId: existingAttachment.URL.public_id,
            });
          } else {
            logger.info("Old attachment deleted from Cloudinary", {
              result,
              publicId: existingAttachment.URL.public_id,
            });
          }
        }
      );
    } catch (error) {
      logger.warn("Error deleting old attachment from Cloudinary", {
        error,
        publicId: existingAttachment.URL.public_id,
      });
    }
  }
  // Upload new attachment if provided, to the same customId folder
  if (file) {
    const customId =
      existingAttachment?.customId || item.name + "_" + nanoid(5);
    let resource_type = "image";
    let isPdf = false;
    if (file.mimetype) {
      isPdf = file.mimetype === "application/pdf";
    } else if (file.originalname) {
      isPdf = file.originalname.toLowerCase().endsWith(".pdf");
    }
    if (isPdf) resource_type = "raw";
    const uploadOptions = {
      folder: `${process.env.UPLOAD_FILE}/medical_history/${folderType}/${customId}`,
    };
    if (!file.path && file.buffer) {
      const attachmentResult = await uploadFile({
        file: file.buffer,
        ...uploadOptions,
        resource_type,
      });
      item.attachment = {
        URL: {
          public_id: attachmentResult.public_id,
          secure_url: attachmentResult.secure_url,
        },
        customId: customId || null,
      };
    } else if (file.path) {
      const attachmentResult = await uploadFile({
        file: file.path,
        ...uploadOptions,
        resource_type,
      });
      item.attachment = {
        URL: {
          public_id: attachmentResult.public_id,
          secure_url: attachmentResult.secure_url,
        },
        customId: customId || null,
      };
    } else {
      console.log("File object invalid:", file);
    }
  }
  return item;
}

export const updateMedicalHistoryService = async (patientId, data, files) => {
  try {
    const {
      diagnoses = [],
      testsAndRays = [],
      surgeries = [],
      vaccination = [],
      lifeStyles = [],
    } = data;
    const medicalHistory = await MedicalHistory.findOne({ patientId });
    if (!medicalHistory) {
      throw new Error("Medical history not found for this patient");
    }
    // Decrypt existing data for in-memory manipulation
    const decryptedData = medicalHistory.decryptData();
    medicalHistory.diagnoses = decryptedData.diagnoses;
    medicalHistory.testsAndRays = decryptedData.testsAndRays;
    medicalHistory.surgeries = decryptedData.surgeries;
    medicalHistory.vaccination = decryptedData.vaccination;
    medicalHistory.lifeStyles = decryptedData.lifeStyles;

    // Diagnoses
    if (diagnoses && Array.isArray(diagnoses)) {
      for (let updatedDiagnosis of diagnoses) {
        const diagIndex = medicalHistory.diagnoses.findIndex(
          (diag) => diag._id.toString() === updatedDiagnosis._id
        );
        if (diagIndex !== -1) {
          const existingAttachment =
            medicalHistory.diagnoses[diagIndex].attachment;
          if (files?.diagnosisAttachment) {
            updatedDiagnosis = await handleAttachmentUpdate(
              updatedDiagnosis,
              "diagnosis",
              "diagnoses",
              files.diagnosisAttachment[0],
              existingAttachment
            );
          }
          const { _id, medications, ...updateFields } = updatedDiagnosis;
          const existingDiagnosis = medicalHistory.diagnoses[diagIndex];
          // Merge updateFields with existing diagnosis, so required fields are always present
          let mergedDiagnosis = {
            ...existingDiagnosis,
            ...updateFields,
          };
          // Ensure required fields are present
          if (!mergedDiagnosis.type)
            mergedDiagnosis.type = existingDiagnosis.type;
          if (!mergedDiagnosis.name)
            mergedDiagnosis.name = existingDiagnosis.name;
          if (!mergedDiagnosis.date)
            mergedDiagnosis.date = existingDiagnosis.date;
          // Preserve attachment if no new file is uploaded
          if (!files?.diagnosisAttachment) {
            mergedDiagnosis.attachment = existingDiagnosis.attachment;
          }
          medicalHistory.diagnoses[diagIndex] = mergedDiagnosis;
          // If medications is provided, merge new medications by _id
          if (Array.isArray(medications)) {
            let existingMeds = medicalHistory.diagnoses[diagIndex].medications;
            if (!Array.isArray(existingMeds) || existingMeds.length === 0) {
              // If no existing medications, just set the new array
              medicalHistory.diagnoses[diagIndex].medications = medications;
            } else {
              const existingMedIds = new Set(
                existingMeds.map((med) => med._id?.toString())
              );
              const newMeds = medications.filter(
                (med) => !existingMedIds.has(med._id?.toString())
              );
              medicalHistory.diagnoses[diagIndex].medications = [
                ...existingMeds,
                ...newMeds,
              ];
            }
          }
        } else {
          return {
            status: 404,
            success: false,
            message: `Diagnosis with id ${updatedDiagnosis._id} not found in medical history`,
            data: null,
          };
        }
      }
    }
    // Tests and Rays
    if (testsAndRays && Array.isArray(testsAndRays)) {
      for (let updatedTest of testsAndRays) {
        const testIndex = medicalHistory.testsAndRays.findIndex(
          (test) => test._id.toString() === updatedTest._id
        );
        if (testIndex !== -1) {
          const existingAttachment =
            medicalHistory.testsAndRays[testIndex].attachment;
          if (files?.testsAndRaysAttachment) {
            updatedTest = await handleAttachmentUpdate(
              updatedTest,
              "test",
              "tests_rays",
              files.testsAndRaysAttachment[0],
              existingAttachment
            );
          }
          const { _id, ...updateFields } = updatedTest;
          medicalHistory.testsAndRays[testIndex] = {
            ...medicalHistory.testsAndRays[testIndex],
            ...updateFields,
          };
        } else {
          return {
            status: 404,
            success: false,
            message: `Test/Ray with id ${updatedTest._id} not found in medical history`,
            data: null,
          };
        }
      }
    }
    // Surgeries
    if (surgeries && Array.isArray(surgeries)) {
      for (let updatedSurgery of surgeries) {
        const surgIndex = medicalHistory.surgeries.findIndex(
          (surg) => surg._id.toString() === updatedSurgery._id
        );
        if (surgIndex !== -1) {
          const { _id, ...updateFields } = updatedSurgery;
          medicalHistory.surgeries[surgIndex] = {
            ...medicalHistory.surgeries[surgIndex],
            ...updateFields,
          };
        } else {
          return {
            status: 404,
            success: false,
            message: `Surgery with id ${updatedSurgery._id} not found in medical history`,
            data: null,
          };
        }
      }
    }
    // Vaccination
    if (vaccination && Array.isArray(vaccination)) {
      for (let updatedVaccine of vaccination) {
        const vaccIndex = medicalHistory.vaccination.findIndex(
          (vacc) => vacc._id.toString() === updatedVaccine._id
        );
        if (vaccIndex !== -1) {
          const { _id, ...updateFields } = updatedVaccine;
          medicalHistory.vaccination[vaccIndex] = {
            ...medicalHistory.vaccination[vaccIndex],
            ...updateFields,
          };
        } else {
          return {
            status: 404,
            success: false,
            message: `Vaccination with id ${updatedVaccine._id} not found in medical history`,
            data: null,
          };
        }
      }
    }
    // LifeStyles (now array of strings)
    if (Array.isArray(lifeStyles)) {
      for (const newLifeStyle of lifeStyles) {
        if (!medicalHistory.lifeStyles.includes(newLifeStyle)) {
          medicalHistory.lifeStyles.push(newLifeStyle);
        }
      }
    }
    await medicalHistoryModel.save(medicalHistory);
    return {
      status: 200,
      success: true,
      message: "Medical history updated successfully",
      data: medicalHistory.decryptData(),
    };
  } catch (error) {
    logger.error("Error updating medical history", { error: error.message });
    throw new Error(`Failed to update medical history: ${error.message}`);
  }
};

/**
 * Deletes specific items from medical history sections
 * @param {String} patientId - The ID of the patient
 * @param {Object} deleteData - Object containing items to delete from each section
 * @returns {Promise<Object>} Response with success status and updated medical history
 */
export const deleteMedicalHistoryService = async (patientId, deleteData) => {
  try {
    const {
      diagnoses = [],
      testsAndRays = [],
      surgeries = [],
      vaccination = [],
      lifeStyles = [],
    } = deleteData;

    const medicalHistory = await MedicalHistory.findOne({ patientId });
    if (!medicalHistory) {
      throw new Error("Medical history not found for this patient");
    }
    // Decrypt existing data for manipulation
    const decryptedData = medicalHistory.decryptData();
    medicalHistory.diagnoses = decryptedData.diagnoses;
    medicalHistory.testsAndRays = decryptedData.testsAndRays;
    medicalHistory.surgeries = decryptedData.surgeries;
    medicalHistory.vaccination = decryptedData.vaccination;
    medicalHistory.lifeStyles = decryptedData.lifeStyles;

    // Delete diagnoses and their attachments or medications
    if (diagnoses && Array.isArray(diagnoses)) {
      for (const diagnosisToDelete of diagnoses) {
        const diagnosisIndex = medicalHistory.diagnoses.findIndex(
          (diag) => diag._id.toString() === diagnosisToDelete._id
        );
        if (diagnosisIndex !== -1) {
          const diagnosis = medicalHistory.diagnoses[diagnosisIndex];
          // If medications array is provided, delete only those medications
          if (
            Array.isArray(diagnosisToDelete.medications) &&
            diagnosis.medications
          ) {
            diagnosis.medications = diagnosis.medications.filter(
              (med) =>
                !diagnosisToDelete.medications.some(
                  (delMed) => delMed._id.toString() === med._id.toString()
                )
            );
          } else {
            // Delete attachment from Cloudinary if exists
            if (diagnosis.attachment?.URL?.public_id) {
              try {
                await cloudinaryConfig().uploader.destroy(
                  diagnosis.attachment.URL.public_id,
                  (error, result) => {
                    if (error) {
                      logger.warn(
                        "Failed to delete diagnosis attachment from Cloudinary",
                        {
                          error,
                          publicId: diagnosis.attachment.URL.public_id,
                        }
                      );
                    } else {
                      logger.info(
                        "Diagnosis attachment deleted from Cloudinary",
                        {
                          result,
                          publicId: diagnosis.attachment.URL.public_id,
                        }
                      );
                    }
                  }
                );
                if (diagnosis.attachment.customId) {
                  const folderPath = `${process.env.UPLOAD_FILE}/medical_history/diagnoses/${diagnosis.attachment.customId}`;
                  await cloudinaryConfig().api.delete_folder(folderPath);
                }
              } catch (error) {
                logger.warn(
                  "Error deleting diagnosis attachment from Cloudinary",
                  {
                    error,
                    publicId: diagnosis.attachment.URL.public_id,
                  }
                );
              }
            }
            medicalHistory.diagnoses.splice(diagnosisIndex, 1);
          }
        }
      }
    }

    // Delete tests and rays and their attachments
    if (testsAndRays && Array.isArray(testsAndRays)) {
      for (const testToDelete of testsAndRays) {
        const testIndex = medicalHistory.testsAndRays.findIndex(
          (test) => test._id.toString() === testToDelete._id
        );

        if (testIndex !== -1) {
          const test = medicalHistory.testsAndRays[testIndex];

          // Delete attachment from Cloudinary if exists
          if (test.attachment?.URL?.public_id) {
            try {
              // Delete the specific file
              await cloudinaryConfig().uploader.destroy(
                test.attachment.URL.public_id,
                (error, result) => {
                  if (error) {
                    logger.warn(
                      "Failed to delete test attachment from Cloudinary",
                      {
                        error,
                        publicId: test.attachment.URL.public_id,
                      }
                    );
                  } else {
                    logger.info("Test attachment deleted from Cloudinary", {
                      result,
                      publicId: test.attachment.URL.public_id,
                    });
                  }
                }
              );

              // Delete the folder if it exists
              if (test.attachment.customId) {
                const folderPath = `${process.env.UPLOAD_FILE}/medical_history/tests_rays/${test.attachment.customId}`;
                await cloudinaryConfig().api.delete_folder(folderPath);
              }
            } catch (error) {
              logger.warn("Error deleting test attachment from Cloudinary", {
                error,
                publicId: test.attachment.URL.public_id,
              });
            }
          }

          medicalHistory.testsAndRays.splice(testIndex, 1);
        }
      }
    }

    // Delete surgeries (no attachments)
    if (surgeries && Array.isArray(surgeries)) {
      for (const surgeryToDelete of surgeries) {
        const surgeryIndex = medicalHistory.surgeries.findIndex(
          (surg) => surg._id.toString() === surgeryToDelete._id
        );

        if (surgeryIndex !== -1) {
          medicalHistory.surgeries.splice(surgeryIndex, 1);
        }
      }
    }

    // Delete vaccinations (no attachments)
    if (vaccination && Array.isArray(vaccination)) {
      for (const vaccineToDelete of vaccination) {
        const vaccineIndex = medicalHistory.vaccination.findIndex(
          (vacc) => vacc._id.toString() === vaccineToDelete._id
        );

        if (vaccineIndex !== -1) {
          medicalHistory.vaccination.splice(vaccineIndex, 1);
        }
      }
    }

    // Delete lifeStyles (now array of strings)
    if (lifeStyles && Array.isArray(lifeStyles)) {
      medicalHistory.lifeStyles = medicalHistory.lifeStyles.filter(
        (lifeStyle) => !lifeStyles.includes(lifeStyle)
      );
    }

    await medicalHistoryModel.save(medicalHistory);

    return {
      status: 200,
      success: true,
      message: "Medical history items deleted successfully",
      data: medicalHistory.decryptData(),
    };
  } catch (error) {
    logger.error("Error deleting medical history items", {
      error: error.message,
    });
    throw new Error(`Failed to delete medical history items: ${error.message}`);
  }
};
