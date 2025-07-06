import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import { PaymentStatus } from "../../src/utils/enums.utils.js";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    jitsiMeeting: {
      roomName: {
        type: String,
        required: false,
      },
      moderatorToken: {
        type: String,
        required: false,
      },
      guestToken: {
        type: String,
        required: false,
      },
      createdAt: {
        type: Date,
        required: false,
      },
      expiresAt: {
        type: Date,
        required: false,
      },
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
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paymentIntentId: { type: String, unique: true },
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

const Appointment =
  mongoose.models.Appointment || model("Appointment", appointmentSchema);

class AppointmentModel extends BaseModel {
  constructor(database) {
    super(database, "Appointment");
  }
}

export { AppointmentModel, Appointment };
export default Appointment;
