import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import { Gender, Specialties } from "../../src/utils/enums.utils.js";

const doctorSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAdminApproved: {
      type: Boolean,
      default: false,
    },
    specialty: {
      type: String,
      required: true,
      enum: Object.values(Specialties),
    },
    hospitalAffiliation: [
      {
        name: {
          type: String,
          required: true,
        },
      },
    ],
    clinicBranches: [
      {
        address: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Address",
          required: true,
        },
        phoneNumber: { type: String, required: true },
      },
    ],
    profileImage: {
      URL: {
        public_id: {
          type: String,
          required: false,
          default: null,
          unique: false,
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
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.OTHER,
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0,
    },
    education: [
      {
        degree: { type: String, required: true },
        institution: {
          type: String,
          required: true,
        },
        graduationYear: {
          type: Number,
          required: true,
          min: 1900,
          max: new Date().getFullYear(),
        },
      },
    ],
    certifications: [{ type: String }],
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Doctor = mongoose.models.doctorModel || model("Doctor", doctorSchema);

class DoctorModel extends BaseModel {
  constructor(database) {
    super(database, "doctor");
  }
}

export { DoctorModel, Doctor };
