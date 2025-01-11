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
      enum: ["cloudinary", "youtube", "vimeo"],
      default: "cloudinary",
    },
    // Campos específicos para metadados do Vimeo
    videoMetadata: {
      duration: Number, // Duração em segundos
      thumbnailUrl: String, // URL da thumbnail do vídeo
      qualityOptions: [
        {
          // Opções de qualidade disponíveis
          quality: String,
          url: String,
        },
      ],
      lastSync: Date, // Última vez que os metadados foram sincronizados
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

// Índices para melhorar a performance das consultas
lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ module: 1, order: 1 });

// Método para verificar se o vídeo é do Vimeo
lessonSchema.methods.isVimeoVideo = function () {
  return this.videoSource === "vimeo";
};

// Método para atualizar metadados do vídeo
lessonSchema.methods.updateVideoMetadata = async function (metadata: {
  duration?: number;
  thumbnailUrl?: string;
  qualityOptions?: Array<{ quality: string; url: string }>;
}) {
  this.videoMetadata = {
    ...this.videoMetadata,
    ...metadata,
    lastSync: new Date(),
  };
  return this.save();
};

export default mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
