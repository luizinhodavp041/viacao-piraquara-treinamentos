// src/models/Progress.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  progress: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índice composto para garantir que cada usuário tenha apenas um registro para cada lição
ProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const Progress: Model<IProgress> =
  mongoose.models.Progress ||
  mongoose.model<IProgress>("Progress", ProgressSchema);

export default Progress;
