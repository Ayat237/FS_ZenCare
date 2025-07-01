import database from "../../../database/databaseConnection.js";
import { DoctorModel } from "../../../database/models/doctor.model.js";

const doctorModel = new DoctorModel(database);

export const verifyDoctorService = async (doctorId, isVerified, adminId) => {
  const doctor = await doctorModel.findById(doctorId,{
    select: "email",
    populate: "User",
  });
  if (!doctor) {
    throw new ErrorHandlerClass(
      "Doctor not found",
      404,
      "Not Found",
      "Doctor not found"
    );
  }
  const keys = await redisClient.KEYS(`verification:${doctorId}_*`);
  if (keys.length > 0) {
    const filePaths = await Promise.all(
      keys.map((key) => redisClient.GET(key))
    );
    filePaths.forEach((filePath) => {
      if (filePath && fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const { encryptedData, iv } = content;
        const decryptedBuffer = decrypt(encryptedData, iv, doctorId); // Optional: Save for audit
        fs.unlinkSync(filePath);
      }
    });
    await redisClient.DEL(...keys);
  }
  doctor.verification.isVerified = isVerified;
  await doctorModel.save(doctor);
  if (isVerified) await sendEmailService({
    to: doctor.user.email,
    subject: "Doctor Verification credentials",
    htmlMessage: `
    <p>Hello ${doctor.user.fullName},</p>
    <p>Your doctor verification has been approved. You can now login to your account and start using our platform.</p>
    <p>Thank you for using our platform.</p>
    `
  });
  return { status: 200, success: true, message: "Doctor verification updated" };
};
