"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VideoIcon, Loader2 } from "lucide-react";

interface CreateLessonFormProps {
  moduleId: string;
  onSuccess: () => void;
}

export function CreateLessonForm({
  moduleId,
  onSuccess,
}: CreateLessonFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoPublicId, setVideoPublicId] = useState("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (uploadStatus === "uploading") {
      setError("Aguarde o upload do vídeo ser concluído");
      return;
    }

    if (!videoPublicId) {
      setError("Faça o upload de um vídeo para a aula");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      videoPublicId: videoPublicId,
      moduleId: moduleId,
    };

    try {
      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar aula");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao criar aula:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao criar aula. Tente novamente."
      );
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifica o tipo do arquivo
    if (!file.type.includes("video/")) {
      setError("Por favor, selecione um arquivo de vídeo válido");
      return;
    }

    // Verifica o tamanho do arquivo (100MB em bytes)
    if (file.size > 100 * 1024 * 1024) {
      setError("O arquivo é muito grande. O tamanho máximo é 100MB");
      return;
    }

    setUploadStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "lms_videos"
    );

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      setVideoPublicId(data.public_id);
      setUploadStatus("success");
    } catch (error) {
      console.error("Erro no upload:", error);
      setError("Erro ao fazer upload do vídeo");
      setUploadStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Título
        </label>
        <Input
          id="title"
          name="title"
          required
          disabled={loading}
          placeholder="Digite o título da aula"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição
        </label>
        <Textarea
          id="description"
          name="description"
          required
          disabled={loading}
          placeholder="Digite a descrição da aula"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Vídeo da Aula</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploadStatus === "uploading"}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadStatus === "uploading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : uploadStatus === "success" ? (
              <>
                <VideoIcon className="mr-2 h-4 w-4" />
                Alterar Vídeo
              </>
            ) : (
              <>
                <VideoIcon className="mr-2 h-4 w-4" />
                Selecionar Vídeo
              </>
            )}
          </Button>
          {uploadStatus === "success" && (
            <span className="text-sm text-green-600">
              Vídeo enviado com sucesso!
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Selecione um vídeo no formato MP4, MOV ou WEBM (máx. 100MB)
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || uploadStatus === "uploading"}
        >
          {loading ? "Criando..." : "Criar Aula"}
        </Button>
      </div>
    </form>
  );
}
