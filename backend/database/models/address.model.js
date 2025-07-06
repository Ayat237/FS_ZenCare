import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import { ErrorHandlerClass } from "../../src/utils/error-class.utils.js";

const addressSchema = new Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: false,
    },
    displayName: {
      type: String,
      required: false,
    },
    coordinates: {
      longitude: {
        type: Number,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
// Ensure either patientId or doctorId is provided, but not both
addressSchema.pre("save", function (next) {
  if (!this.patientId && !this.doctorId) {
    return next(new ErrorHandlerClass("Either patientId or doctorId is required"));
  }
  if (this.patientId && this.doctorId) {
    return next(new ErrorHandlerClass("Cannot specify both patientId and doctorId"));
  }
  next();
});

const Address = mongoose.models.addressModel || model("Address", addressSchema);

class AddressModel extends BaseModel {
  constructor(database) {
    super(database, "address");
  }
}
export { Address, AddressModel };
