import mongoose, { Schema, model } from "mongoose";

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },
    availability: [
      {
        day: {
          type: String,
          enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          required: true,
        },
        timeSlots: [
          {
            startTime: {
              type: String,
              required: true,
              match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"],
            },
            endTime: {
              type: String,
              required: true,
              match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"],
            },
            price: {
              type: Number,
              required: true,
              min: 0,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const DoctorSchedule = mongoose.models.DoctorSchedule || model("DoctorSchedule", doctorScheduleSchema);
export default DoctorSchedule;