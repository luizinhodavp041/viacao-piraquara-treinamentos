import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoPublicId: {
      type: String,
      required: true,
    },
    videoSource: {
      type: String,
      enum: ["cloudinary", "youtube"],
      default: "cloudinary",
    },
    order: {
      type: Number,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
