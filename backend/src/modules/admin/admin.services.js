import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ErrorHandlerClass, possibleRoles } from "../../utils/index.js";
import redisClient from "../../utils/redis.utils.js";
import fs from "fs";
import { UserModel } from "../../../database/models/user.model.js";
import { DoctorModel } from "../../../database/models/doctor.model.js";
import database from "../../../database/databaseConnection.js";
import mongoose from "mongoose";
import { decrypt } from "./utils/decryption.utils.js";
import { sendEmailService } from "../../services/sendEmail.service.js";
import { Doctor } from "../../../database/models/doctor.model.js";
import { Address } from "../../../database/models/address.model.js";

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
    {
      userId: user._id,
      userName: user.userName,
      role: user.role,
      activeRole: user.activeRole,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "24h" }
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

  // Get and decrypt verification IDs for each doctor
  const doctorsWithVerification = await Promise.all(
    pendingDoctors.map(async (doctor) => {
      const redisKey = `verification:${doctor._id}`;
      const filePath = await redisClient.GET(redisKey);
      console.log(filePath);
      let verificationId = null;
      if (filePath && fs.existsSync(filePath)) {
        const encryptedData = JSON.parse(fs.readFileSync(filePath));
        const decrypted = decrypt(encryptedData.data, encryptedData.iv, doctor.user.toString());
        
        // Convert decrypted buffer to base64 string for frontend display
        verificationId = decrypted.toString('base64');
      }

      return {
        ...doctor.toObject(),
        verificationId: {
          data: verificationId, // base64 string that can be displayed as image in frontend
          contentType: 'image/jpeg' // assuming JPEG format, adjust if needed
        }
      };
    })
  );

  return {
    status: 200,
    success: true,
    message: "Pending doctors retrieved successfully", 
    data: {
      doctors: doctorsWithVerification
    },
  };
};

export const verifyDoctorService = async (userId, isAdminApproved) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Find the user by userId
    const user = await userModel.findById(userId, { session });
    if (!user) {
      throw new ErrorHandlerClass(
        "User not found for doctor approval",
        404,
        "Not Found Error",
        "User not found"
      );
    }

    // If not approved, delete user or just doctor data
    if (!isAdminApproved) {
      // Delete verificationId and pending doctor data from Redis
      const verificationKey = `verification:${user._id}`;
      let filePath = null;
      try {
        filePath = await redisClient.GET(verificationKey);
        await redisClient.DEL(verificationKey);
      } catch (e) {
        // Ignore if not found
      }
      await redisClient.DEL(`pendingDoctor:${user._id}`);
      // Delete verificationId file from local server if it exists
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Failed to delete verification file from local server', e);
        }
      }
      // If user only has doctor role, delete user
      if (user.role.length === 1 && user.role[0] === possibleRoles.DOCTOR) {
        await userModel.deleteById(user._id);
      } else {
        // Remove doctor role and related fields
        user.role = user.role.filter(r => r !== possibleRoles.DOCTOR);
        user.activeRole = user.role.length ? user.role[0] : null;
        user.doctorID = undefined;
        await userModel.save(user, { session });
      }
      // Send rejection email
      await sendEmailService({
        to: user.email,
        subject: "Doctor Verification Rejected",
        htmlMessage: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #cc0000;">Verification Rejected</h2>
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>Your doctor verification was <strong>not approved</strong> by the Ministry of Health. Your data has been removed from our system.</p>
            <p>If you believe this is a mistake, please contact support or try registering again with correct information.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The zenCare Team</strong></p>
          </div>
        `,
      });
      await session.commitTransaction();
      session.endSession();
      return {
        status: 200,
        success: true,
        message: "Doctor verification rejected and data removed.",
        data: {},
      };
    }

    // Retrieve pending doctor data from Redis
    const pendingDataStr = await redisClient.GET(`pendingDoctor:${user._id}`);
    if (!pendingDataStr) {
      throw new ErrorHandlerClass(
        "No pending doctor data found for this user",
        404,
        "Not Found Error",
        "No pending doctor data"
      );
    }
    const pendingData = JSON.parse(pendingDataStr);
    const { doctorData, profileImageObject } = pendingData;

    // For each clinicBranch, create Address and get its _id
    const clinicBranchesWithIds = await Promise.all(
      (doctorData.clinicBranches || []).map(async (branch) => {
        const addressDoc = new database.models.Address(branch.address);
        await addressDoc.save({ session });
        return { address: addressDoc._id, phoneNumber: branch.phoneNumber };
      })
    );

    // Create doctor document
    const doctorObject = new Doctor({
      ...doctorData,
      clinicBranches: clinicBranchesWithIds,
      user: user._id,
      profileImage: profileImageObject,
      rating: { average: 0, count: 0 },
      verification: { isVerified: true },
      isAdminApproved: isAdminApproved,
    });
    await doctorModel.save(doctorObject, { session });

    // Link doctor to user
    user.doctorID = doctorObject._id;
    user.isVerified = true;
    await userModel.save(user, { session });

    // Delete verificationId and pending doctor data from Redis
    const verificationKey = `verification:${user._id}`;
    let filePath = null;
    try {
      filePath = await redisClient.GET(verificationKey);
      await redisClient.DEL(verificationKey);
    } catch (e) {
      // Ignore if not found
    }
    await redisClient.DEL(`pendingDoctor:${user._id}`);
    // Delete verificationId file from local server if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Failed to delete verification file from local server', e);
      }
    }

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

    await session.commitTransaction();
    session.endSession();

    return {
      status: 200,
      success: true,
      message: "Doctor verified and saved successfully. Doctor can now login.",
      data: { doctor: doctorObject },
    };
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};
