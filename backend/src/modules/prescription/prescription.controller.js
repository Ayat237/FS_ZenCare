import { addPrescriptionService } from "./prescription.service.js";



export const createPrescription = async (req, res, next) => {
  const user = req.authUser;
  const prescriptionData = req.body;
  console.log(prescriptionData);
  
  const result = await addPrescriptionService(user, prescriptionData);
  
  res.status(201).json({
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
};