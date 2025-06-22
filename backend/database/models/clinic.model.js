import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";

const clinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "Egypt",
    },
  },
  location: {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: "2dsphere",
      validate: {
        validator: function (coords) {
          return (
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90
          );
        },
        message:
          "Coordinates must be valid longitude (-180 to 180) and latitude (-90 to 90)",
      },
    },
  },
});

const Clinic = mongoose.models.clinicModel || model("Clinic", clinicSchema);

export { Clinic, clinicSchema };
