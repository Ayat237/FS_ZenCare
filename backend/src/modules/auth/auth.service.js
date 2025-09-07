import jwt from "jsonwebtoken";
import crypto from "crypto";
import redisClient from "../../utils/redis.utils.js";
import { PatientModel, UserModel } from "../../../database/models/index.js";
import database from "../../../database/databaseConnection.js";
import { possibleRoles } from "../../utils/system-roles.utils.js";

const userModel = new UserModel(database);
const patientModel = new PatientModel(database);

/**
 * Helper function to complete the login process
 */
export const completeLogin = async (user, selectedRole, selectedId, res) => {
  // 1. Update active role
  await userModel.updateById(
    { _id: user._id },
    { activeRole: selectedRole },
    { new: true }
  );

  // 2. Generate JWT access token
  const accessToken = jwt.sign(
    {
      userId: user._id,
      userName: user.userName,
      role: selectedRole,
      activeRole: selectedRole,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "24h" }
  );
  //console.log(process.env.ACCESS_TOKEN_SECRET);
  // 3. Generate refresh token
  const refreshToken = crypto.randomBytes(32).toString("hex");

  // 4. Update user with refresh token
  //await userModel.updateById({ _id: user._id }, { refreshToken });

  // 5. Store refresh token in Redis (7-day TTL)
  await redisClient.DEL(`blacklist:${user._id}`);
  await redisClient.SET(
    `refreshToken:${user.userName}`,
    refreshToken,
    7 * 24 * 60 * 60
  );

  // 6. Get profile image based on role
  let profileImage = null;
  if (selectedRole === possibleRoles.PATIENT) {
    const patient = await patientModel.findById(selectedId);
    profileImage = patient?.profileImage?.URL?.secure_url;
  } else if (selectedRole === possibleRoles.DOCTOR) {
    // Assuming a Doctor model exists; adjust accordingly
    //TODO: Replace with actual Doctor model
    // const doctor = await doctorModel.findById(selectedId);
    // profileImage = doctor?.profileImage?.URL?.secure_url;
  }

  // 7. Send response
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        mobilePhone: user.mobilePhone,
        role: selectedRole,
        activeRole: selectedRole,
        profileImage,
      },
    },
  });
};
