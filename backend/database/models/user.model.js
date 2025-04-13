import mongoose, { Schema, Model, model } from "mongoose";
import BaseModel from "./base.model.js";
import { logger, Provider, systemRoles } from "../../src/utils/index.js";
import MongooseDatabase from "../mongoDatabase.js";
import { hash, hashSync } from "bcryptjs";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 3,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobilePhone: {
      type: [String],
      required: true,
    },
    role: {
      type: [String],
      enum: Object.values(systemRoles),
      default: systemRoles.PATIENT,
      required: true,
    },
    doctorID: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
    },
    patientID: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    activeRole: {
      type: String,
      enum: Object.values(systemRoles),
      default: systemRoles.PATIENT,
    },
    provider: {
      type: String,
      enum: Object.values(Provider),
      default: Provider.LOCAL,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    }, // sparse allows null values to be non-unique
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hashSync(this.password, +process.env.SALT_ROUND);
  }
  next();
});

const User = mongoose.models.userModel || model("User", userSchema);

class UserModel extends BaseModel {
  constructor(database) {
    super(database, "user");
  }
  async findByEmail(email) {
    try {
      const result = await this.database.findByEmail(email);
      //logger.debug("Found user by email in repository", { email });
      return result;
    } catch (error) {
      logger.error("Failed to find user by email in repository", {
        error: error.message,
        stack: error.stack,
        email,
      });
      throw error;
    }
  }
}

export { UserModel, User };
