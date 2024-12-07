import mongoose from "mongoose";
import { Course } from "@/types";

const courseSchema = new mongoose.Schema<Course>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Course ||
  mongoose.model<Course>("Course", courseSchema);
