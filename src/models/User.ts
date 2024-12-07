import mongoose from "mongoose";
import { User } from "@/types";

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<User>("User", userSchema);
