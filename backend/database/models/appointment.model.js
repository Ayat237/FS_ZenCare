import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import { AppointmentType } from "../../src/utils/enums.utils.js";

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
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(AppointmentType),
      required: true,
      default: AppointmentType.TELEMEDICINE,
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
