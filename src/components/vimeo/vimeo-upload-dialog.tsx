"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { VideoIcon, Upload, CheckCircle2 } from "lucide-react";
import axios from "axios";

interface VimeoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (videoId: string, videoData: any) => void;
}

export function VimeoUploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: VimeoUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
  });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Usamos um estado para rastrear o iframe em vez de um ref
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);

  // Limpar estados quando o modal é fechado
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Remover o iframe quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };
  }, [iframe]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.includes("video/")) {
      setError("Por favor, selecione um arquivo de vídeo válido");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Preencher o título automaticamente com o nome do arquivo se estiver vazio
    if (!metadata.name) {
      // Remover a extensão do arquivo
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setMetadata((prev) => ({ ...prev, name: fileName }));
    }
  };

  const handleMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Selecione um arquivo de vídeo");
      return;
    }

    if (!metadata.name) {
      setError("Digite um título para o vídeo");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // 1. Obter formulário de upload do backend
      const response = await axios.post("/api/vimeo/upload-link", {
        name: metadata.name,
        description: metadata.description || "",
        fileSize: file.size, // Tamanho do arquivo em bytes
        privacy: "nobody",
      });

      console.log("Resposta da API de upload:", response.data);

      const uploadLink = response.data.uploadLink;
      const videoUri = response.data.videoUri;
      const extractedVideoId = response.data.videoId;

      if (!uploadLink || !extractedVideoId) {
        throw new Error("Resposta inválida da API do Vimeo");
      }

      // Salvar o ID do vídeo
      setVideoId(extractedVideoId);

      // Guardar URL para upload
      setUploadUrl(uploadLink);

      // Usar um FormData para enviar o arquivo manualmente
      const formData = new FormData();
      formData.append("file_data", file);

      // Configurar um evento para acompanhar o progresso do upload
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadLink);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentage = (event.loaded / event.total) * 100;
          setProgress(percentage);
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Upload concluído com sucesso
          setProgress(100);
          setUploading(false);

          // Chamar o callback de sucesso
          if (onSuccess) {
            onSuccess(extractedVideoId, { id: extractedVideoId });
          }
        } else {
          // Erro no upload
          setError(`Erro no upload: ${xhr.statusText}`);
          setUploading(false);
        }
      };

      xhr.onerror = () => {
        setError("Erro de conexão durante o upload");
        setUploading(false);
      };

      // Iniciar o upload
      xhr.send(formData);
    } catch (error) {
      console.error("Erro na preparação do upload:", error);
      setUploading(false);
      setError("Falha ao iniciar o upload para o Vimeo. Tente novamente.");
    }
  };

  const resetForm = () => {
    setFile(null);
    setMetadata({ name: "", description: "" });
    setProgress(0);
    setUploading(false);
    setVideoId(null);
    setError(null);
    setUploadUrl(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Limpar iframe
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
      setIframe(null);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Vídeo para o Vimeo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Arquivo de Vídeo</label>
            <div className="flex items-center gap-2">
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
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-center"
              >
                <VideoIcon className="mr-2 h-4 w-4" />
                {file ? "Alterar Vídeo" : "Selecionar Vídeo"}
              </Button>
            </div>
            {file && (
              <p className="text-sm">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Título do Vídeo
            </label>
            <Input
              id="name"
              name="name"
              value={metadata.name}
              onChange={handleMetadataChange}
              placeholder="Digite o título do vídeo"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <Textarea
              id="description"
              name="description"
              value={metadata.description}
              onChange={handleMetadataChange}
              placeholder="Digite uma descrição para o vídeo (opcional)"
              rows={3}
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center">
                {progress.toFixed(0)}% concluído
              </p>
            </div>
          )}

          {videoId && progress === 100 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-green-700 text-sm">
                Upload concluído com sucesso! ID do vídeo: {videoId}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            {videoId && progress === 100 ? "Fechar" : "Cancelar"}
          </Button>

          <Button
            type="button"
            onClick={handleUpload}
            disabled={
              !file || uploading || (videoId !== null && progress === 100)
            }
          >
            {uploading ? (
              <>Enviando...</>
            ) : videoId && progress === 100 ? (
              <>Concluído</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Enviar para Vimeo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
