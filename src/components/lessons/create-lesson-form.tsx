"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VideoIcon, Loader2, Youtube } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import * as tus from "tus-js-client";

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
  const [videoSource, setVideoSource] = useState<
    "cloudinary" | "youtube" | "vimeo" | "vimeo-upload"
  >("cloudinary");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vimeoFileInputRef = useRef<HTMLInputElement>(null);

  // Estados adicionais para o Vimeo
  const [vimeoFile, setVimeoFile] = useState<File | null>(null);
  const [vimeoProgress, setVimeoProgress] = useState(0);
  const [vimeoUploading, setVimeoUploading] = useState(false);
  const [vimeoVideoId, setVimeoVideoId] = useState<string | null>(null);
  const [vimeoMetadata, setVimeoMetadata] = useState({
    name: "",
    description: "",
  });

  // Atualiza os metadados do Vimeo quando o título e descrição mudam
  useEffect(() => {
    if (videoSource === "vimeo-upload") {
      const titleInput = document.getElementById("title") as HTMLInputElement;
      const descriptionInput = document.getElementById(
        "description"
      ) as HTMLTextAreaElement;

      if (titleInput && descriptionInput) {
        setVimeoMetadata({
          name: titleInput.value,
          description: descriptionInput.value,
        });
      }
    }
  }, [videoSource]);

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
    } else if (videoSource === "youtube") {
      const youtubeId = (
        e.currentTarget.elements.namedItem("youtubeId") as HTMLInputElement
      ).value;
      if (!youtubeId) {
        setError("Insira o ID do vídeo do YouTube");
        return;
      }
      if (!isValidYoutubeId(youtubeId)) {
        setError("ID do YouTube inválido");
        return;
      }
    } else if (videoSource === "vimeo") {
      const vimeoUrl = (
        e.currentTarget.elements.namedItem("vimeoUrl") as HTMLInputElement
      ).value;
      if (!vimeoUrl) {
        setError("Insira a URL do vídeo do Vimeo");
        return;
      }
      if (!isValidVimeoUrl(vimeoUrl)) {
        setError("URL do Vimeo inválida");
        return;
      }
    } else if (videoSource === "vimeo-upload") {
      if (vimeoUploading) {
        setError("Aguarde o upload do vídeo ser concluído");
        return;
      }

      if (!vimeoVideoId) {
        setError("Faça o upload de um vídeo para o Vimeo");
        return;
      }
    }

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    let videoId = videoPublicId;
    let finalVideoSource = videoSource;

    if (videoSource === "youtube") {
      videoId = formData.get("youtubeId") as string;
    } else if (videoSource === "vimeo") {
      videoId = extractVimeoId(formData.get("vimeoUrl") as string);
      finalVideoSource = "vimeo";
    } else if (videoSource === "vimeo-upload") {
      videoId = vimeoVideoId as string;
      finalVideoSource = "vimeo";
    }

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      videoPublicId: videoId,
      videoSource:
        finalVideoSource === "vimeo-upload" ? "vimeo" : finalVideoSource,
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

  // Handler para upload direto para o Vimeo
  const handleVimeoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("video/")) {
      setError("Por favor, selecione um arquivo de vídeo válido");
      return;
    }

    setVimeoFile(file);
    setError("");
  };

  const handleVimeoUpload = async () => {
    if (!vimeoFile) {
      setError("Selecione um arquivo de vídeo");
      return;
    }

    setVimeoUploading(true);
    setError("");
    setVimeoProgress(0);

    try {
      // 1. Obter link de upload do backend
      const { data } = await axios.post("/api/vimeo/upload-link", {
        name: vimeoMetadata.name || vimeoFile.name,
        description: vimeoMetadata.description || "",
      });

      const uploadLink = data.uploadLink;

      // 2. Extrair o ID do vídeo do link
      const videoIdMatch = uploadLink.match(/\/videos\/(\d+)/);
      const extractedVideoId = videoIdMatch ? videoIdMatch[1] : null;

      if (extractedVideoId) {
        setVimeoVideoId(extractedVideoId);
      }

      // 3. Iniciar o upload com tus-js-client
      const upload = new tus.Upload(vimeoFile, {
        endpoint: uploadLink,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: vimeoFile.name,
          filetype: vimeoFile.type,
        },
        onError: (error) => {
          console.error("Erro no upload:", error);
          setVimeoUploading(false);
          setError(
            `Erro durante o upload do vídeo: ${
              error.message || "Erro desconhecido"
            }`
          );
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setVimeoProgress(parseFloat(percentage));
        },
        onSuccess: () => {
          setVimeoProgress(100);
          setVimeoUploading(false);
          console.log("Upload concluído! ID do vídeo:", extractedVideoId);
        },
      });

      // 4. Iniciar o upload
      upload.start();
    } catch (error) {
      console.error("Erro na preparação do upload:", error);
      setVimeoUploading(false);
      setError("Falha ao iniciar o upload para o Vimeo. Tente novamente.");
    }
  };

  const isValidYoutubeId = (id: string) => {
    return /^[a-zA-Z0-9_-]{11}$/.test(id);
  };

  const isValidVimeoUrl = (url: string) => {
    return /^https?:\/\/(www\.)?vimeo\.com\/\d+/.test(url);
  };

  const extractVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : "";
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
          onChange={() => {
            if (videoSource === "vimeo-upload") {
              const titleInput = document.getElementById(
                "title"
              ) as HTMLInputElement;
              setVimeoMetadata((prev) => ({ ...prev, name: titleInput.value }));
            }
          }}
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
          onChange={() => {
            if (videoSource === "vimeo-upload") {
              const descriptionInput = document.getElementById(
                "description"
              ) as HTMLTextAreaElement;
              setVimeoMetadata((prev) => ({
                ...prev,
                description: descriptionInput.value,
              }));
            }
          }}
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">Fonte do Vídeo</label>
        <RadioGroup
          defaultValue="cloudinary"
          onValueChange={(value) =>
            setVideoSource(
              value as "cloudinary" | "youtube" | "vimeo" | "vimeo-upload"
            )
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
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vimeo" id="vimeo" />
            <Label htmlFor="vimeo">Vimeo (URL)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vimeo-upload" id="vimeo-upload" />
            <Label htmlFor="vimeo-upload">Upload para Vimeo</Label>
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
      ) : videoSource === "youtube" ? (
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
      ) : videoSource === "vimeo" ? (
        <div className="space-y-2">
          <label htmlFor="vimeoUrl" className="text-sm font-medium">
            URL do Vídeo do Vimeo
          </label>
          <Input
            id="vimeoUrl"
            name="vimeoUrl"
            required
            disabled={loading}
            placeholder="Ex: https://vimeo.com/123456789"
            className="flex-1"
          />
          <p className="text-sm text-muted-foreground">
            Cole a URL completa do vídeo do Vimeo
          </p>
        </div>
      ) : videoSource === "vimeo-upload" ? (
        <div className="space-y-4">
          <label className="text-sm font-medium">Upload para o Vimeo</label>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="video/*"
                onChange={handleVimeoFileChange}
                ref={vimeoFileInputRef}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                disabled={vimeoUploading}
                onClick={() => vimeoFileInputRef.current?.click()}
              >
                <VideoIcon className="mr-2 h-4 w-4" />
                {vimeoFile ? "Alterar Vídeo" : "Selecionar Vídeo"}
              </Button>

              {vimeoFile && !vimeoVideoId && !vimeoUploading && (
                <Button type="button" onClick={handleVimeoUpload}>
                  Fazer Upload para Vimeo
                </Button>
              )}

              {vimeoFile && (
                <span className="text-sm">
                  {vimeoFile.name} (
                  {(vimeoFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              )}
            </div>

            {vimeoUploading && (
              <div className="space-y-2">
                <Progress value={vimeoProgress} />
                <p className="text-sm text-center">
                  {vimeoProgress.toFixed(0)}% concluído
                </p>
              </div>
            )}

            {vimeoVideoId && vimeoProgress === 100 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">
                  Upload concluído com sucesso! ID do vídeo: {vimeoVideoId}
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Selecione um vídeo para fazer upload diretamente para o Vimeo. O
              título e descrição da aula serão usados como metadados do vídeo.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || uploadStatus === "uploading" || vimeoUploading}
        >
          {loading ? "Criando..." : "Criar Aula"}
        </Button>
      </div>
    </form>
  );
}
