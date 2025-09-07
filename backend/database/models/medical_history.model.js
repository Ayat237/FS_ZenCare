import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import {
  AccessMedicalHistoryStatus,
  Diseases,
  DiseaseType,
  LifeStyleName,
  MedicineType,
} from "../../src/utils/enums.utils.js";
import crypto from "crypto";

const medicalHistorySchema = new Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },
    encryptedData: {
      type: String,
      required: false,
    },
    iv: {
      type: String,
      required: false,
    },
    accessRequests: [
      {
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
        status: {
          type: String,
          enum: Object.values(AccessMedicalHistoryStatus),
          default: AccessMedicalHistoryStatus.PENDING,
        },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
    diagnoses: [
      {
        type: { type: String, 
          enum: Object.values(DiseaseType),
          required: true },
        name: {
          type: String,
          enum: Object.values(Diseases),
          required: true,
        },
        date: { type: Date, required: true },
        medications: [
          {
            name: {
              type: String,
              required: true,
            },
            type: {
              type: String,
              enum: Object.values(MedicineType),
              required: true,
            },
          },
        ],
        attachment: {
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
      },
    ],
    testsAndRays: [
      {
        name: { type: String, required: true },
        diseaseName: {
          type: String,
          enum: Object.values(Diseases),
          required: true,
        },
        description: { type: String },
        attachment: {
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
        date: { type: Date, required: true },
      },
    ],
    surgeries: [
      {
        name: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true },
      },
    ],
    vaccination: [
      {
        name: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true },
      },
    ],
    lifeStyles: [
      {
        type: String,
        enum: Object.values(LifeStyleName),
        required: true,
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure one document per patientId
//medicalHistorySchema.index({ patientId: 1 }, { unique: true });

medicalHistorySchema.pre("save", function (next) {
  if (this.isModified("diagnoses") || this.isModified("testsAndRays") || this.isModified("surgeries") || this.isModified("vaccination") || this.isModified("lifeStyles") || this.isNew) {
    const masterKey = Buffer.from(process.env.MASTER_KEY, "utf8");
    const key = crypto.createHmac("sha256", masterKey).update(this.patientId.toString()).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const dataToEncrypt = {
      diagnoses: this.diagnoses || [],
      testsAndRays: this.testsAndRays || [],
      surgeries: this.surgeries || [],
      vaccination: this.vaccination || [],
      lifeStyles: this.lifeStyles || [],
    };
    let encrypted = cipher.update(JSON.stringify(dataToEncrypt), "utf8", "hex");
    encrypted += cipher.final("hex");
    this.encryptedData = encrypted;
    this.iv = iv.toString("hex");
    // Clear unencrypted fields after encryption
    this.diagnoses = undefined;
    this.testsAndRays = undefined;
    this.surgeries = undefined;
    this.vaccination = undefined;
    this.lifeStyles = undefined;
  }
  next();
});

// Method to decrypt data for in-memory use
medicalHistorySchema.methods.decryptData = function () {
  const masterKey = Buffer.from(process.env.MASTER_KEY , "utf8");
  const key = crypto.createHmac("sha256", masterKey).update(this.patientId.toString()).digest();
  const iv = Buffer.from(this.iv, "hex");
  const encryptedText = Buffer.from(this.encryptedData, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString("utf8"));
};


const MedicalHistory =
  mongoose.models.medicalHistoryModel ||
  model("MedicalHistory", medicalHistorySchema);

class MedicalHistoryModel extends BaseModel {
  constructor(database) {
    super(database, "medicalHistory");
  }
}

export { MedicalHistoryModel, MedicalHistory };
