import {
  addAllAcceptedMedicationsService,
  addPrescriptionService,
  deletePrescriptionService,
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
  try {
    const { prescriptionId } = req.params;
    const user = req.authUser;

    const result = await deletePrescriptionService(user, prescriptionId);

    return res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
