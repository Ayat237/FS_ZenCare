import {
  addAllAcceptedMedicationsService,
  addPrescriptionService,
  deletePrescriptionService,
  historicalPrescriptionService,
} from "./prescription.service.js";

export const createPrescription = async (req, res, next) => {
  const user = req.authUser;
  const prescriptionData = req.body;

  const result = await addPrescriptionService(user, prescriptionData);

  res.status(201).json({
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
};

export const acceptAndAddPrescription = async (req, res, next) => {
  try {
    const user = req.authUser;
    const prescriptionData = req.body;

    const result = await addAllAcceptedMedicationsService(
      user,
      prescriptionData
    );

    return res.status(201).json({
      success: true,
      message: "Prescription with accepted medications successfully created",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePrescription = async (req, res, next) => {
    const { prescriptionId } = req.params;
    const user = req.authUser;

    const result = await deletePrescriptionService(user, prescriptionId);

    return res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
};


/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Retrieves all historical prescriptions for the authenticated user.
 * @param {Object} req - The request object containing user authentication information.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 * @param {Function} next - The next middleware function in the stack.
/*******  7c9749b7-7db2-4e0e-ac0d-eb358e14226f  *******/

export const historicalPrescriptions = async (req, res, next) => {
  const user = req.authUser;
  const patientId =  user.patientID?._id || user.patientID;


  const result = await historicalPrescriptionService(patientId);

  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data,
  });

}