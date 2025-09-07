import {
  addMedicalHistoryService,
  getMedicalHistoryService,
  updateMedicalHistoryService,
  deleteMedicalHistoryService,
} from "./medical_history.service.js";

function safeParseArray(value) {
  try {
    return Array.isArray(value) ? value : JSON.parse(value);
  } catch (err) {
    return [];
  }
}

/**
 * @function addMedicalHistory
 * @description Add or update a medical history for a patient
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<Response>} - The response with a JSON body containing the added or updated medical history
 */
export const addMedicalHistory = async (req, res) => {
  console.log("Request body:", req.body, "File:", req.file);
  const user = req.authUser;
  const patientId = user.patientID?._id || user.patientID;

  const data = req.body;

  const processedData = await addMedicalHistoryService(
    patientId,
    data,
    req.files
  );

  return res.status(processedData.status).json({
    success: processedData.success,
    message: processedData.message,
    data: processedData.data,
  });
};

/**
 * @function getMedicalHistory
 * @description Get medical history for a patient
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<Response>} - The response with a JSON body containing the medical history
 */
export const getMedicalHistory = async (req, res) => {
  try {
    const user = req.authUser;
    const patientId = user.patientID?._id || user.patientID;

    const medicalHistory = await getMedicalHistoryService(patientId);

    return res.status(200).json({
      success: true,
      message: "Medical history retrieved successfully",
      data: medicalHistory,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

/**
 * @function updateMedicalHistory
 * @description Update medical history for a patient
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<Response>} - The response with a JSON body containing the updated medical history
 */
export const updateMedicalHistory = async (req, res) => {
  try {
    const user = req.authUser;
    const patientId = user.patientID?._id || user.patientID;
    const data = req.body;

    const processedData = await updateMedicalHistoryService(
      patientId,
      data,
      req.files
    );

    return res.status(processedData.status).json({
      success: processedData.success,
      message: processedData.message,
      data: processedData.data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const deleteMedicalHistory = async (req, res) => {
  try {
    const user = req.authUser;
    const patientId = user.patientID?._id || user.patientID;
    const deleteData = req.body;

    const processedData = await deleteMedicalHistoryService(
      patientId,
      deleteData
    );

    return res.status(processedData.status).json({
      success: processedData.success,
      message: processedData.message,
      data: processedData.data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
