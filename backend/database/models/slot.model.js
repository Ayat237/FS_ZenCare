import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import { AppointmentType } from "../../src/utils/enums.utils.js";

const slotSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // Format: "HH:MM"
      required: true,
    },
    endTime: {
      type: String, // Format: "HH:MM"
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: Object.values(AppointmentType),
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

// Create an index on doctorId and date for faster querying
slotSchema.index({ doctorId: 1, date: 1 });

const Slot = mongoose.models.Slot || model("Slot", slotSchema);

class SlotModel extends BaseModel {
  constructor(database) {
    super(database, "slot");
  }
}

export { SlotModel, Slot };
