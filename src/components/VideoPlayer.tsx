// src/components/VideoPlayer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { formatTime, extractVimeoId, getVimeoThumbnail } from "@/lib/utils";

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  className?: string;
  autoplay?: boolean;
}

export default function VideoPlayer({
  videoId,
  title,
  onComplete,
  onProgress,
  className = "",
  autoplay = false,
}: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Processar o ID do vídeo
  const processedVideoId = extractVimeoId(videoId);

  // Buscar dados do vídeo da nossa API
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!processedVideoId) {
        setError("ID de vídeo inválido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        completedRef.current = false;

        // Definir thumbnail usando o serviço vumbnail
        setThumbnailUrl(getVimeoThumbnail(processedVideoId));

        const response = await fetch(`/api/videos/${processedVideoId}`);

        if (!response.ok) {
          throw new Error(`Erro ao buscar vídeo: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dados do vídeo recebidos:", data);

        // Atualizar thumbnail se disponível da API
        if (
          data.pictures &&
          data.pictures.sizes &&
          data.pictures.sizes.length > 0
        ) {
          // Escolher a maior imagem para thumbnail
          const sortedSizes = [...data.pictures.sizes].sort(
            (a, b) => b.width - a.width
          );
          setThumbnailUrl(sortedSizes[0].link);
        }

        // Encontrar a melhor qualidade de vídeo disponível
        if (data.files && data.files.length > 0) {
          // Organizar os arquivos de vídeo por qualidade
          const progressiveFiles = data.files.filter(
            (file: any) => file.type && file.type.includes("mp4")
          );

          // Ordenar por qualidade (os valores comuns são: "hd", "sd", "mobile")
          const sortedFiles = progressiveFiles.sort((a: any, b: any) => {
            const qualityOrder: { [key: string]: number } = {
              hd: 1,
              sd: 2,
              mobile: 3,
            };
            const aQuality =
              a.quality in qualityOrder ? qualityOrder[a.quality] : 99;
            const bQuality =
              b.quality in qualityOrder ? qualityOrder[b.quality] : 99;
            return aQuality - bQuality;
          });

          if (sortedFiles.length > 0) {
            setVideoUrl(sortedFiles[0].link);
          } else {
            throw new Error("Nenhum formato de vídeo compatível encontrado");
          }
        } else {
          throw new Error("Nenhum arquivo de vídeo disponível");
        }
      } catch (err: any) {
        setError(err.message || "Falha ao carregar o vídeo");
        console.error("Erro ao carregar vídeo:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [processedVideoId]);

  // Configurar eventos do player de vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setIsPlaying(!video.paused);

      if (video.duration) {
        const newProgress = (video.currentTime / video.duration) * 100;
        setProgress(newProgress);

        // Evitar chamadas excessivas ao onProgress usando debounce
        if (progressUpdateTimeoutRef.current) {
          clearTimeout(progressUpdateTimeoutRef.current);
        }

        progressUpdateTimeoutRef.current = setTimeout(() => {
          if (onProgress) {
            onProgress(newProgress);
          }
        }, 300);

        // Marcar como concluído ao atingir 95%
        if (newProgress >= 95 && !completedRef.current) {
          completedRef.current = true;
          if (onComplete) {
            onComplete();
          }
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);

      // Se autoplay estiver habilitado, iniciar o vídeo
      if (autoplay) {
        video.play().catch((err) => {
          console.warn(
            "Não foi possível iniciar o vídeo automaticamente:",
            err
          );
        });
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!completedRef.current && onComplete) {
        completedRef.current = true;
        onComplete();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }

      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [onComplete, onProgress, autoplay]);

  // Função para retroceder 5 segundos
  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        videoRef.current.currentTime - 5
      );
    }
  };

  // Função para avançar 5 segundos
  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 5
      );
    }
  };

  // Função para alternar reprodução/pausa
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch((err) => {
        console.error("Erro ao iniciar vídeo:", err);
      });
    } else {
      video.pause();
    }
  };

  // Exibir loader enquanto carrega
  if (loading) {
    return (
      <div
        className={`aspect-video bg-gray-900 flex items-center justify-center text-white ${className}`}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-2"></div>
          <p>Carregando vídeo...</p>
        </div>
      </div>
    );
  }

  // Exibir erro se ocorrer
  if (error) {
    return (
      <div
        className={`aspect-video bg-red-100 flex items-center justify-center text-red-600 ${className}`}
      >
        <p className="p-4 text-center">{error}</p>
      </div>
    );
  }

  // Exibir mensagem se não houver URL
  if (!videoUrl) {
    return (
      <div
        className={`aspect-video bg-gray-800 flex items-center justify-center text-white ${className}`}
      >
        <p>Não foi possível carregar o vídeo</p>
      </div>
    );
  }

  return (
    <div className={`video-player w-full ${className}`}>
      {title && <h3 className="font-medium text-lg mb-2">{title}</h3>}

      <div className="relative group">
        <video
          ref={videoRef}
          className="w-full aspect-video bg-black"
          controls
          playsInline
          preload="metadata"
          poster={thumbnailUrl || undefined}
        >
          <source src={videoUrl} type="video/mp4" />
          Seu navegador não suporta reprodução de vídeos.
        </video>

        {/* Controles personalizados */}
        <div className="absolute bottom-16 left-0 right-0 flex justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleRewind}
            className="bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
            aria-label="Retroceder 5 segundos"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              <text x="9" y="15" fontSize="8" fill="currentColor">
                5s
              </text>
            </svg>
          </button>

          <button
            onClick={togglePlayPause}
            className="bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
            type="button"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          <button
            onClick={handleForward}
            className="bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
            aria-label="Avançar 5 segundos"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              <text x="10" y="15" fontSize="8" fill="currentColor">
                5s
              </text>
            </svg>
          </button>
        </div>
      </div>

      {/* Barra de progresso personalizada */}
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${Math.min(100, progress)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
