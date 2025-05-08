// src/models/Module.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IModule extends Document {
  title: string;
  description: string;
  lessons: mongoose.Types.ObjectId[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema: Schema = new Schema(
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
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para ordenação
ModuleSchema.index({ order: 1 });

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const Module: Model<IModule> =
  mongoose.models.Module || mongoose.model<IModule>("Module", ModuleSchema);

export default Module;
