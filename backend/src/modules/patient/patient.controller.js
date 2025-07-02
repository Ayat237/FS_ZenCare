import {
  ErrorHandlerClass,
  logger,
  possibleRoles,
  uploadFile,
  capitalizeName,
  DEFAULT_PROFILE_IMAGE,
  Provider,
  getDefaultImageByGender,
  Images,
} from "../../utils/index.js";
import database from "../../../database/databaseConnection.js";
import { sendEmailService } from "../../services/sendEmail.service.js";
import {
  Address,
  AddressModel,
  Patient,
  PatientModel,
  User,
  UserModel,
} from "../../../database/models/index.js";

import redisClient from "../../utils/redis.utils.js";
import cloudinaryConfig from "../../config/cloudinary.config.js";
import { addPatientRoleToExistingUserService, registerNewPatientUserService } from "./patient.service.js";

const userModel = new UserModel(database);
const patientModel = new PatientModel(database);



// Register a new patient (new user)
export const registerNewPatientUser = async (req, res, next) => {
  try {
    const {
      firstName, lastName, userName, email, password, confirmedPassword,
      mobilePhone, role, gender, birthDate, address, coordinates
    } = req.body;

    const userData = {
      firstName, lastName, userName, email, password, confirmedPassword, mobilePhone, role
    };
    const patientData = { gender, birthDate, address, coordinates };

    const result = await registerNewPatientUserService(userData, patientData, req.file);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// Add patient role to existing user
export const addPatientRoleToExistingUser = async (req, res, next) => {
  try {
    const { email, gender, birthDate, address, coordinates } = req.body;
    const existingUser = await userModel.findByEmail(email);
    if (!existingUser) {
      return next(new ErrorHandlerClass("User not found", 404, "Not Found", "User does not exist"));
    }
    const patientData = { gender, birthDate, address, coordinates };
    const result = await addPatientRoleToExistingUserService(existingUser, patientData, req.file);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
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
      new ErrorHandlerClass(
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
      ![Images.PATIENT_MALE, Images.PATIENT_FEMALE, Images.OTHER].includes(
        patient.profileImage.URL.public_id
      )
    ) {
      try {
        // const urlParts = patient.profileImage.URL.secure_url.split("/upload/");
        // if (urlParts.length < 2) {
        //   return next(
        //     new ErrorHandlerClass(
        //       "Invalid Cloudinary URL format",
        //       500,
        //       "Server Error",
        //       "Invalid Cloudinary URL format"
        //     )
        //   );
        // }
        // const pathWithVersion = urlParts[1].trim();
        // const pathParts = pathWithVersion.split("/");
        // const versionIndex = pathParts[0].match(/^v\d+$/) ? 1 : 0;
        // const publicIdWithExtension = pathParts.slice(versionIndex).join("/");
        // const publicId = publicIdWithExtension.split(".")[0];
        await cloudinaryConfig().uploader.destroy(
          patient.profileImage.URL.public_id,
          (error, result) => {
            if (error) {
              logger.warn("Failed to delete old image from Cloudinary", {
                error,
                publicId: patient.profileImage.URL.public_id,
              });
            } else {
              logger.info("Old image deleted from Cloudinary", {
                result,
                publicId: patient.profileImage.URL.public_id,
              });
            }
          }
        );
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
        new ErrorHandlerClass(
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
  } else {
    // Case 2: No file uploaded, no update to profileImage
    return res.status(200).json({
      success: true,
      message: "No new image provided, profile image unchanged",
      data: patient,
    });
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

  // 1. Fetch the patient document using patientID
  const patientId = user.patientID?._id || user.patientID;
  const patient = await patientModel.findById(patientId);
  if (!patient) {
    return next(
      new ErrorHandlerClass(
        "Patient profile not found",
        404,
        "Not Found",
        "Patient document does not exist"
      )
    );
  }

  const patientCustomId = patient.profileImage?.customId;

  // Prepare update data
  const updateData = {};

  // If removeImage is true, set the default image
  if (
    patient.profileImage?.URL?.secure_url &&
    ![Images.PATIENT_MALE, Images.PATIENT_FEMALE, Images.OTHER].includes(
      patient.profileImage.URL.public_id
    )
  ) {
    try {
      await cloudinaryConfig().uploader.destroy(
        patient.profileImage.URL.public_id,
        (error, result) => {
          if (error) {
            logger.warn("Failed to delete old image from Cloudinary", {
              error,
              publicId: patient.profileImage.URL.public_id,
            });
          } else {
            logger.info("Old image deleted from Cloudinary", {
              result,
              publicId: patient.profileImage.URL.public_id,
            });
          }
        }
      );
    } catch (error) {
      logger.warn("Error extracting publicId for Cloudinary deletion", {
        error,
        secure_url: patient.profileImage.URL.secure_url,
      });
    }
  }

  // Set the default image based on gender
  const defaultImage = getDefaultImageByGender(patient.gender);
  updateData.profileImage = {
    URL: {
      secure_url: defaultImage.secure_url, // Shared default secure_url
      public_id: defaultImage.public_id, // Shared default public_id
    },
    customId: patientCustomId,
  };

  // 4. Update the patient profile with the new image URL
  const updatedPatient = await patientModel.updateById(
    { _id: patientId },
    { $set: updateData },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "Patient profile image removed successfully",
    data: updatedPatient,
  });
};



