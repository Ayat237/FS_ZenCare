import {
  adminLoginService,
  getPendingDoctorsService,
  verifyDoctorService,
} from "./admin.services.js";

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await adminLoginService(email, password);
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingDoctors = async (req, res, next) => {
  try {
    const result = await getPendingDoctorsService();
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDoctor = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isAdminApproved } = req.body;
    const result = await verifyDoctorService(userId, isAdminApproved);
    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
