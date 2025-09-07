import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import {
  Address,
  AddressModel,
} from "../../../database/models/address.model.js";
import { User, UserModel } from "../../../database/models/user.model.js";
import { Doctor, DoctorModel } from "../../../database/models/doctor.model.js";
import { possibleRoles, Provider, systemRoles } from "../../utils/index.js";
import database from "../../../database/databaseConnection.js";
import { getDefaultImageByGender } from "../../utils/image.utils.js";
import { uploadFile } from "../../utils/cloudinary.utils.js";
import { multerMiddleware } from "../../middlewares/multer.middleware.js";
import extensions from "../../utils/file-extenstions.utils.js";
import { ErrorHandlerClass, capitalizeName } from "../../utils/index.js";
import redisClient from "../../utils/redis.utils.js";
import { sendEmailService } from "../../services/sendEmail.service.js";
import { encrypt } from "./utils/encryption.utils.js";
import bcrypt from "bcryptjs";
import { populate } from "dotenv";

const addressModel = new AddressModel(database);
const doctorModel = new DoctorModel(database);
const userModel = new UserModel(database);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_UPLOAD_DIR = path.join(__dirname, "../../../uploads/verification");

if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

// Admin login

// API 1: Register New Doctor User (user does not exist)
export const registerNewDoctorUserService = async (
  userData,
  doctorData,
  files
) => {
  let session;
  let transactionCommitted = false;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Check for existing user by email
    const existingUser = await userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new ErrorHandlerClass(
        "User already exists with this email",
        409,
        "Duplicate Error",
        "User already exists"
      );
    }
    // Check for existing doctor by userName
    const existingDoctor = await userModel.findOne({
      userName: userData.userName,
    });
    if (existingDoctor) {
      throw new ErrorHandlerClass(
        "Doctor already exists with this userName, please choose another userName",
        409,
        "Duplicate Error",
        "Doctor already exists"
      );
    }
    // Validate password match
    if (userData.password !== userData.confirmedPassword) {
      throw new ErrorHandlerClass(
        "Passwords do not match",
        400,
        "Validation Error",
        "Password mismatch"
      );
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    await redisClient.SET(`otp:${userData.userName}`, otp, 10 * 60);

    // Handle profile image (default or uploaded)
    let profileImageObject = {
      URL: { secure_url: null, public_id: null },
      customId: null,
    };
    const customId = `${userData.firstName}_${nanoid(4)}`;

    if (!files || !files.profileImage) {
      const defaultImage = getDefaultImageByGender(userData.gender);
      profileImageObject = {
        URL: {
          secure_url: defaultImage.secure_url,
          public_id: defaultImage.public_id,
        },
        customId,
      };
    } else {
      const { secure_url, public_id } = await uploadFile({
        file: files.profileImage[0].path,
        folder: `${process.env.UPLOAD_FILE}/Doctor_Profile_Image/${customId}`,
      });
      profileImageObject = { URL: { secure_url, public_id }, customId };
    }
    // Parse and validate clinicBranches
    let clinicBranchesInput = [];
    if (Array.isArray(doctorData.clinicBranches)) {
      clinicBranchesInput = doctorData.clinicBranches;
    } else if (typeof doctorData.clinicBranches === "string") {
      try {
        clinicBranchesInput = JSON.parse(doctorData.clinicBranches);
      } catch (e) {
        throw new ErrorHandlerClass(
          "clinicBranches must be a valid JSON array",
          400,
          "Validation Error",
          "Invalid clinicBranches format"
        );
      }
    }

    // Prepare pending doctor data for Redis

    const pendingDoctorData = {
      doctorData: {
        ...doctorData,
        clinicBranches: clinicBranchesInput,
      },
      profileImageObject,
    };

    // Capitalize names
    userData.firstName = capitalizeName(userData.firstName);
    userData.lastName = capitalizeName(userData.lastName);

    // Create user document (not verified, not linked to doctor yet)
    const userObject = new User({
      ...userData,
      role: [possibleRoles.DOCTOR],
      activeRole: possibleRoles.DOCTOR,
      isVerified: false,
      provider: Provider.LOCAL,
    });
    await userModel.save(userObject, { session });

    // Store pending doctor data in Redis (expires in 48h)
    await redisClient.SET(
      `pendingDoctor:${userObject._id}`,
      JSON.stringify(pendingDoctorData),
      172800 // 48 hours
    );

    await session.commitTransaction();
    session.endSession();
    transactionCommitted = true;

    // Generate email token
    const emailToken = jwt.sign(
      { email: userData.email },
      process.env.EMAIL_SECRET
    );

    // Send verification email
    let emailSentSuccessfully = false;
    try {
      const isEmailSent = await sendEmailService({
        to: userData.email,
        subject: "Action Required: Verify Your Email Address",
        htmlMessage: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #007BFF;">Email Verification Code</h2>
            <p>Hello ${userData.firstName || "Doctor"},</p>
            <p>Thank you for registering on our platform. To complete your registration, please use the following One-Time Password (OTP):</p>
            <p style="font-size: 18px; font-weight: bold; color: #333; padding: 10px 0;">${otp}</p>
            <p>This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
            <p>If you did not initiate this request, please ignore this message.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>zenCare</strong></p>
          </div>
        `,
      });
      emailSentSuccessfully = !isEmailSent.rejected.length;
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    const successMessage = emailSentSuccessfully
      ? "Please verify with the OTP sent to your email. Wait for admin approval during the next 24 hours to get your account verified."
      : "Resend the verification email, or please contact support for email verification as the verification email could not be sent.";

    // Save verification ID image (store locally encrypted) if present
    let verificationFilePath = null;
    if (files && files.verificationId && files.verificationId.length > 0) {
      const uploadResult = files.verificationId[0];
      if (!uploadResult.path) {
        throw new ErrorHandlerClass(
          "Verification ID file upload failed or path missing.",
          400,
          "Validation Error",
          "Verification ID file missing"
        );
      }
      const filePath = path.join(TEMP_UPLOAD_DIR, uploadResult.filename);

      // Validate that the file path exists and is readable
      if (!fs.existsSync(uploadResult.path)) {
        throw new ErrorHandlerClass(
          "Verification ID file not found at upload path.",
          400,
          "File Error",
          "File not found"
        );
      }

      const fileBuffer = fs.readFileSync(uploadResult.path);

      // Validate that we have a valid file buffer
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new ErrorHandlerClass(
          "Verification ID file is empty or corrupted.",
          400,
          "File Error",
          "Empty file buffer"
        );
      }

      console.log(
        `Processing verification file - Size: ${fileBuffer.length} bytes`
      );

      // Read the uploaded file and encrypt it
      const { encryptedData, iv } = encrypt(
        fileBuffer,
        userObject._id.toString()
      );

      // Save encrypted data to local server
      fs.writeFileSync(filePath, JSON.stringify({ data: encryptedData, iv })); // Should be hex, not base64

      // Store reference in Redis for 48 hours
      await redisClient.SET(
        `verification:${userObject._id}`,
        filePath,
        172800 // 48 hours expiry
      );

      // Clean up the original uploaded file
      fs.unlinkSync(uploadResult.path);

      verificationFilePath = filePath;
    }

    return {
      status: 201,
      success: true,
      message: successMessage,
      data: { userId: userObject._id, emailToken },
    };
  } catch (error) {
    if (session && !transactionCommitted) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

// API 2: Add Doctor Role to Existing User (user exists, verified, not already a doctor)
export const addDoctorRoleToExistingUserService = async (
  existingUser,
  doctorData,
  files
) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    if (existingUser.role.includes(possibleRoles.DOCTOR)) {
      throw new ErrorHandlerClass(
        "User already registered with this email as a doctor",
        409,
        "Duplicate Error",
        "Doctor role already exists"
      );
    }
    if (!existingUser.isVerified) {
      throw new ErrorHandlerClass(
        "User must be verified before adding a new role",
        400,
        "Validation Error",
        "Unverified user"
      );
    }

    // Validate verification ID is required
    if (!files || !files.verificationId || files.verificationId.length === 0) {
      throw new ErrorHandlerClass(
        "Verification ID is required for doctor registration",
        400,
        "Validation Error",
        "Verification ID missing"
      );
    }

    // Handle profile image (default or uploaded)
    let profileImageObject = {
      URL: { secure_url: null, public_id: null },
      customId: null,
    };
    const customId = `${existingUser.firstName}_${nanoid(4)}`;

    if (!files || !files.profileImage) {
      const defaultImage = getDefaultImageByGender(existingUser.gender);
      profileImageObject = {
        URL: {
          secure_url: defaultImage.secure_url,
          public_id: defaultImage.public_id,
        },
        customId,
      };
    } else {
      const { secure_url, public_id } = await uploadFile({
        file: files.profileImage[0].path,
        folder: `${process.env.UPLOAD_FILE}/Doctor_Profile_Image/${customId}`,
      });
      profileImageObject = { URL: { secure_url, public_id }, customId };
    }

    // Parse and validate clinicBranches
    let clinicBranchesInput = [];
    if (Array.isArray(doctorData.clinicBranches)) {
      clinicBranchesInput = doctorData.clinicBranches;
    } else if (typeof doctorData.clinicBranches === "string") {
      try {
        clinicBranchesInput = JSON.parse(doctorData.clinicBranches);
      } catch (e) {
        throw new ErrorHandlerClass(
          "clinicBranches must be a valid JSON array",
          400,
          "Validation Error",
          "Invalid clinicBranches format"
        );
      }
    }

    // Validate clinic branches
    clinicBranchesInput.forEach((branch) => {
      if (!branch.address || !branch.address.coordinates) {
        throw new ErrorHandlerClass(
          "Each clinic branch must have an address with coordinates",
          400,
          "Validation Error",
          "Missing address or coordinates in clinic branch"
        );
      }
      const { longitude, latitude } = branch.address.coordinates;
      if (typeof longitude !== "number" || typeof latitude !== "number") {
        throw new ErrorHandlerClass(
          "Coordinates must include valid longitude and latitude",
          400,
          "Validation Error",
          "Invalid coordinates in clinic branch address"
        );
      }
    });

    // Store doctor data in Redis for later approval
    const pendingDoctorData = {
      doctorData: {
        ...doctorData,
        clinicBranches: clinicBranchesInput,
        user: existingUser._id,
        rating: { average: 0, count: 0 },
        verification: { isVerified: false },
        isAdminApproved: false,
      },
      profileImageObject,
    };

    await redisClient.SET(
      `pendingDoctor:${existingUser._id}`,
      JSON.stringify(pendingDoctorData),
      172800 // 48 hours expiry
    );

    // Save verification ID image (store locally encrypted) if present
    let verificationFilePath = null;
    if (files && files.verificationId && files.verificationId.length > 0) {
      const uploadResult = files.verificationId[0];
      if (!uploadResult.path) {
        throw new ErrorHandlerClass(
          "Verification ID file upload failed or path missing.",
          400,
          "Validation Error",
          "Verification ID file missing"
        );
      }
      const filePath = path.join(TEMP_UPLOAD_DIR, uploadResult.filename);
      const fileBuffer = fs.readFileSync(uploadResult.path);

      // Read the uploaded file and encrypt it
      const { encryptedData, iv } = encrypt(
        fileBuffer,
        existingUser._id.toString()
      );

      // Save encrypted data to local server
      fs.writeFileSync(filePath, JSON.stringify({ data: encryptedData, iv })); // Should be hex, not base64

      await redisClient.SET(
        `verification:${existingUser._id}`,
        filePath,
        172800 // 48 hours expiry
      );

      // Clean up the original uploaded file
      fs.unlinkSync(uploadResult.path);
    }

    await session.commitTransaction();
    session.endSession();

    return {
      status: 201,
      success: true,
      message:
        "Wait for admin approval during the next 24 hours to get your account verified",
      data: { userId: existingUser._id },
    };
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    if (files) {
      if (files.verificationId && fs.existsSync(files.verificationId[0].path)) {
        fs.unlinkSync(files.verificationId[0].path);
      }
      if (files.profileImage && fs.existsSync(files.profileImage[0].path)) {
        fs.unlinkSync(files.profileImage[0].path);
      }
    }
    throw error;
  }
};

export const getAllDoctorsService = async () => {
  try {
    console.log("🔍 getAllDoctorsService: Fetching all approved doctors...");

    // Find all approved doctors and populate user and address information
    const doctors = await doctorModel.find(
      { isAdminApproved: true },
      {
        populate: [
          {
            path: "user",
            model: "User",
          },
          {
            path: "clinicBranches.address",
            model: "Address",
          },
        ],
      }
    );

    console.log(
      "🔍 getAllDoctorsService: Found doctors:",
      doctors?.length || 0
    );
    console.log(
      "🔍 getAllDoctorsService: Sample doctor with clinic addresses:",
      doctors?.[0]?.clinicBranches?.[0]?.address || "none"
    );

    return {
      status: 200,
      success: true,
      data: doctors || [],
      message: `Found ${doctors?.length || 0} approved doctors`,
    };
  } catch (error) {
    console.error("❌ getAllDoctorsService error:", error);
    throw new ErrorHandlerClass(
      "Failed to retrieve doctors",
      500,
      "Database Error",
      error.message
    );
  }
};
