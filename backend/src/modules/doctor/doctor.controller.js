import jwt from "jsonwebtoken";
import crypto from "crypto";
import { nanoid } from "nanoid";
import { possibleRoles } from "../../utils/index.js";
import { registerNewDoctorUserService, addDoctorRoleToExistingUserService } from "./doctor.services.js";
import { ErrorHandlerClass, logger } from "../../utils/index.js";
import { UserModel } from "../../../database/models/user.model.js";
import database from "../../../database/databaseConnection.js";
import redisClient from "../../utils/redis.utils.js";
import { sendEmailService } from "../../services/sendEmail.service.js";
import { uploadFile } from "../../utils/cloudinary.utils.js";
import { Doctor } from "../../../database/models/doctor.model.js";


const userModel = new UserModel(database);

/**
 * Register a new doctor
 * @route POST /doctor/register
 */
export const registerDoctor = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      userName,
      email,
      password,
      confirmedPassword,
      mobilePhone,
      role,
      specialty,
      yearsOfExperience,
      education,
      certifications,
      hospitalAffiliation,
      addressLabel,
      clinicPhoneNumber,
      coordinates,
      gender,
    } = req.body;

    const userData = {
      firstName,
      lastName,
      userName,
      email,
      password,
      confirmedPassword,
      mobilePhone,
      role,
      gender,
    };

    const doctorData = {
      specialty,
      yearsOfExperience,
      education,
      certifications,
      hospitalAffiliation,
      addressLabel,
      clinicPhoneNumber,
      coordinates,
    };

    const result = await registerDoctorService(userData, doctorData, req.files);

    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify doctor email with OTP
 * @route PATCH /doctor/verify-email
 */
export const verifyDoctorEmail = async (req, res, next) => {
  try {
    const emailToken = req.headers["emailtoken"] || req.headers["emailToken"];
    const { email, otp } = req.body;

    if (!emailToken) {
      return next(
        new ErrorHandlerClass(
          "Email token is required",
          400,
          "Validation Error",
          "Missing email token"
        )
      );
    }

    // Verify email token
    const decodedToken = jwt.verify(emailToken, process.env.EMAIL_SECRET);
    if (!decodedToken || decodedToken.email !== email) {
      return next(
        new ErrorHandlerClass(
          "Invalid email token",
          400,
          "Authentication Error",
          "Invalid token"
        )
      );
    }

    // Find user
    const user = await userModel.findByEmail(email);
    if (!user) {
      return next(
        new ErrorHandlerClass(
          "User not found",
          404,
          "Not Found Error",
          "User not found"
        )
      );
    }

    // Check if user is already verified
    if (user.isVerified) {
      return next(
        new ErrorHandlerClass(
          "User is already verified",
          400,
          "Validation Error",
          "Already verified"
        )
      );
    }

    // Verify OTP
    const storedOtp = await redisClient.GET(`otp:${user.userName}`);
    if (!storedOtp || storedOtp !== otp) {
      return next(
        new ErrorHandlerClass(
          "Invalid OTP",
          400,
          "Validation Error",
          "Invalid OTP"
        )
      );
    }

    // Generate JWT access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        userName: user.userName,
        role: user.role,
        activeRole: possibleRoles.DOCTOR,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    // Generate refresh token
    const refreshToken = crypto.randomBytes(32).toString("hex");

    // Update user verification status
    await userModel.updateById(
      {
        _id: user._id,
        isVerified: false,
      },
      {
        isVerified: true,
        activeRole: possibleRoles.DOCTOR,
      }
    );

    // Store refresh token in Redis
    await redisClient.SET(
      `refreshToken:${user.userName}`,
      refreshToken,
      7 * 24 * 60 * 60
    );

    // Delete OTP from Redis
    await redisClient.DEL(`otp:${user.userName}`);

    res.status(200).json({
      success: true,
      message: `Email ${user.email} verified successfully.`,
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          role: user.role,
          activeRole: possibleRoles.DOCTOR,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin approval for doctor verification
 * @route PATCH /doctor/admin-approve/:doctorId
 */
export const adminApproveDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { isVerified } = req.body;

    // Find the user by doctorId (doctorId is actually userId in this new flow)
    const user = await userModel.findById(doctorId);
    if (!user) {
      return next(
        new ErrorHandlerClass(
          "User not found for doctor approval",
          404,
          "Not Found Error",
          "User not found"
        )
      );
    }

    // Retrieve pending doctor data from Redis
    const pendingDataStr = await redisClient.GET(`pendingDoctor:${user._id}`);
    if (!pendingDataStr) {
      return next(
        new ErrorHandlerClass(
          "No pending doctor data found for this user",
          404,
          "Not Found Error",
          "No pending doctor data"
        )
      );
    }
    const pendingData = JSON.parse(pendingDataStr);
    const { doctorData, profileImageObject } = pendingData;

    // Create doctor document
    const doctorObject = new Doctor({
      ...doctorData,
      user: user._id,
      profileImage: profileImageObject,
      rating: { average: 0, count: 0 },
      verification: { isVerified: true },
    });
    await doctorObject.save();

    // Link doctor to user
    user.doctorID = doctorObject._id;
    user.isVerified = true;
    await user.save();

    // Delete verificationId and pending doctor data from Redis
    await redisClient.DEL(`pendingDoctor:${user._id}`);
    await redisClient.DEL(`verification:${doctorObject._id}`);

    // Send email notification to doctor
    await sendEmailService({
      to: user.email,
      subject: "Doctor Verification Approved",
      htmlMessage: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #28a745;">Verification Approved</h2>
          <p>Hello ${user.firstName} ${user.lastName},</p>
          <p>Your doctor verification has been approved. You can now login to your account and start using our platform.</p>
          <p>Thank you for using our platform.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The zenCare Team</strong></p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Doctor verification status updated successfully. Doctor can now login.",
      data: {
        doctorId: doctorObject._id,
        isVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor profile
 * @route GET /doctor/profile
 */
export const getDoctorProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await userModel.findById(userId).populate("doctorID");
    if (!user || !user.doctorID) {
      return next(
        new ErrorHandlerClass(
          "Doctor profile not found",
          404,
          "Not Found Error",
          "Profile not found"
        )
      );
    }

    res.status(200).json({
      success: true,
      message: "Doctor profile retrieved successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          mobilePhone: user.mobilePhone,
          isVerified: user.isVerified,
          role: user.role,
          activeRole: user.activeRole,
        },
        doctor: {
          id: user.doctorID._id,
          specialty: user.doctorID.specialty,
          yearsOfExperience: user.doctorID.yearsOfExperience,
          education: user.doctorID.education,
          certifications: user.doctorID.certifications,
          hospitalAffiliation: user.doctorID.hospitalAffiliation,
          clinicBranches: user.doctorID.clinicBranches,
          gender: user.doctorID.gender,
          profileImage: user.doctorID.profileImage,
          rating: user.doctorID.rating,
          verification: user.doctorID.verification,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor profile
 * @route PUT /doctor/profile
 */
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const user = await userModel.findById(userId).populate("doctorID");
    if (!user || !user.doctorID) {
      return next(
        new ErrorHandlerClass(
          "Doctor profile not found",
          404,
          "Not Found Error",
          "Profile not found"
        )
      );
    }

    // Update user data if provided
    if (updateData.firstName) {
      user.firstName = updateData.firstName;
    }
    if (updateData.lastName) {
      user.lastName = updateData.lastName;
    }
    if (updateData.mobilePhone) {
      user.mobilePhone = updateData.mobilePhone;
    }

    // Update doctor data if provided
    if (updateData.specialty) {
      user.doctorID.specialty = updateData.specialty;
    }
    if (updateData.yearsOfExperience !== undefined) {
      user.doctorID.yearsOfExperience = updateData.yearsOfExperience;
    }
    if (updateData.education) {
      user.doctorID.education = updateData.education;
    }
    if (updateData.certifications) {
      user.doctorID.certifications = updateData.certifications;
    }
    if (updateData.hospitalAffiliation) {
      user.doctorID.hospitalAffiliation = updateData.hospitalAffiliation;
    }
    if (updateData.clinicBranches) {
      user.doctorID.clinicBranches = updateData.clinicBranches;
    }

    // Save both user and doctor
    await user.save();
    await user.doctorID.save();

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          mobilePhone: user.mobilePhone,
        },
        doctor: {
          id: user.doctorID._id,
          specialty: user.doctorID.specialty,
          yearsOfExperience: user.doctorID.yearsOfExperience,
          education: user.doctorID.education,
          certifications: user.doctorID.certifications,
          hospitalAffiliation: user.doctorID.hospitalAffiliation,
          clinicBranches: user.doctorID.clinicBranches,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor profile image
 * @route PATCH /doctor/profile/image
 */
export const updateProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await userModel.findById(userId).populate("doctorID");
    if (!user || !user.doctorID) {
      return next(
        new ErrorHandlerClass(
          "Doctor profile not found",
          404,
          "Not Found Error",
          "Profile not found"
        )
      );
    }

    if (!req.file) {
      return next(
        new ErrorHandlerClass(
          "Profile image is required",
          400,
          "Validation Error",
          "Missing profile image"
        )
      );
    }

    // Upload new profile image
    const customId = `${user.firstName}_${nanoid(4)}`;
    const { secure_url, public_id } = await uploadFile({
      file: req.file.path,
      folder: `${process.env.UPLOAD_FILE}/Doctor_Profile_Image/${customId}`,
    });

    // Update doctor profile image
    user.doctorID.profileImage = {
      URL: { secure_url, public_id },
      customId,
    };

    await user.doctorID.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: {
        profileImage: user.doctorID.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new doctor (new user)
 * @route POST /doctor/register-new
 */
export const registerNewDoctorUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      userName,
      email,
      password,
      confirmedPassword,
      mobilePhone,
      role,
      specialty,
      yearsOfExperience,
      education,
      certifications,
      hospitalAffiliation,
      clinicBranches,
      gender,
    } = req.body;

    const userData = {
      firstName,
      lastName,
      userName,
      email,
      password,
      confirmedPassword,
      mobilePhone,
      role,
      gender,
    };

    const doctorData = {
      specialty,
      yearsOfExperience,
      education,
      certifications,
      hospitalAffiliation,
      clinicBranches,
    };

    const result = await registerNewDoctorUserService(userData, doctorData, req.files);

    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add doctor role to existing user
 * @route POST /doctor/add-role
 */
export const addDoctorRoleToExistingUser = async (req, res, next) => {
  try {
    const {
      specialty,
      yearsOfExperience,
      education,
      certifications,
      hospitalAffiliation,
      clinicBranches,
      email,
    } = req.body;

    // Find the existing user by email
    const existingUser = await userModel.findByEmail(email);

    if (!existingUser) {
      return next(new ErrorHandlerClass(
        "User with this email does not exist",
        404,
        "Not Found Error",
        "User does not exist"
      ));
    }

    const doctorData = {
      specialty,
      yearsOfExperience,
      education,
      certifications,
      hospitalAffiliation,
      clinicBranches,
    };

    const result = await addDoctorRoleToExistingUserService(existingUser, doctorData, req.files);

    res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
