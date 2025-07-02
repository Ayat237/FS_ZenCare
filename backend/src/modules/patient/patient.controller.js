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

// export const registerPatient = async (req, res, next) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       userName,
//       email,
//       password,
//       confirmedPassword,
//       mobilePhone,
//       role,
//       gender,
//       birthDate,
//       address,
//       coordinates,
//     } = req.body;

//     // Prepare user and patient data
//     const userData = {
//       firstName: capitalizeName(firstName),
//       lastName: capitalizeName(lastName),
//       userName,
//       email,
//       password,
//       confirmedPassword,
//       mobilePhone,
//       role,
//     };
//     const patientData = { gender, birthDate, address, coordinates };

//     // Parallelize independent operations
//     const [existingUser, otp] = await Promise.all([
//       userModel.findByEmail(userData.email),
//       crypto.randomInt(100000, 999999).toString(),
//     ]);

//     // Handle profile image (default or uploaded)
//     let profileImageObject = {
//       URL: { secure_url: null, public_id: null },
//       customId: null,
//     };
//     const customId = firstName + nanoid(4);

//     if (!req.file) {
//       const defaultImage = getDefaultImageByGender(gender);
//       profileImageObject = {
//         URL: {
//           secure_url: defaultImage.secure_url,
//           public_id: defaultImage.public_id,
//         },
//         customId,
//       };
//     } else {
//       const { secure_url, public_id } = await uploadFile({
//         file: req.file.path,
//         folder: `${process.env.UPLOAD_FILE}/Patient_Profile_Image/${customId}`,
//       });
//       profileImageObject = {
//         URL: { secure_url, public_id },
//         customId,
//       };
//     }

//     // --- CASE 1: User exists ---
//     if (existingUser) {
//       if (existingUser.role.includes(possibleRoles.PATIENT)) {
//         throw new ErrorHandlerClass(
//           "User already registered with this email as a patient",
//           409,
//           "Duplicate Error",
//           "Patient role already exists"
//         );
//       }
//       if (!existingUser.isVerified) {
//         throw new ErrorHandlerClass(
//           "User must be verified before adding a new role",
//           400,
//           "Validation Error",
//           "Unverified user"
//         );
//       }
//       // Add patient role and create patient document
//       existingUser.role.push(possibleRoles.PATIENT);
//       existingUser.activeRole = possibleRoles.PATIENT;

//       // Create patient document
//       const patientObject = new Patient({
//         ...patientData,
//         profileImage: profileImageObject,
//       });
//       await patientModel.save(patientObject);

//       const addressObject = new Address({
//         displayName: address,
//         coordinates: coordinates,
//         patientID: patientObject._id,
//       });
//       await addressModel.save(addressObject);

//       // Link patient to user
//       existingUser.patientID = patientObject._id;
//       await userModel.save(existingUser);

//       return res.status(201).json({
//         success: true,
//         message: "Patient role added to existing user.",
//         data: { user: existingUser, patient: patientObject },
//       });
//     }

//     // 3. Validate password match
//     if (userData.password !== userData.confirmedPassword) {
//       throw new ErrorHandlerClass(
//         "Passwords do not match",
//         400,
//         "Validation Error",
//         "Password mismatch"
//       );
//     }

//     // store otp to redis
//     await redisClient.SET(`otp:${userData.userName}`, otp, 10 * 60);

//     // Create patient document
//     const patientObject = new Patient({
//       birthDate: birthDate,
//       gender: gender,
//       profileImage: profileImageObject,
//     });

//     const addressObject = new Address({
//       displayName: address,
//       coordinates: coordinates,
//       patientID: patientObject._id,
//     });

//     // Create user document
//     const userObject = new User({
//       ...userData,
//       role: [possibleRoles.PATIENT],
//       activeRole: possibleRoles.PATIENT,
//       isVerified: false,
//       provider: Provider.LOCAL,
//       patientID: patientObject._id,
//     });

//     // Save both documents
//     await userModel.save(userObject);
//     await patientModel.save(patientObject);
//     await addressModel.save(addressObject);

//     const emailToken = jwt.sign(
//       {
//         email: userData.email,
//       },
//       process.env.EMAIL_SECRET
//     );

//     // Send verification email
//     const isEmailSent = await sendEmailService({
//       to: userData.email,
//       subject: "Action Required: Verify Your Email with OTP",
//       htmlMessage: `
//         <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
//           <h2 style="color: #007BFF;">Patient Registration – Email Verification</h2>
//           <p>Hello ${userData.fullName || "User"},</p>
//           <p>To complete your patient registration, please use the following One-Time Password (OTP):</p>
//           <p style="font-size: 20px; font-weight: bold; color: #000;">${otp}</p>
//           <p>This OTP is valid for <strong>10 minutes</strong>.</p>
//           <p><strong>Important:</strong> For your security, do not share this code with anyone.</p>
//           <p>If you did not request this, please ignore this message.</p>
//           <br />
//           <p>Thank you,</p>
//           <p><strong>ZenCare</strong></p>
//         </div>
//       `,
//     });

//     if (isEmailSent.rejected.length) {
//       logger.error("Failed to send verification email", isEmailSent.rejected);
//       return next(
//         new ErrorHandlerClass(
//           "Failed to send verification email",
//           500,
//           "Server Error",
//           "Error in sending email"
//         )
//       );
//     }

//     res.status(201).json({
//       success: true,
//       message:
//         "Patient registered successfully. Please verify with the OTP sent to your email.",
//       emailToken,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


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



