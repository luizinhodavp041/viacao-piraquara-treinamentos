import React, { useState } from "react";
import axios from "axios";
import * as tus from "tus-js-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface VideoMetadata {
  name: string;
  description: string;
}

export default function VimeoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata>({
    name: "",
    description: "",
  });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleMetadataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      // 1. Obter link de upload do nosso backend
      const { data } = await axios.post("/api/vimeo/upload-link", {
        name: metadata.name || file.name,
        description: metadata.description || "",
      });

      const uploadLink = data.uploadLink;

      // 2. Extrair o ID do vídeo do link (será necessário depois)
      const videoIdMatch = uploadLink.match(/\/videos\/(\d+)/);
      const extractedVideoId = videoIdMatch ? videoIdMatch[1] : null;

      if (extractedVideoId) {
        setVideoId(extractedVideoId);
      }

      // 3. Iniciar o upload com tus-js-client
      const upload = new tus.Upload(file, {
        endpoint: uploadLink,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: (error) => {
          console.error("Erro no upload:", error);
          setUploading(false);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          setProgress(parseFloat(percentage));
        },
        onSuccess: () => {
          setProgress(100);
          setUploading(false);
          // Aqui você pode adicionar a lógica para salvar a referência do vídeo no MongoDB
          console.log("Upload concluído! ID do vídeo:", extractedVideoId);

          // Exemplo de como você salvaria no seu banco de dados
          // await saveVideoReference({
          //   title: metadata.name,
          //   description: metadata.description,
          //   vimeoId: extractedVideoId,
          //   courseId: currentCourseId // Você precisaria ter esta informação disponível
          // });
        },
      });

      // 4. Iniciar o upload
      upload.start();
    } catch (error) {
      console.error("Erro na preparação do upload:", error);
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload de Vídeo para o Vimeo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Vídeo</label>
          <Input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Título do Vídeo
          </label>
          <Input
            name="name"
            value={metadata.name}
            onChange={handleMetadataChange}
            placeholder="Digite o título do vídeo"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <Textarea
            name="description"
            value={metadata.description}
            onChange={handleMetadataChange}
            placeholder="Digite uma descrição para o vídeo"
            disabled={uploading}
            rows={3}
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
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">
              Upload concluído com sucesso! ID do vídeo: {videoId}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? "Enviando..." : "Fazer Upload"}
        </Button>
      </CardFooter>
    </Card>
  );
}
