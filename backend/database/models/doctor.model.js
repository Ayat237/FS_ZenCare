import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import { clinicSchema } from "./clinic.model.js";
import { Gender } from "../../src/utils/enums.utils.js";

const doctorSchema = new mongoose.Schema(
  {
    verification: {
      verificationId: {
        type: String,
        required: true,
        unique: true,
      },
      licenseNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{6}$/, "License number must be a 6-digit number"],
      },
      issueDate: {
        type: Date,
        required: true,
      },
      expiryDate: {
        type: Date,
        required: true,
        validate: {
          validator: function (v) {
            return v > this.issueDate;
          },
          message: "Expiry date must be after issue date",
        },
      },
      verificationDate: {
        type: Date,
        default: Date.now,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    specialty: {
      type: String,
      required: true,
      enum: [
        "Allergy and Immunology",
        "Anesthesiology",
        "Cardiology",
        "Cardiothoracic Surgery",
        "Colorectal Surgery",
        "Critical Care Medicine",
        "Dermatology",
        "Emergency Medicine",
        "Endocrinology",
        "Family Medicine",
        "Forensic Pathology",
        "Gastroenterology",
        "Geriatrics",
        "General Surgery",
        "Gynecology",
        "Hematology",
        "Infectious Disease",
        "Internal Medicine",
        "Interventional Cardiology",
        "Interventional Radiology",
        "Medical Genetics",
        "Medical Oncology",
        "Nephrology",
        "Neurology",
        "Neurosurgery",
        "Nuclear Medicine",
        "Obstetrics",
        "Occupational Medicine",
        "Oncology",
        "Ophthalmology",
        "Oral and Maxillofacial Surgery",
        "Orthopedic Surgery",
        "Otolaryngology (ENT)",
        "Pain Medicine",
        "Palliative Care",
        "Pathology",
        "Pediatrics",
        "Physical Medicine and Rehabilitation",
        "Plastic Surgery",
        "Psychiatry",
        "Pulmonology",
        "Radiation Oncology",
        "Radiology",
        "Reproductive Endocrinology and Infertility",
        "Rheumatology",
        "Sleep Medicine",
        "Sports Medicine",
        "Surgical Oncology",
        "Thoracic Surgery",
        "Transfusion Medicine",
        "Transplant Surgery",
        "Trauma Surgery",
        "Urology",
        "Vascular Surgery",
      ],
    },
    hospitalAffiliation: [{ type: String, required: true }],
    clinicBranches: [clinicSchema],
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);



