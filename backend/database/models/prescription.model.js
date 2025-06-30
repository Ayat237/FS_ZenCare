import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
import { Diseases, DiseaseType } from "../../src/utils/enums.utils.js";
import { MedicalHistory, MedicalHistoryModel } from "./medical_history.model.js";
import { DateTime } from "luxon";

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


// Middleware to update MedicalHistory after saving a prescription
prescriptionSchema.post("save", async function (doc) {
  // Populate the medicationIds to get medication details
  await doc.populate('medicationIds');
  
  const medicalHistory = await MedicalHistory.findOne({ patientId: doc.patientId });

  if (medicalHistory) {
    // Check if the diagnosis already exists to avoid duplication
    const existingDiagnosis = medicalHistory.diagnoses.find(
      (diag) => diag.name === doc.diseaseName && 
      DateTime.fromJSDate(new Date(diag.date)).toISODate() ===
         DateTime.fromJSDate(new Date(doc.createdAt)).toISODate()
    );

    if (!existingDiagnosis) {
      // Get medication details from the populated medicationIds
      const medications = [];
      if (doc.medicationIds && Array.isArray(doc.medicationIds)) {
        for (const medication of doc.medicationIds) {
          medications.push({
            name: medication.medicineName,
            type: medication.medicineType,
          });
        }
      }

      medicalHistory.diagnoses.push({
        type: doc.diseaseType, 
        name: doc.diseaseName,
        date: doc.createdAt,
        medications: medications,
      });
      await medicalHistory.save();
    }
  } else {
    // Create new MedicalHistory if not exists
    const medications = [];
    if (doc.medicationIds && Array.isArray(doc.medicationIds)) {
      for (const medication of doc.medicationIds) {
        medications.push({
          name: medication.medicineName,
          type: medication.medicineType,
        });
      }
    }

    const newMedicalHistory = new MedicalHistory({
      patientId: doc.patientId,
      diagnoses: [{
        type: doc.diseaseType,
        name: doc.diseaseName,
        date: doc.createdAt,
        medications: medications,
      }],
    });
    await newMedicalHistory.save();
  }
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
