// src/models/Lesson.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILesson extends Document {
  title: string;
  description: string;
  videoId: string;
  order: number;
  duration: number; // duração em segundos
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema: Schema = new Schema(
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
    videoId: {
      type: String,
      required: [true, "ID do vídeo é obrigatório"],
    },
    order: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para ordenação
LessonSchema.index({ order: 1 });

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema);

export default Lesson;
