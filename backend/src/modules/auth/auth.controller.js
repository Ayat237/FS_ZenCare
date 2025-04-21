import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import database from "../../../database/databaseConnection.js";
import {
  Patient,
  PatientModel,
  User,
  UserModel,
} from "../../../database/models/index.js";
import {
  capitalizeName,
  ErrorHandlerClass,
  generateRandomPassword,
  logger,
  possibleRoles,
  RANDOM_OBJECT_ID,
} from "../../utils/index.js";
import { completeLogin } from "./auth.service.js";
import redisClient from "../../utils/redis.utils.js";
import { sendEmailService } from "../../services/sendEmail.service.js";
import { verifyGoogleIdToken } from "../../utils/googleOAuth.utils.js";
import { nanoid } from "nanoid";

const userModel = new UserModel(database);
const patientModel = new PatientModel(database);

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) {
    return next(
      new ErrorHandlerClass(
        "User not found",
        400,
        "Valiation error",
        "Error in login user found"
      )
    );
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(
      new ErrorHandlerClass(
        "Invalid email or password",
        400,
        "Valiation Error",
        "Error in password matching"
      )
    );
  }

  // 5. Check for multiple roles
  const hasPatientRole =
    user.role.includes(possibleRoles.PATIENT) && user.patientID;
  const hasDoctorRole =
    user.role.includes(possibleRoles.DOCTOR) && user.doctorID;

  if (!hasPatientRole && !hasDoctorRole) {
    return next(
      new ErrorHandlerClass(
        "User has no valid roles",
        400,
        "Validation Error",
        "No associated patient or doctor profile"
      )
    );
  }

  // 6. If multiple roles, return options for selection
  if (hasPatientRole && hasDoctorRole) {
    return res.status(200).json({
      success: true,
      message: "Multiple roles detected. Please select a role.",
      data: {
        roles: [
          { role: possibleRoles.PATIENT, id: user.patientID },
          { role: possibleRoles.DOCTOR, id: user.doctorID },
        ],
        userId: user._id,
      },
    });
  }

  // 7. If single role, proceed with login
  const selectedRole = hasPatientRole
    ? possibleRoles.PATIENT
    : possibleRoles.DOCTOR;
  const selectedId = hasPatientRole ? user.patientID : user.doctorID;
  logger.info(selectedId);
  await completeLogin(user, selectedRole, selectedId, res);
};

/**
 * Complete login with selected role
 * @route POST /patient/select-role
 */
export const selectRole = async (req, res, next) => {
  const { userId } = req.params;
  const { selectedRole } = req.body;

  // 2. Find user
  const user = await userModel.findById(userId);
  // populate("user.patientID userdoctorID");
  if (!user) {
    return next(
      new ErrorHandlerClass(
        "User not found",
        404,
        "Authentication Error",
        "User not found"
      )
    );
  }

  // 3. Validate selected role
  if (!user.role.includes(selectedRole)) {
    return next(
      new ErrorHandlerClass(
        "Invalid role selection",
        400,
        "Validation Error",
        "Role not associated with user"
      )
    );
  }

  // 4. Determine selected ID based on role
  const selectedId =
    selectedRole === possibleRoles.PATIENT ? user.patientID : user.doctorID;
  if (!selectedId) {
    return next(
      new ErrorHandlerClass(
        "No profile found for selected role",
        400,
        "Validation Error",
        "Missing profile"
      )
    );
  }

  // 5. Complete login
  await completeLogin(user, selectedRole, selectedId, res);
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findByEmail(email);
  if (!user) {
    return next(
      new ErrorHandlerClass(
        "User not found",
        404,
        "Authentication Error",
        "Error in forget password"
      )
    );
  }

  // 3. Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = 10 * 60; // 10 minutes TTL

  // 4. Store OTP in Redis
  await redisClient.SET(`otp:${user.userName}`, otp, otpExpiry);

  const emailToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.EMAIL_SECRET
  );

  // 5. Send OTP via email
  const isEmailSent = await sendEmailService({
    to: user.email,
    subject: "Password Reset OTP",
    htmlMessage: `<h3>Your OTP for password reset is: <strong>${otp}</strong></h3>
    <p>It expires in 10 minutes.</p>`,
  });

  if (isEmailSent.rejected.length) {
    logger.error("Failed to send forget password OTP email", error);
    return next(
      new ErrorHandlerClass(
        "Failed to send OTP email",
        500,
        "Server Error",
        "Error in sending email"
      )
    );
  }

  res.status(200).json({
    success: true,
    message: `OTP sent to your email ${user.email} for password reset. It expires in 10 minutes.`,
    emailToken,
  });
};

export const resetPassword = async (req, res, next) => {
  const emailToken = req.headers['emailtoken'] || req.headers['emailToken'];
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return next(
      new ErrorHandlerClass(
        "New password and confirm password do not match",
        400,
        "Validation Error",
        "Error in reset password"
      )
    );
  }

  // 2. Verify email token
  const decodedToken = jwt.verify(emailToken, process.env.EMAIL_SECRET);
  if (!decodedToken) {
    return next(
      new ErrorHandlerClass(
        "Invalid email token",
        400,
        "decoded error",
        "Error decoding email token"
      )
    );
  }

  // 3. Find user
  const user = await userModel.findByEmail(decodedToken.email);
  if (!user) {
    return next(
      new ErrorHandlerClass(
        "User not found",
        404,
        "Authentication Error",
        "Error in reset password"
      )
    );
  }

  // Generate JWT access token
  const accessToken = jwt.sign(
    {
      userId: user._id,
      userName: user.userName,
      role: user.activeRole,
      activeRole: user.activeRole,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "24h" }
  );
  console.log(process.env.ACCESS_TOKEN_SECRET);

  // 6. Generate refresh token (long-lived)
  const refreshToken = crypto.randomBytes(32).toString("hex");

  // 4. Update password
  user.password = newPassword;
  await userModel.save(user);

  await redisClient.SET(
    `refreshToken:${user.userName}`,
    refreshToken,
    7 * 24 * 60 * 60
  );

  res.status(200).json({
    success: true,
    message:
      "Password reset successful. You can now login with your new password.",
    data: {
      token: accessToken,
      refreshToken,
    },
  });
};

export const verifyPasswordOTP = async (req, res, next) => {
  try {
    const emailToken = req.headers['emailtoken'] || req.headers['emailToken'];
    const { otp } = req.body;

    // Verify email token
    const decodedToken = jwt.verify(emailToken, process.env.EMAIL_SECRET);
    if (!decodedToken) {
      return next(
        new ErrorHandlerClass(
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
        new ErrorHandlerClass(
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

    await userModel.updateById(
      {
        _id: user._id,
        isVerified: false,
      },
      {
        isVerified: true,
      }
    );

    await redisClient.DEL(`otp:${user.userName}`);
    res.status(200).json({
      success: true,
      message: `Otp password verified successfully.`,
    });
  } catch (error) {
    logger.error("OTP verification failed", error);
    next(
      new ErrorHandlerClass(
        "'OTP has expired or is invalid. Please request a new one.",
        500,
        error.stack,
        "Error in OTP catch verification"
      )
    );
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const emailToken = req.headers['emailtoken'] || req.headers['emailToken'];
    logger.info(`Resending OTP to user`);

    const decodedToken = jwt.verify(emailToken, process.env.EMAIL_SECRET);
    if (!decodedToken) {
      return next(
        new ErrorHandlerClass(
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
        new ErrorHandlerClass(
          "User not found",
          404,
          "validation error",
          " Error in findByEmail"
        )
      );
    }

    // 2. Check if user is already verified
    if (user.isVerified) {
      return next(
        new ErrorHandlerClass(
          "User is already verified. No OTP needed.",
          400,
          "OTP Error",
          "Error in Otp verfication"
        )
      );
    }

    // 3. Generate new OTP (6-digit random number)
    const newOtp = crypto.randomInt(100000, 999999).toString();
    await redisClient.SET(`otp:${user.userName}`, newOtp, 10 * 60);

    // Send verification email
    const isEmailSent = await sendEmailService({
      to: user.email,
      subject: "Verify Your Account with OTP",
      htmlMessage: `<h3>Your OTP for patient registration is: <strong>${newOtp}</strong></h3>
       <p>It expires in 5 minutes.</p>`,
    });
    if (isEmailSent.rejected.length) {
      logger.error("Failed to send verification email", error);
      return next(
        new ErrorHandlerClass(
          "Failed to send verification email",
          500,
          "Server Error",
          "Error in sending email"
        )
      );
    }
    // 5. Return success response
    res.status(200).json({
      success: true,
      message:
        "A new OTP has been sent to your email. It expires in 10 minutes.",
      data: {
        userId: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error("OTP resend failed", error);
    throw error;
  }
};

export const logout = async (req, res, next) => {
  const { _id, userName } = req.authUser;
  if (_id) {
    await redisClient.SET(`blacklist:${_id}`, "true", 24 * 60 * 60); // Blacklist for 24 hours
  }

  await redisClient.DEL(`refreshToken:${userName}`);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getLoggedInProfile = async (req, res, next) => {
  const user = req.authUser;

  // Determine profile image based on active role
  let profileImage = null;
  if (user.activeRole === possibleRoles.PATIENT && user.patientID) {
    const patient = user.patientID; // Already populated
    profileImage = patient?.profileImage?.URL?.secure_url;
  } else if (user.activeRole === possibleRoles.DOCTOR && user.doctorID) {
    const doctor = user.doctorID; // Already populated
    profileImage = doctor?.profileImage?.URL?.secure_url;
  }

  // Return user profile
  res.status(200).json({
    success: true,
    message: "User profile retrieved successfully",
    data: {
      id: user._id,
      Name: user.firstName + " " + user.lastName,
      userName: user.userName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      activeRole: user.activeRole,
      profileImage,
    },
  });
};

/**
 * Update user account details
 * @route PUT /auth/update
 * @middleware authentication
 */

export const updateAccount = async (req, res, next) => {
  // to ensure only the logged in user can update the account
  const user = req.authUser;

  const { firstName, email, lastName, userName, phoneNumber } = req.body;

  if (userName) {
    const existingUser = await userModel.findOne({ userName });
    if (existingUser) {
      return next(
        new ErrorHandlerClass(
          "Username already in use",
          400,
          "Validation Error",
          "Username is already taken"
        )
      );
    }
    user.userName = userName;
  }

  if (firstName) {
    user.firstName = capitalizeName(firstName);
  }
  if (lastName) {
    user.lastName = capitalizeName(lastName);
  }
  if (phoneNumber) {
    user.mobilePhone = phoneNumber;
  }

  let emailChanged = false;
  // Check for duplicate email or username if provided
  if (email && email !== user.email) {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return next(
        new ErrorHandlerClass(
          "Email already in use",
          400,
          "Validation Error",
          "Email is already registered"
        )
      );
    }

    // Generate a verification token (e.g., OTP or unique token)
    const verificationOTP = crypto.randomInt(100000, 999999); // 6-digit random OTP
    const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry

    // Store pending email in Redis
    await redisClient.SET(
      `pendingEmail:${user._id}`,
      JSON.stringify({
        pendingEmail: email,
        verificationOTP,
        expiry: verificationExpiry,
      }),
      24 * 60 * 60 // 24 hours TTL
    );

    // Send verification email
    const isEmailSent = await sendEmailService({
      to: email,
      subject: "Verify Your New Email",
      htmlMessage: `<h3>Your verification code is  <strong>${verificationOTP}.</strong></h3>
       <p>It expires in 24 hours. Please use this code to confirm your new email.</p>`,
    });
    if (isEmailSent.rejected.length) {
      logger.error("Failed to send verification email", error);
      return next(
        new ErrorHandlerClass(
          "Failed to send verification email",
          500,
          "Server Error",
          "Error in sending email"
        )
      );
    }

    // Optional: Notify old email
    await sendEmailService({
      to: user.email,
      subject: "Email Change Notification",
      htmlMessage: `<h3>A request to change your email to <strong>${email}</strong>has been made. 
      Please verify it with the code sent to the new address.</h3>`,
    });

    emailChanged = true;
  }

  // 2. Save updated user
  await userModel.save(user);

  logger.info(user);
  res.status(200).json({
    success: true,
    message: emailChanged
      ? "User account updated. Please verify your new email with the code sent to you."
      : "User account updated successfully",
  });
};

export const verifyNewEmail = async (req, res, next) => {
  const user = req.authUser;
  const { OTP } = req.body;

  // 1. Retrieve pending email from Redis
  const pendingEmailData = await redisClient.GET(`pendingEmail:${user._id}`);
  if (!pendingEmailData) {
    return next(
      new ErrorHandlerClass(
        "No pending email verification found",
        400,
        "Validation Error",
        "No email change request pending"
      )
    );
  }

  const { pendingEmail, verificationOTP, expiry } =
    JSON.parse(pendingEmailData);
  if (Date.now() > expiry) {
    await redisClient.DEL(`pendingEmail:${user._id}`);
    return next(
      new ErrorHandlerClass(
        "Verification otp has expired",
        400,
        "Validation Error",
        "Please request a new email change"
      )
    );
  }

  if (OTP !== verificationOTP) {
    return next(
      new ErrorHandlerClass(
        "Invalid verification otp",
        400,
        "Validation Error",
        "OTP does not match"
      )
    );
  }

  // 2. Update user email
  user.email = pendingEmail;
  await userModel.save(user);

  await redisClient.DEL(`pendingEmail:${user._id}`);

  // 3. Send confirmation
  await sendEmailService({
    to: pendingEmail,
    subject: "Email Verified Successfully",
    htmlMessage: `<h3>Your email has been successfully updated.</h3>`,
  });

  res.status(200).json({
    success: true,
    message: "Email verified and updated successfully",
    data: await userModel.findById(user._id, { select: "-password" }),
  });
};
//================================================================
export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(
      new ErrorHandlerClass(
        "Refresh token is required",
        400,
        "Validation Error",
        "Missing refresh token"
      )
    );
  }
  // Find the user associated with the refresh token
  let userName;
  let user;
  const keys = await redisClient.KEYS("refreshToken:*");

  for (const key of keys) {
    const storedToken = await redisClient.GET(key);
    if (storedToken === refreshToken) {
      // Extract username from key (refreshToken:username)
      userName = key.split(":")[1];
      user = await userModel.findOne({ userName });
      break;
    }
  }

  if (!user) {
    return next(
      new ErrorHandlerClass(
        "Invalid refresh token",
        401,
        "Authentication Error",
        "Refresh token not found"
      )
    );
  }

  // Generate a new access token
  const newAccessToken = jwt.sign(
    {
      userId: user._id,
      userName: user.userName,
      role: user.activeRole,
      activeRole: user.activeRole,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "24h" }
  );

  //generate a new refresh token (rotating refresh tokens for added security)
  const newRefreshToken = crypto.randomBytes(32).toString("hex");

  // Update Redis with the new refresh token
  await redisClient.SET(
    `refreshToken:${user.userName}`,
    newRefreshToken,
    7 * 24 * 60 * 60 // 7 days TTL
  );

  // Send response
  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
};
//================================================================
// Signup with Google (Step 1: Authenticate and check user)
export const signupWithGoogle = async (req, res, next) => {
  const { idToken, role } = req.body;

  // Validate user role
  if (!role || !role.includes(possibleRoles.PATIENT)) {
    logger.error("User must have patient role to register as a patient");
    return next(
      new ErrorHandlerClass(
        "User must have patient role to register as a patient",
        400,
        "Validation Error",
        "Invalid role"
      )
    );
  }

  // Verify the Google ID token
  const payload = await verifyGoogleIdToken(idToken);
  if (!payload.email_verified) {
    logger.error("Google ID token is not verified");
    return next(
      new ErrorHandlerClass(
        "Google ID token is not verified",
        401,
        "Authentication Error",
        "Google ID token is not verified"
      )
    );
  }

  const { sub: googleId, email, picture, given_name, family_name } = payload;

  // Check if user already exists
  const user = await userModel.findByEmail(email);
  if (user) {
    return next(
      new ErrorHandlerClass(
        "User with this email already exists",
        409,
        "Duplicate Error",
        "Email already registered"
      )
    );
  }

  // Generate a unique username (e.g., given_name + random string)
  const baseUserName = given_name.toLowerCase() + nanoid(4);
  let userName = baseUserName;

  // Use Google profile picture or default
  const profileImageUrl = picture || DEFAULT_PROFILE_IMAGE;

  // Capitalize names
  const firstName = capitalizeName(given_name);
  const lastName = capitalizeName(family_name);

  // Generate a random password
  const randomPassword = generateRandomPassword();
  const hashedPassword = bcrypt.hashSync(
    randomPassword,
    +process.env.SALT_ROUND
  );

  // Create Patient or Doctor document based on role
  let patientObject, doctorObject;
  const customId = firstName + nanoid(4);
  if (role === possibleRoles.PATIENT) {
    patientObject = new Patient({
      profileImage: {
        URL: {
          secure_url: profileImageUrl,
          public_id: profileImageUrl,
        },
        customId,
      },
      birthDate: Date.now(),
    });
    await patientModel.save(patientObject);
  } else if (role === possibleRoles.DOCTOR) {
    // doctorObject = new Doctor({
    //   profileImage: {
    //     URL: { secure_url: profileImageUrl },
    //     customId,
    //   },
    // });
    // await doctorModel.save(doctorObject);
  }

  // Create User document
  const userObject = new User({
    googleId,
    email: email,
    password: hashedPassword,
    firstName,
    lastName,
    userName,
    provider: "google",
    isVerified: true, // Google verifies the user
    role,
    patientID: patientObject ? patientObject._id : RANDOM_OBJECT_ID,
    doctorID: doctorObject ? doctorObject._id : RANDOM_OBJECT_ID,
  });

  await userModel.save(userObject);

  //Generate JWT access token
  const accessToken = jwt.sign(
    {
      userId: userObject._id,
      userName: userObject.userName,
      role: userObject.role,
      activeRole: userObject.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "24h" }
  );

  // 6. Generate refresh token (long-lived)
  const refreshToken = crypto.randomBytes(32).toString("hex");
  await redisClient.SET(
    `refreshToken:${userObject.userName}`,
    refreshToken,
    7 * 24 * 60 * 60
  );

  res.status(201).json({
    success: true,
    message: "User signed up successfully with Google",
    token: accessToken,
    refreshToken,
    user: {
      id: userObject._id,
      email: userObject.email,
      firstName: userObject.firstName,
      lastName: userObject.lastName,
      role: userObject.role,
      patientID: userObject.patientID || RANDOM_OBJECT_ID,
      doctorID: userObject.doctorID || RANDOM_OBJECT_ID,
    },
  });
};

//===========================================================================
//login with google
export const loginWithGoogle = async (req, res, next) => {
  const { idToken } = req.body;

  // Verify the Google ID token
  const payload = await verifyGoogleIdToken(idToken);
  const {
    sub: googleId,
    given_name,
    family_name,
    picture,
    email_verified,
  } = payload;

  if (!email_verified) {
    logger.error("Google ID token is not verified");
    return next(
      new ErrorHandlerClass(
        "Google ID token is not verified",
        401,
        "Authentication Error",
        "Google ID token is not verified"
      )
    );
  }

  // Check if user already exists
  let user = await userModel.findOne({ googleId });
  if (!user) {
    return next(
      new ErrorHandlerClass(
        "User not found",
        404,
        "Not Found",
        "User not found. Please sign up first."
      )
    );
  }
  // Update user info from Google payload
  user.firstName = capitalizeName(given_name);
  user.lastName = capitalizeName(family_name);
  if (picture) {
    if (user.role.includes(possibleRoles.PATIENT) && user.patientID) {
      const patient = await patientModel.findById(user.patientID);

      if (patient) {
        patient.profileImage.URL.secure_url = picture;
        await patientModel.save(patient);
      }
    } else if (user.role.includes(possibleRoles.DOCTOR) && user.doctorID) {
      const doctor = await doctorModel.findById(user.doctorID);
      if (doctor) {
        doctor.profileImage.URL.secure_url = picture;
        await doctorModel.save(doctor);
      }
    }
  }
  await userModel.save(user);

  // 5. Check for multiple roles
  const hasPatientRole =
  (user.patientID == RANDOM_OBJECT_ID)
  ? false: user.role.includes(possibleRoles.PATIENT) && user.patientID;

  const hasDoctorRole =
    (user.doctorID == RANDOM_OBJECT_ID)
      ? false
      : user.role.includes(possibleRoles.DOCTOR) && user.doctorID;
    console.log("hasDoctorRole: ",hasDoctorRole);
    
  if (!hasPatientRole && !hasDoctorRole) {
    return next(
      new ErrorHandlerClass(
        "User has no valid roles",
        400,
        "Validation Error",
        "No associated patient or doctor profile"
      )
    );
  }

  // 6. If multiple roles, return options for selection
  if (hasPatientRole && hasDoctorRole) {
    return res.status(200).json({
      success: true,
      message: "Multiple roles detected. Please select a role.",
      data: {
        roles: [
          { role: possibleRoles.PATIENT, id: user.patientID },
          { role: possibleRoles.DOCTOR, id: user.doctorID },
        ],
        userId: user._id,
      },
    });
  }

  // 7. If single role, proceed with login
  const selectedRole = hasPatientRole
    ? possibleRoles.PATIENT
    : possibleRoles.DOCTOR;
  const selectedId = hasPatientRole ? user.patientID : user.doctorID;
  logger.info(selectedId);
  await completeLogin(user, selectedRole, selectedId, res);
};
