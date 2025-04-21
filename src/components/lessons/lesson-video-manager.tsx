// src/components/lessons/lesson-video-manager.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { VimeoLessonPlayer } from "./vimeo-lesson-player"; // Importar o componente criado
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoIcon, ExternalLink, RotateCcw } from "lucide-react";

interface LessonVideoManagerProps {
  lessonId: string;
  videoId: string;
  videoSource: "cloudinary" | "youtube" | "vimeo";
  onVideoUpdate?: () => void;
}

interface VimeoVideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnails: {
    width: number;
    height: number;
    link: string;
  }[];
  privacy: string;
  embedSettings: any;
  createdAt: string;
  uploadedAt: string;
}

export function LessonVideoManager({
  lessonId,
  videoId,
  videoSource,
  onVideoUpdate,
}: LessonVideoManagerProps) {
  const [videoInfo, setVideoInfo] = useState<VimeoVideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVimeoInfo = async () => {
    if (videoSource !== "vimeo" || !videoId) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Buscando informações do vídeo:", videoId);
      const response = await axios.get(
        `/api/vimeo/get-video-info?videoId=${videoId}`
      );
      setVideoInfo(response.data);
      console.log("Informações do vídeo recebidas:", response.data);
    } catch (err) {
      console.error("Erro ao carregar informações do vídeo:", err);
      setError("Não foi possível carregar informações do vídeo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoSource === "vimeo" && videoId) {
      console.log("Iniciando carregamento das informações do vídeo do Vimeo:", videoId);
      loadVimeoInfo();
    } else {
      console.log("Fonte de vídeo não é Vimeo ou ID não fornecido:", { videoSource, videoId });
    }
  }, [videoId, videoSource]);

  // Renderizar player adequado baseado na fonte do vídeo
  const renderVideoPlayer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={loadVimeoInfo}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      );
    }

    console.log("Renderizando player para:", { videoSource, videoId });

    switch (videoSource) {
      case "vimeo":
        if (!videoId) {
          return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
              <p className="text-gray-500">Nenhum vídeo disponível</p>
            </div>
          );
        }
        return (
          <VimeoLessonPlayer
            videoId={videoId}
            className="rounded-md overflow-hidden"
            onComplete={() => console.log("Vídeo concluído")}
            onProgress={(progress) => console.log("Progresso:", progress)}
          />
        );

      case "youtube":
        return (
          <div className="aspect-video">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );

      case "cloudinary":
        return (
          <div className="aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center">
            <video
              className="w-full h-full"
              controls
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${videoId}`}
            ></video>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
            <p className="text-gray-500">Nenhum vídeo disponível</p>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <VideoIcon className="mr-2 h-5 w-5" />
          Vídeo da Aula
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="player">
          <TabsList className="mb-4">
            <TabsTrigger value="player">Player</TabsTrigger>
            {videoSource === "vimeo" && videoInfo && (
              <TabsTrigger value="info">Informações</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="player" className="space-y-4">
            {renderVideoPlayer()}

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Fonte:{" "}
                {videoSource === "vimeo"
                  ? "Vimeo"
                  : videoSource === "youtube"
                  ? "YouTube"
                  : "Cloudinary"}
                {videoId && videoSource === "vimeo" && ` (ID: ${videoId})`}
              </div>

              {videoSource === "vimeo" && videoId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(`https://vimeo.com/${videoId}`, "_blank")
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir no Vimeo
                </Button>
              )}
            </div>
          </TabsContent>

          {videoSource === "vimeo" && videoInfo && (
            <TabsContent value="info" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Título</h3>
                  <p>{videoInfo.title}</p>
                </div>

                {videoInfo.description && (
                  <div>
                    <h3 className="text-sm font-medium">Descrição</h3>
                    <p className="text-sm whitespace-pre-line">
                      {videoInfo.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Duração</h3>
                    <p>{formatDuration(videoInfo.duration)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Privacidade</h3>
                    <p>
                      {videoInfo.privacy === "anybody"
                        ? "Público"
                        : "Privado"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Data de Upload</h3>
                    <p>{new Date(videoInfo.uploadedAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">ID do Vídeo</h3>
                    <p>{videoInfo.id}</p>
                  </div>
                </div>

                {videoInfo.thumbnails && videoInfo.thumbnails.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium">Miniatura</h3>
                    <img
                      src={
                        videoInfo.thumbnails[2]?.link ||
                        videoInfo.thumbnails[0].link
                      }
                      alt="Thumbnail"
                      className="mt-2 rounded-md max-w-xs"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Função auxiliar para formatar duração em segundos para formato legível
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  let result = "";

  if (hours > 0) {
    result += `${hours}h `;
  }

  if (minutes > 0 || hours > 0) {
    result += `${minutes}m `;
  }

  result += `${remainingSeconds}s`;

  return result;
}