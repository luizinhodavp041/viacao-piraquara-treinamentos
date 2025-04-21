// src/components/lessons/create-lesson-form.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VideoIcon, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import * as tus from "tus-js-client";
import axios from "axios";

interface CreateLessonFormProps {
  moduleId: string;
  onSuccess: () => void;
}

export function CreateLessonForm({
  moduleId,
  onSuccess,
}: CreateLessonFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Estados para o Vimeo
  const [vimeoFile, setVimeoFile] = useState<File | null>(null);
  const [vimeoProgress, setVimeoProgress] = useState(0);
  const [vimeoUploading, setVimeoUploading] = useState(false);
  const [vimeoVideoId, setVimeoVideoId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!title.trim()) {
      setError("O título da aula é obrigatório");
      return;
    }

    setVimeoUploading(true);
    setError("");
    setVimeoProgress(0);

    try {
      // 1. Obter link de upload do Vimeo
      console.log("Solicitando link de upload...");
      const response = await fetch("/api/vimeo/upload-tus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title,
          description: description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao obter link de upload");
      }

      const data = await response.json();
      const uploadLink = data.uploadLink;
      const videoId = data.videoId;

      console.log("Link de upload obtido:", uploadLink);
      console.log("ID do vídeo:", videoId);

      if (!uploadLink || !videoId) {
        throw new Error("Dados de upload inválidos");
      }

      setVimeoVideoId(videoId);

      // 2. Iniciar o upload com tus-js-client
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
          setError(`Erro durante o upload do vídeo: ${error.message || "Erro desconhecido"}`);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setVimeoProgress(parseFloat(percentage));
        },
        onSuccess: async () => {
          setVimeoProgress(100);
          console.log("Upload concluído! ID do vídeo:", videoId);
          
          // 3. Adicionar a aula ao módulo
          try {
            const lessonResponse = await fetch(`/api/modules/${moduleId}/lessons`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title,
                description,
                vimeoId: videoId,
              }),
            });

            if (!lessonResponse.ok) {
              const lessonError = await lessonResponse.json();
              throw new Error(lessonError.error || "Erro ao criar aula");
            }

            setSuccess(true);
            setVimeoUploading(false);
            onSuccess();
          } catch (lessonError) {
            console.error("Erro ao criar aula:", lessonError);
            setError(lessonError instanceof Error ? lessonError.message : "Erro ao criar aula");
            setVimeoUploading(false);
          }
        },
      });

      // Iniciar o upload
      upload.start();
    } catch (error) {
      console.error("Erro na preparação do upload:", error);
      setVimeoUploading(false);
      setError(error instanceof Error ? error.message : "Erro ao iniciar upload");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("O título da aula é obrigatório");
      return;
    }

    if (!vimeoFile && !vimeoVideoId) {
      setError("Selecione um arquivo de vídeo");
      return;
    }

    if (vimeoVideoId && vimeoProgress === 100) {
      // Se o vídeo já foi enviado, apenas criar a aula
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/modules/${moduleId}/lessons`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            vimeoId: vimeoVideoId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao criar aula");
        }

        setSuccess(true);
        setLoading(false);
        onSuccess();
      } catch (error) {
        console.error("Erro ao criar aula:", error);
        setError(error instanceof Error ? error.message : "Erro ao criar aula");
        setLoading(false);
      }
    } else if (vimeoFile && !vimeoUploading) {
      // Se há um arquivo selecionado mas o upload ainda não iniciou
      handleVimeoUpload();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-500 bg-green-50 rounded-md">
          Aula criada com sucesso!
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Título
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading || vimeoUploading}
          placeholder="Digite o título da aula"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading || vimeoUploading}
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
            disabled={vimeoUploading}
            onClick={() => fileInputRef.current?.click()}
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
              {vimeoFile.name} ({(vimeoFile.size / (1024 * 1024)).toFixed(2)} MB)
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

        <p className="text-sm text-muted-foreground mt-2">
          Selecione um vídeo para fazer upload para o Vimeo.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || vimeoUploading}
        >
          {loading || vimeoUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {vimeoUploading ? "Enviando..." : "Criando..."}
            </>
          ) : (
            "Criar Aula"
          )}
        </Button>
      </div>
    </form>
  );
}