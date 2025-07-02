import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ErrorHandlerClass, possibleRoles } from "../../utils/index.js";
import redisClient from "../../utils/redis.utils.js";
import fs from "fs";
import { UserModel } from "../../../database/models/user.model.js";
import { DoctorModel } from "../../../database/models/doctor.model.js";
import database from "../../../database/databaseConnection.js";
import mongoose from "mongoose";

const userModel = new UserModel(database);
const doctorModel = new DoctorModel(database);

export const adminLoginService = async (email, password) => {
  const user = await userModel.findOne({ email: email.toLowerCase() });
  if (!user || !user.role.includes(possibleRoles.ADMIN)) {
    throw new ErrorHandlerClass(
      "Invalid email or password, please check your email and password and try again",
      401,
      "Authentication Error",
      "Invalid credentials"
    );
  }
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    throw new ErrorHandlerClass(
      "Invalid email or password, please check your email and password",
      401,
      "Authentication Error",
      "Invalid credentials"
    );
  }
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return {
    status: 200,
    success: true,
    message: "Admin logged in successfully",
    data: { token },
  };
};

export const getPendingDoctorsService = async () => {
  // Support both isAdminApproved: false and missing field
  const pendingDoctors = await doctorModel.find(
    {
      $or: [
        { isAdminApproved: false },
        { isAdminApproved: { $exists: false } },
      ],
    },
    {
      select: {
        user: 1,
        specialty: 1,
        clinicBranches: 1,
        profileImage: 1,
      },
    }
  );
  return {
    status: 200,
    success: true,
    message: "Pending doctors retrieved successfully",
    data: { doctors: pendingDoctors },
  };
};

export const verifyDoctorService = async (doctorId) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const doctor = await doctorModel.findById(doctorId).session(session);
    if (!doctor) {
      throw new ErrorHandlerClass(
        "Doctor not found, please check the doctor id",
        404,
        "Not Found",
        "Doctor not found"
      );
    }
    if (doctor.isAdminApproved) {
      throw new ErrorHandlerClass(
        "Doctor already approved",
        400,
        "Validation Error",
        "Already approved"
      );
    }

    doctor.isAdminApproved = true;
    await doctorModel.save(doctor, { session });

    // Delete verification data from Redis
    const redisKey = `verification:${doctorId}`;
    let filePath = null;
    try {
      filePath = await redisClient.GET(redisKey);
      await redisClient.DEL(redisKey);
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw new ErrorHandlerClass(
        "Failed to delete verification data from Redis",
        500,
        "Server Error",
        "Redis deletion failed"
      );
    }

    // Delete verificationId file from local server
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw new ErrorHandlerClass(
          "Failed to delete verification file from local server",
          500,
          "Server Error",
          "File deletion failed"
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return {
      status: 200,
      success: true,
      message: "Doctor verified successfully",
      data: { doctor },
    };
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};
