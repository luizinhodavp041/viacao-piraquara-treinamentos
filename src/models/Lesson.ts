import mongoose, { Schema, Document } from "mongoose";

export interface ILesson extends Document {
  title: string;
  description: string;
  courseId: mongoose.Types.ObjectId;
  vimeoId: string;
  duration: number;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    vimeoId: { type: String, default: null },
    duration: { type: Number, default: 0 }, // Duração em segundos
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Índices para melhorar a performance das consultas
LessonSchema.index({ courseId: 1, order: 1 });
LessonSchema.index({ vimeoId: 1 });

export default mongoose.models.Lesson ||
  mongoose.model<ILesson>("Lesson", LessonSchema);
