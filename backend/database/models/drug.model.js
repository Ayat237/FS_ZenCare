import mongoose, { Schema, model } from "mongoose";
import BaseModel from "./base.model.js";
const drugSchema = new Schema(
  {
    drugId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Optional: Create a text index for full-text search on name
drugSchema.index({ name: "text" });

const Drug = mongoose.models.drugModel || model("Drug", drugSchema);

class DrugModel extends BaseModel {
  constructor(database) {
    super(database, "drug");
  }
}

export { DrugModel, Drug };
