import mongoose, { Schema, model } from "mongoose";
import { AppointmentStatus } from "../../src/utils/enums.utils.js";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 25,
      min: 1,
      max: 40,
    },
    telemedicineDetails: {
      jitsiRoomId: {
        type: String,
        required: true,
        unique: true,
      },
      jitsiMeetingLink: {
        type: String,
        required: true,
      },
      startTime: { type: Date },
      endTime: { type: Date },
    },
    notes: { type: String },
    attachments: [
      {
        file: {
          type: String, // Path or URL after upload
          required: false,
        },
        customId: { type: String, unique: true },
      },
    ],
    paymentIntentId: { type: String, unique: true },
    price: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    prescription: {
      text: { type: String },
      sentAt: { type: Date },
    },
    medicalHistoryShared: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Appointment = mongoose.models.Appointment || model("Appointment", appointmentSchema);
export default Appointment;