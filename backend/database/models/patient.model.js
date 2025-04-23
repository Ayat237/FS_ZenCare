import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import { Gender } from "../../src/utils/enums.utils.js";

const patientSchema = new Schema(
  {
    gender: {
      type: String,
      enum: Object.values(Gender),
      default : Gender.OTHER,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    profileImage: {
      URL: {
        public_id: {
          type: String,
          required: false,
          default: null,
          unique: false
        },
        secure_url: {
          type: String,
          required: false,
        },
      },
      customId: {
        type: String,
        required: false,
        unique: true,
      },
    }, // Patient's profile image
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.models.patientModel || model("Patient", patientSchema);

class PatientModel extends BaseModel {
  constructor(database) {
    super(database, "patient");
  }
}

export { PatientModel, Patient };
