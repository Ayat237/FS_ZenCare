import {
  ErrorHandlerCalss,
  logger,
  possibleRoles,
  uploadFile,
  capitalizeName,
  DEFAULT_PROFILE_IMAGE,
} from "../../utils/index.js";
import database from "../../../database/databaseConnection.js";
import { sendEmailService } from "../../services/sendEmail.service.js";
import {
  Patient,
  PatientModel,
  User,
  UserModel,
} from "../../../database/models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { nanoid } from "nanoid";
import redisClient from "../../utils/redis.utils.js";
import cloudinaryConfig from "../../config/cloudinary.config.js";


const userModel = new UserModel(database);
const patientModel = new PatientModel(database);

export const registerPatient = async (req, res, next) => {
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
      gender,
      birthDate,
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
    };
    const patientData = { gender, birthDate };

    // Validate user role
    if (!userData.role || !userData.role.includes(possibleRoles.PATIENT)) {
      logger.error("User must have patient role to register as a patient");
      return next(
        new ErrorHandlerCalss(
          "User must have patient role to register as a patient",
          400,
          "Validation Error",
          "Invalid role"
        )
      );
    }

    // 2. Check for existing user
    // const existingUserByUsername = await userRepository.findByUsername(
    //   userData.userName
    // );
    // if (existingUserByUsername) {
    //    return next(
    //     new ErrorHandlerCalss(
    //       "User with this userName already exists",
    //       409,
    //       "Duplicate Error",
    //       "Username already taken"
    //     )
    //    );
    // }

    // 3. Validate password match
    if (userData.password !== userData.confirmedPassword) {
      throw new ErrorHandlerCalss(
        "Passwords do not match",
        400,
        "Validation Error",
        "Password mismatch"
      );
    }

    // Parallelize independent operations
    const [existingUserByEmail, otp] = await Promise.all([
      userModel.findByEmail(userData.email),
      crypto.randomInt(100000, 999999).toString(),
    ]);

    if (existingUserByEmail) {
      return next(
        new ErrorHandlerCalss(
          "User with this email already exists",
          409,
          "Duplicate Error",
          "Email already registered"
        )
      );
    }

    // store otp to redis
    await redisClient.SET(`otp:${userData.userName}`, otp, 10 * 60);

    if (!req.file) {
      throw new ErrorHandlerCalss(
        "Image is required for profile picture",
        400,
        "Validation Error",
        "Image is required"
      );
    }

    // upload image to cloudinary
    const customId = userData.firstName + nanoid(4);
    const { secure_url, public_id } = await uploadFile({
      file: req.file.path,
      folder: `${process.env.UPLOAD_FILE}/Patient_Profile_Image/${customId}`,
    });

    //capitalize each first name
    userData.firstName = capitalizeName(userData.firstName);
    userData.lastName = capitalizeName(userData.lastName);

    // Create patient first
    const patientObject = new Patient({
      ...patientData,
      profileImage: {
        URL: { secure_url, public_id },
        customId,
      },
    });

    // Create user with patient reference
    const userObject = new User({
      ...userData,
      isVerified: false,
      provider: "google",
      // otp: null,
      patientID: patientObject._id,
    });

    // Save both documents
    await userModel.save(userObject);
    await patientModel.save(patientObject);

    const emailToken = jwt.sign(
      {
        email: userData.email,
      },
      process.env.EMAIL_SECRET
    );

    // Send verification email
    const isEmailSent = await sendEmailService({
      to: userData.email,
      subject: "Verify Your Account with OTP",
      htmlMessage: `<h3>Your OTP for patient registration is: <strong>${otp}</strong></h3>
       <p>It expires in 10 minutes.</p>`,
    });
    if (isEmailSent.rejected.length) {
      logger.error("Failed to send verification email", error);
      return next(
        new ErrorHandlerCalss(
          "Failed to send verification email",
          500,
          "Server Error",
          "Error in sending email"
        )
      );
    }

    res.status(201).json({
      success: true,
      message:
        "Patient registered successfully. Please verify with the OTP sent to your email.",
      emailToken,
    });
  } catch (error) {
    logger.error("Error in registering patient", error.message);
    next(error);
  }
};

/**
 * Verify OTP for email verification
 * @route POST /patient/verify-otp
 */
export const verifyEmailOTP = async (req, res, next) => {
  try {
    const { emailToken } = req.params;
    const { otp } = req.body;

    // Verify email token
    const decodedToken = jwt.verify(emailToken, process.env.EMAIL_SECRET);
    if (!decodedToken) {
      return next(
        new ErrorHandlerCalss(
          "Invalid email token",
          400,
          "decoded error",
          "Error decoding email token"
        )
      );
    }
    // Find user
    const user = await userModel.findByEmail(decodedToken.email);
    if (!user) {
      return next(
        new ErrorHandlerCalss(
          "User not found",
          404,
          "validation error",
          " Error in findByEmail"
        )
      );
    }

    const storedOtp = await redisClient.GET(`otp:${user.userName}`);
    if (!storedOtp || storedOtp !== otp) {
      throw new Error(
        "Invalid OTP. Please request a new one if it has expired."
      );
    }

    // Generate JWT access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        userName: user.userName,
        role: user.role,
        activeRole: user.activeRole,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    console.log("verify email otp:", process.env.ACCESS_TOKEN_SECRET);
    // 6. Generate refresh token (long-lived)
    const refreshToken = crypto.randomBytes(32).toString("hex");

    await userModel.updateById(
      {
        _id: user._id,
        isVerified: false,
      },
      {
        isVerified: true,
      }
    );

    await redisClient.SET(
      `refreshToken:${user.userName}`,
      refreshToken,
      7 * 24 * 60 * 60
    );
    await redisClient.DEL(`otp:${user.userName}`);
    res.status(200).json({
      success: true,
      message: `Email : ${user.email} verified successfully.`,
      data: {
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error("OTP verification failed", error);
    next(
      new ErrorHandlerCalss(
        "'OTP has expired or is invalid. Please request a new one.",
        500,
        error.stack,
        "Error in OTP catch verification"
      )
    );
  }
};

export const deletePatientAccount = async (req, res, next) => {
  const user = req.authUser;

  // 2. Delete Cloudinary image if it exists
  const patientCustomId = user.patientID.profileImage.customId;
  const profilePath = `${process.env.UPLOAD_FILE}/Patient_Profile_Image/${patientCustomId}`;

  await cloudinaryConfig().api.delete_resources_by_prefix(profilePath);
  // // delete folder
  await cloudinaryConfig().api.delete_folder(profilePath);

  await patientModel.deleteById(user.patientID);

  const updatedRoles = user.role.filter(
    (role) => role !== possibleRoles.PATIENT
  );
  await userModel.updateById(
    { _id: user._id },
    {
      $set: {
        role: updatedRoles,
        activeRole: updatedRoles.length ? updatedRoles[0] : null,
      },
      $unset: { patientID: 1 },
    }
  );

  // 3. If no roles remain, delete the user account entirely
  if (updatedRoles.length === 0) {
    await userModel.deleteById(user._id);
    // Clear Redis entries
    await redisClient.DEL(`refreshToken:${user.userName}`);
    await redisClient.DEL(`blacklist:${user._id}`);
  }

  res.status(200).json({
    success: true,
    message:
      updatedRoles.length === 0
        ? "User and patient account deleted successfully"
        : "Patient account deleted successfully",
  });
};

export const editProfileImage = async (req, res, next) => {
  const user = req.authUser;

  // 1. Fetch the patient document using patientID
  const patientId = user.patientID?._id || user.patientID;
  const patient = await patientModel.findById(patientId);
  if (!patient) {
    return next(
      new ErrorHandlerCalss(
        "Patient profile not found",
        404,
        "Not Found",
        "Patient document does not exist"
      )
    );
  }

  // Prepare update data
  const updateData = {};

  // 3. Upload the new profile image to Cloudinary
  const patientCustomId = patient.profileImage?.customId;
  const profilePath = `${process.env.UPLOAD_FILE}/Patient_Profile_Image/${patientCustomId}`;

  if (req.file) {
    // Case 1: new image uploaded
    // 2. Delete the old profile image from Cloudinary if it exists
    if (
      patient.profileImage?.URL?.secure_url &&
      patient.profileImage.URL.secure_url !== DEFAULT_PROFILE_IMAGE
    ) {
      try {
        const urlParts = patient.profileImage.URL.secure_url.split("/upload/");
        if (urlParts.length < 2) {
          return next(
            new ErrorHandlerCalss(
              "Invalid Cloudinary URL format",
              500,
              "Server Error",
              "Invalid Cloudinary URL format"
            )
          );
        }
        const pathWithVersion = urlParts[1].trim();
        const pathParts = pathWithVersion.split("/");
        const versionIndex = pathParts[0].match(/^v\d+$/) ? 1 : 0;
        const publicIdWithExtension = pathParts.slice(versionIndex).join("/");
        const publicId = publicIdWithExtension.split(".")[0];
        await cloudinaryConfig().uploader.destroy(publicId, (error, result) => {
          if (error) {
            logger.warn("Failed to delete old image from Cloudinary", {
              error,
              publicId,
            });
          } else {
            logger.info("Old image deleted from Cloudinary", {
              result,
              publicId,
            });
          }
        });
      } catch (error) {
        logger.warn("Error extracting publicId for Cloudinary deletion", {
          error,
          secure_url: patient.profileImage.URL.secure_url,
        });
      }
    }

    const { secure_url, public_id } = await uploadFile({
      file: req.file.path,
      folder: profilePath,
    });

    if (!public_id || !secure_url) {
      return next(
        new ErrorHandlerCalss(
          "Failed to upload image",
          500,
          "Server Error",
          "Error uploading image to Cloudinary"
        )
      );
    }
    updateData.profileImage = {
      URL: { public_id, secure_url },
      customId: patientCustomId,
    };
  }

  // 4. Update the patient profile with the new image URL
  const updatedPatient = await patientModel.updateById(
    { _id: patientId },
    { $set: updateData },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Patient profile image updated successfully",
    data: updatedPatient,
  });
};

export const removeProfileImage = async (req, res, next) => {
  const user = req.authUser;
  const { removeImage } = req.body; //removeImage: boolean ("true" or "false")

  // 1. Fetch the patient document using patientID
  const patientId = user.patientID?._id || user.patientID;
  const patient = await patientModel.findById(patientId);
  if (!patient) {
    return next(
      new ErrorHandlerCalss(
        "Patient profile not found",
        404,
        "Not Found",
        "Patient document does not exist"
      )
    );
  }

  const patientCustomId = patient.profileImage?.customId;
  console.log(patientCustomId);

  // Prepare update data
  const updateData = {};

  // If removeImage is true, set the default image
  if (removeImage === "true" || removeImage === true) {
    if (
      patient.profileImage?.URL?.secure_url &&
      patient.profileImage.URL.secure_url !== DEFAULT_PROFILE_IMAGE
    ) {
      try {
        const urlParts = patient.profileImage.URL.secure_url.split("/upload/");
        if (urlParts.length < 2) {
          return next(
            new ErrorHandlerCalss(
              "Invalid Cloudinary URL format",
              500,
              "Server Error",
              "Invalid Cloudinary URL format"
            )
          );
        }
        const pathWithVersion = urlParts[1].trim();
        const pathParts = pathWithVersion.split("/");
        const versionIndex = pathParts[0].match(/^v\d+$/) ? 1 : 0;
        const publicIdWithExtension = pathParts.slice(versionIndex).join("/");
        const publicId = publicIdWithExtension.split(".")[0]; // Remove extension

        await cloudinaryConfig().uploader.destroy(publicId, (error, result) => {
          if (error) {
            logger.warn("Failed to delete old image from Cloudinary", {
              error,
              publicId,
            });
          } else {
            logger.info("Old image deleted from Cloudinary", {
              result,
              publicId,
            });
          }
        });
      } catch (error) {
        logger.warn("Error extracting publicId for Cloudinary deletion", {
          error,
          secure_url: patient.profileImage.URL.secure_url,
        });
      }
    }
    updateData.profileImage = {
      URL: { secure_url: DEFAULT_PROFILE_IMAGE },
      customId: patientCustomId,
    };
    console.log(updateData);
  }
  // 4. Update the patient profile with the new image URL
  const updatedPatient = await patientModel.updateById(
    { _id: patientId },
    { $set: updateData },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message:
      removeImage == "true"
        ? "Patient profile image removed successfully"
        : "Patient profile image updated successfully",
    data: updatedPatient,
  });
};

