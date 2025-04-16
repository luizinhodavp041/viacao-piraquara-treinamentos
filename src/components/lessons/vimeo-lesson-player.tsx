"use client";

import { useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";

interface VimeoLessonPlayerProps {
  videoId: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  autoplay?: boolean;
  className?: string;
}

export function VimeoLessonPlayer({
  videoId,
  onProgress,
  onComplete,
  autoplay = false,
  className = "",
}: VimeoLessonPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!playerRef.current) return;

    // Limpar player existente se houver
    if (player) {
      player.destroy();
    }

    setIsLoading(true);

    try {
      // Determinar se estamos usando ID numérico ou URL
      const isNumericId = !isNaN(Number(videoId));

      // Criar opções do player baseado no tipo de ID
      const playerOptions: any = {
        autopause: false,
        autoplay,
        loop: false,
        muted: false,
        controls: true,
        responsive: true,
        playsinline: true,
        quality: "auto",
        speed: true,
        title: false,
        byline: false,
        portrait: false,
        color: "#3b82f6", // Cor azul do Tailwind
      };

      // Configurar o ID ou URL conforme o tipo
      if (isNumericId) {
        // Se for numérico, convertemos para number e usamos "id"
        playerOptions.id = Number(videoId);
      } else {
        // Se não for numérico, tratamos como URL
        playerOptions.url = videoId;
      }

      // Criar player com as opções
      const vimeoPlayer = new Player(playerRef.current, playerOptions);

      // Configurar eventos
      vimeoPlayer
        .ready()
        .then(() => {
          setPlayer(vimeoPlayer);
          setIsLoading(false);
        })
        .catch((err: Error) => {
          console.error("Erro ao carregar o vídeo:", err);
          setError("Não foi possível carregar o vídeo.");
          setIsLoading(false);
        });

      // Event listeners para tracking de progresso
      vimeoPlayer.on("timeupdate", function (data: { percent: number }) {
        if (onProgress) {
          onProgress(data.percent * 100);
        }
      });

      vimeoPlayer.on("ended", function () {
        if (onComplete) {
          onComplete();
        }
      });

      // Função de limpeza
      return () => {
        vimeoPlayer.off("play");
        vimeoPlayer.off("timeupdate");
        vimeoPlayer.off("ended");
        vimeoPlayer.destroy();
      };
    } catch (err) {
      console.error("Erro ao inicializar o player:", err);
      setError("Falha ao inicializar o player de vídeo.");
      setIsLoading(false);
      return undefined;
    }
  }, [videoId, autoplay, onProgress, onComplete]);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`vimeo-lesson-player relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      )}
      <div
        ref={playerRef}
        className="vimeo-player-container aspect-video w-full"
      />
    </div>
  );
}
