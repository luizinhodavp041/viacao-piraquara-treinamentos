"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VideoIcon, Loader2, Youtube } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  const [videoSource, setVideoSource] = useState<"cloudinary" | "youtube">(
    "cloudinary"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (videoSource === "cloudinary") {
      if (uploadStatus === "uploading") {
        setError("Aguarde o upload do vídeo ser concluído");
        return;
      }

      if (!videoPublicId) {
        setError("Faça o upload de um vídeo para a aula");
        return;
      }
    } else {
      const youtubeId = (
        e.currentTarget.elements.namedItem("youtubeId") as HTMLInputElement
      ).value;
      if (!youtubeId) {
        setError("Insira o ID do vídeo do YouTube");
        return;
      }
      // Validar formato do ID do YouTube
      if (!isValidYoutubeId(youtubeId)) {
        setError("ID do YouTube inválido");
        return;
      }
    }

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      videoPublicId:
        videoSource === "cloudinary"
          ? videoPublicId
          : formData.get("youtubeId"),
      videoSource: videoSource,
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

    if (!file.type.includes("video/")) {
      setError("Por favor, selecione um arquivo de vídeo válido");
      return;
    }

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

  const isValidYoutubeId = (id: string) => {
    // Regex básica para ID do YouTube (11 caracteres)
    return /^[a-zA-Z0-9_-]{11}$/.test(id);
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

      <div className="space-y-4">
        <label className="text-sm font-medium">Fonte do Vídeo</label>
        <RadioGroup
          defaultValue="cloudinary"
          onValueChange={(value) =>
            setVideoSource(value as "cloudinary" | "youtube")
          }
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cloudinary" id="cloudinary" />
            <Label htmlFor="cloudinary">Upload de Vídeo (Cloudinary)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="youtube" id="youtube" />
            <Label htmlFor="youtube">YouTube</Label>
          </div>
        </RadioGroup>
      </div>

      {videoSource === "cloudinary" ? (
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
      ) : (
        <div className="space-y-2">
          <label htmlFor="youtubeId" className="text-sm font-medium">
            ID do Vídeo do YouTube
          </label>
          <div className="flex items-center gap-4">
            <Input
              id="youtubeId"
              name="youtubeId"
              required
              disabled={loading}
              placeholder="Ex: dQw4w9WgXcQ"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                window.open(
                  "https://support.google.com/youtube/answer/171780",
                  "_blank"
                )
              }
            >
              <Youtube className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Cole apenas o ID do vídeo (os 11 caracteres após v= na URL)
          </p>
        </div>
      )}

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
("");
