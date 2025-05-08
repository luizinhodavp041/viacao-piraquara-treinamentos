// src/models/Course.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  modules: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Título é obrigatório"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Descrição é obrigatória"],
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

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
