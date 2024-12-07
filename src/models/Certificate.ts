// src/models/Certificate.ts
import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const generateValidationCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  8
);

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    quizScore: {
      type: Number,
      required: true,
    },
    validationCode: {
      type: String,
      required: true,
      unique: true,
      default: () => generateValidationCode(),
    },
    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },
  },
  {
    timestamps: {
      createdAt: "issuedAt",
      updatedAt: true,
    },
  }
);

const Certificate =
  mongoose.models.Certificate ||
  mongoose.model("Certificate", certificateSchema);

export default Certificate;
