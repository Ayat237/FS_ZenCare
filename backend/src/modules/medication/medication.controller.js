import { DateTime } from "luxon";
import { PatientModel } from "../../../database/models/patient.model.js";
import { MedicationModel, Medication } from "../../../database/models/medications.model.js";
import { Frequency } from "../../utils/enums.utils.js";
import database from "../../../database/databaseConnection.js";
import { UserModel } from "../../../database/models/user.model.js";

const userModel = new UserModel(database);
const patientModel = new PatientModel(database);
const medicationModel = new MedicationModel(database);

export const addMedicine = async (req, res, next) => {
  const user = req.authUser;
  console.log("user:  ",user);
  
  const patientId = user.patientID?._id||user.patientID;
  console.log(patientId);
  
  const patient = await patientModel.findById(patientId);
  if (!patient) {
    return next(
      new ErrorHandlerCalss(
        "Patient not found",
        404,
        "Not Found",
        "Error in create medicine"
      )
    );
  }

  const {
    medicineName,
    medicineType,
    dose,
    frequency,
    timesPerDay,
    daysOfWeek,
    startHour,
    startDateTime,
    endDateTime,
    intakeInstructions,
    notes,
    reminders,
  } = req.body;

  const startDate = DateTime.fromISO(startDateTime).toJSDate();
  const endDate = DateTime.fromISO(endDateTime).toJSDate();


  
  const medicineRecord = new Medication({
    CreatedBy: user._id,
    patientId,
    medicineName,
    medicineType,
    dose,
    frequency,
    startHour,
    timesPerDay: (frequency === Frequency.DAILY ? timesPerDay : null),
    daysOfWeek: (frequency === Frequency.WEEKLY ? daysOfWeek : null),
    startDateTime: startDate,
    endDateTime: endDate,
    intakeInstructions,
    notes,
    reminders: reminders || [],
  });

  await medicationModel.save(medicineRecord);

  // Respond with the created medication
  res.status(201).json({
    success: true,
    message: "Medication created successfully",
    data: {
      ...medicineRecord.toObject(),
    },
})
};


export const updateMedicationRecord = async (req, res, next) => {
  const { id } = req.params;
    const {
        medicineName,
        medicineType,
        dose,
        frequency,
        timesPerDay,
        daysOfWeek,
        startHour,
        startDateTime,
        endDateTime,
        intakeInstructions,
        notes
    } = req.body; // Fields to update (e.g., name, dosage, frequency, timesPerDay)

    // Find the medication by ID
    const medication = await medicationModel.findById(id);
    if (!medication) {
        return next(
            new ErrorHandlerCalss(
                "Medication not found",
                404,
                "Not Found",
                "Error in update medication"
            )
        );
    }

    if (medicineName) {
        medication.medicineName = medicineName;
    }
    if (medicineType) {
        medication.medicineType = medicineType;
    }
    if (dose) {
        medication.dose = dose;
    }

    // Update the frequency and related fields based on the new frequency
    if (frequency &&frequency !== medication.frequency) {
        medication.frequency = frequency;
        medication.timesPerDay = frequency === Frequency.DAILY ? timesPerDay : null;
        medication.daysOfWeek = frequency === Frequency.WEEKLY ? daysOfWeek : null;
    }else if (frequency === Frequency.DAILY && timesPerDay) {
      medication.timesPerDay = timesPerDay;
    } else if (frequency === Frequency.WEEKLY && daysOfWeek) {
      medication.daysOfWeek = daysOfWeek;
    }

    if (startHour) {
        medication.startHour = startHour;
    }
    if (startDateTime) {
        medication.startDateTime = DateTime.fromISO(startDateTime).toJSDate();
    }
    if (endDateTime) {
        medication.endDateTime = DateTime.fromISO(endDateTime).toJSDate();
    }
    if (intakeInstructions) {
        medication.intakeInstructions = intakeInstructions;
    }
    if (notes) {
        medication.notes = notes;
    }
    // Save the updated medication record
    await medicationModel.save(medication);

    // Respond with the updated medication
    res.status(200).json({
        success: true,
        message: "Medication updated successfully",
        data: {
            ...medication.toObject(),
        },
    });
}