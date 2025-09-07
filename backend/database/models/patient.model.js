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


// Virtual field to calculate age based on birthDate
patientSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  
  // Adjust age if birthday hasn't occurred this year
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age < 0 ? 0 : age;
});

// Enable virtuals when converting document to JSON
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

class PatientModel extends BaseModel {
  constructor(database) {
    super(database, "patient");
  }
}

export { PatientModel, Patient };
