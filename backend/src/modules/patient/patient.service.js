import { nanoid } from "nanoid";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { capitalizeName, possibleRoles, Provider, ErrorHandlerClass } from "../../utils/index.js";
import { getDefaultImageByGender} from "../../utils/image.utils.js";
import redisClient from "../../utils/redis.utils.js";
import { sendEmailService } from "../../services/sendEmail.service.js";
import { Address, AddressModel, Patient, PatientModel, User, UserModel } from "../../../database/models/index.js";
import database from "../../../database/databaseConnection.js";
import { uploadFile } from "../../utils/cloudinary.utils.js";

const userModel = new UserModel(database);
const patientModel = new PatientModel(database);
const addressModel = new AddressModel(database);

// API 1: Register New Patient User (user does not exist)
export const registerNewPatientUserService = async (userData, patientData, file) => {
  try {
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
    const customId = userData.firstName + nanoid(4);

    if (!file) {
      const defaultImage = getDefaultImageByGender(patientData.gender);
      profileImageObject = {
        URL: {
          secure_url: defaultImage.secure_url,
          public_id: defaultImage.public_id,
        },
        customId,
      };
    } else {
      const { secure_url, public_id } = await uploadFile({
        file: file.path,
        folder: `${process.env.UPLOAD_FILE}/Patient_Profile_Image/${customId}`,
      });
      profileImageObject = { URL: { secure_url, public_id }, customId };
    }

    // Capitalize names
    userData.firstName = capitalizeName(userData.firstName);
    userData.lastName = capitalizeName(userData.lastName);

    // Create patient document
    const patientObject = new Patient({
      ...patientData,
      profileImage: profileImageObject,
    });
    await patientModel.save(patientObject);

    // Create address document
    const addressObject = new Address({
      displayName: patientData.address,
      coordinates: patientData.coordinates,
      patientID: patientObject._id,
    });
    await addressModel.save(addressObject);

    // Create user document
    const userObject = new User({
      ...userData,
      role: [possibleRoles.PATIENT],
      activeRole: possibleRoles.PATIENT,
      isVerified: false,
      provider: Provider.LOCAL,
      patientID: patientObject._id,
    });
    await userModel.save(userObject);

    // Generate email token
    const emailToken = jwt.sign(
      { email: userData.email },
      process.env.EMAIL_SECRET
    );

    // Send verification email
    const isEmailSent = await sendEmailService({
      to: userData.email,
      subject: "Action Required: Verify Your Email with OTP",
      htmlMessage: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #007BFF;">Patient Registration – Email Verification</h2>
          <p>Hello ${userData.firstName || "User"},</p>
          <p>To complete your patient registration, please use the following One-Time Password (OTP):</p>
          <p style="font-size: 20px; font-weight: bold; color: #000;">${otp}</p>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p><strong>Important:</strong> For your security, do not share this code with anyone.</p>
          <p>If you did not request this, please ignore this message.</p>
          <br />
          <p>Thank you,</p>
          <p><strong>ZenCare</strong></p>
        </div>
      `,
    });

    if (isEmailSent.rejected.length) {
      throw new ErrorHandlerClass(
        "Failed to send verification email",
        500,
        "Server Error",
        "Error in sending email"
      );
    }

    return {
      status: 201,
      success: true,
      message: "Patient registered successfully. Please verify with the OTP sent to your email.",
      emailToken,
    };
  } catch (error) {
    throw error;
  }
};

// API 2: Add Patient Role to Existing User (user exists, verified, not already a patient)
export const addPatientRoleToExistingUserService = async (existingUser, patientData, file) => {
  try {
    if (existingUser.role.includes(possibleRoles.PATIENT)) {
      throw new ErrorHandlerClass(
        "User already registered with this email as a patient",
        409,
        "Duplicate Error",
        "Patient role already exists"
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

    // Handle profile image (default or uploaded)
    let profileImageObject = {
      URL: { secure_url: null, public_id: null },
      customId: null,
    };
    const customId = existingUser.firstName + nanoid(4);

    if (!file) {
      const defaultImage = getDefaultImageByGender(patientData.gender);
      profileImageObject = {
        URL: {
          secure_url: defaultImage.secure_url,
          public_id: defaultImage.public_id,
        },
        customId,
      };
    } else {
      const { secure_url, public_id } = await uploadFile({
        file: file.path,
        folder: `${process.env.UPLOAD_FILE}/Patient_Profile_Image/${customId}`,
      });
      profileImageObject = { URL: { secure_url, public_id }, customId };
    }

    // Add patient role and create patient document
    existingUser.role.push(possibleRoles.PATIENT);
    existingUser.activeRole = possibleRoles.PATIENT;

    // Create patient document
    const patientObject = new Patient({
      ...patientData,
      profileImage: profileImageObject,
    });
    await patientModel.save(patientObject);

    // Create address document
    const addressObject = new Address({
      displayName: patientData.address,
      coordinates: patientData.coordinates,
      patientID: patientObject._id,
    });
    await addressModel.save(addressObject);

    // Link patient to user
    existingUser.patientID = patientObject._id;
    await userModel.save(existingUser);

    return {
      status: 201,
      success: true,
      message: "Patient added successfully to existing user.",
    };
  } catch (error) {
    throw error;
  }
};
