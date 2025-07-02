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

const addressModel = new AddressModel(database);
const doctorModel = new DoctorModel(database);
const userModel = new UserModel(database);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_UPLOAD_DIR = path.join(__dirname, "../../../uploads/verification");

if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

export const registerDoctorService = async (userData, doctorData, files) => {
  let session;
  let transactionCommitted = false;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Validate user role
    if (!userData.role || !userData.role.includes(possibleRoles.DOCTOR)) {
      throw new ErrorHandlerClass(
        "User must have doctor role to register as a doctor",
        400,
        "Validation Error",
        "Invalid role"
      );
    }

    // Check for existing user by username
    const existingUserByUsername = await User.findOne({
      userName: userData.userName,
    });
    if (existingUserByUsername) {
      throw new ErrorHandlerClass(
        "User with this userName already exists",
        409,
        "Duplicate Error",
        "Username already taken"
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

    // Parallelize independent operations
    const [existingUserByEmail, otp] = await Promise.all([
      User.findOne({ email: userData.email }),
      crypto.randomInt(100000, 999999).toString(),
    ]);

    if (existingUserByEmail) {
      throw new ErrorHandlerClass(
        "User with this email already exists",
        409,
        "Duplicate Error",
        "Email already registered"
      );
    }

    // Store OTP in Redis
    await redisClient.SET(`otp:${userData.userName}`, otp, 10 * 60);

    // Handle profile image (upload to Cloudinary)
    let profileImageObject = {
      URL: { secure_url: null, public_id: null },
      customId: null,
    };
    const customId = `${userData.firstName}_${nanoid(4)}`;

    if (!files || !files.profileImage) {
      // Use default image if no profile image provided
      const defaultImage = getDefaultImageByGender(doctorData.gender);
      profileImageObject = {
        URL: {
          secure_url: defaultImage.secure_url,
          public_id: defaultImage.public_id,
        },
        customId,
      };
    } else {
      // Upload profile image to Cloudinary
      const { secure_url, public_id } = await uploadFile({
        file: files.profileImage[0].path,
        folder: `${process.env.UPLOAD_FILE}/Doctor_Profile_Image/${customId}`,
      });
      profileImageObject = { URL: { secure_url, public_id }, customId };
    }

    // Capitalize names
    userData.firstName = capitalizeName(userData.firstName);
    userData.lastName = capitalizeName(userData.lastName);

    // Create Addresses for clinic branches
    const addressPromises = doctorData.clinicBranches.map(async (branch) => {
      const address = new Address(branch.address);
      await addressModel.save(address, { session });
      return {
        address: address._id,
        phoneNumber: branch.phoneNumber,
      };
    });

    const clinicBranches = await Promise.all(addressPromises);

    // Create User first
    const user = new User({
      ...userData,
      isVerified: false,
      provider: Provider.LOCAL,
      activeRole: systemRoles.DOCTOR,
    });
    await userModel.save(user, { session });

    // Create Doctor with user reference
    const doctor = new Doctor({
      user: user._id,
      specialty: doctorData.specialty,
      hospitalAffiliation: doctorData.hospitalAffiliation,
      clinicBranches,
      profileImage: profileImageObject,
      gender: doctorData.gender,
      yearsOfExperience: doctorData.yearsOfExperience,
      education: doctorData.education,
      certifications: doctorData.certifications,
      rating: { average: 0, count: 0 },
    });
    await doctorModel.save(doctor, { session });

    // Update user with doctor reference
    user.doctorID = doctor._id;
    await userModel.save(user, { session });

    await session.commitTransaction();
    session.endSession();
    transactionCommitted = true;

    // Generate email token
    const emailToken = jwt.sign(
      { email: userData.email },
      process.env.EMAIL_SECRET
    );

    // Send verification email (after transaction commit)
    let emailSentSuccessfully = false;
    try {
      const isEmailSent = await sendEmailService({
        to: userData.email,
        subject: "Action Required: Verify Your Email Address",
        htmlMessage: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #007BFF;">Email Verification Code</h2>
            <p>Hello ${userData.fullName || "Doctor"},</p>
            <p>Thank you for registering on our platform. To complete your registration, please use the following One-Time Password (OTP):</p>
            <p style="font-size: 18px; font-weight: bold; color: #333; padding: 10px 0;">${otp}</p>
            <p>This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
            <p>If you did not initiate this request, please ignore this message.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The zenCareTeam</strong></p>
          </div>
        `,
      });

      emailSentSuccessfully = !isEmailSent.rejected.length;
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't throw error - registration was successful, just email failed
    }

    // Handle verification ID image (store locally encrypted)
    let verificationData = null;
    if (files && files.verificationId) {
      try {
        const uploadResult = files.verificationId[0]; // Multer already processed it
        const filePath = path.join(TEMP_UPLOAD_DIR, uploadResult.filename);

        // Read the uploaded file and encrypt it
        const fileBuffer = fs.readFileSync(uploadResult.path);
        const { encryptedData, iv } = encrypt(fileBuffer, user._id.toString());

        // Save encrypted data to local server
        fs.writeFileSync(filePath, JSON.stringify({ data: encryptedData, iv }));

        // Store reference in Redis for 48 hours
        await redisClient.SET(
          `verification:${doctor._id}`,
          filePath,
          172800 // 48 hours expiry
        );

        // Clean up the original uploaded file
        fs.unlinkSync(uploadResult.path);

        verificationData = { filePath, filename: uploadResult.filename };
      } catch (fileError) {
        console.error("File processing failed:", fileError);
        // Don't throw error - registration was successful, just file processing failed
      }
    }

    const successMessage = emailSentSuccessfully
      ? "Doctor registered successfully. Please verify with the OTP sent to your email."
      : "Doctor registered successfully. Please contact support for email verification as the verification email could not be sent.";

    return {
      status: 201,
      success: true,
      message: successMessage,
      data: { user, doctor, emailToken, verificationData },
    };
  } catch (error) {
    if (session && !transactionCommitted) {
      await session.abortTransaction();
      session.endSession();
    }
    // Clean up uploaded files on error
    if (files) {
      // Clean up verification file if it exists
      if (files.verificationId && fs.existsSync(files.verificationId[0].path)) {
        fs.unlinkSync(files.verificationId[0].path);
      }
      // Clean up profile image if it exists
      if (files.profileImage && fs.existsSync(files.profileImage[0].path)) {
        fs.unlinkSync(files.profileImage[0].path);
      }
    }
    throw error;
  }
};
