import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import { Diseases, DiseaseType } from "../../src/utils/enums.utils.js";

const prescriptionSchema = new Schema(
  {
    diseaseName: {
      type: String,
      required: true,
      enum: Diseases,
    },
    diseaseType: {
      type: String,
      required: true,
      enum: DiseaseType,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    medicationIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Medication",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Cascade delete for medications
prescriptionSchema.pre("deleteOne", { document: true }, async function (next) {
  await mongoose
    .model("Medication")
    .deleteMany({ _id: { $in: this.medicationId } });
  next();
});

const Prescription =
  mongoose.models.prescriptionModel ||
  model("Prescription", prescriptionSchema);

class PrescriptionModel extends BaseModel {
  constructor(database) {
    super(database, "prescription");
  }
}

export { PrescriptionModel, Prescription };
