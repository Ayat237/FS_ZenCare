import { addAllAcceptedMedicationsService, addPrescriptionService } from "./prescription.service.js";



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

    
    const result = await addAllAcceptedMedicationsService(user, prescriptionData);

    return res.status(201).json(
      {
        success: true,
        message: "Prescription with accepted medications successfully created",
        data: result,
      }
    );
  } catch (error) {
    next(error);
  }
};
