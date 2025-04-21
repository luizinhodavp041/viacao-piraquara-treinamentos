// src/components/lessons/vimeo-lesson-player.tsx
"use client";

import { useEffect, useRef } from "react";
import Player from "@vimeo/player";

interface VimeoLessonPlayerProps {
  videoId: string;
  className?: string;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

export function VimeoLessonPlayer({
  videoId,
  className = "",
  onComplete,
  onProgress,
}: VimeoLessonPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!containerRef.current || !videoId) return;

    // Limpar player anterior se existir
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    try {
      console.log("Inicializando Vimeo player com ID:", videoId);
      
      // Inicializar o player do Vimeo
      playerRef.current = new Player(containerRef.current, {
        id: parseInt(videoId, 10),
        // Remover width e height para usar valor padrão responsivo
        // O player usará o tamanho do elemento container
        responsive: true,
        autoplay: false,
        pip: true,
        dnt: true, // Do Not Track
      });

      // Configurar eventos do player
      if (onComplete) {
        playerRef.current.on("ended", onComplete);
      }

      if (onProgress) {
        playerRef.current.on("timeupdate", ({ percent }: { percent: number }) => {
          onProgress(percent * 100);
        });
      }

      // Força um resize para garantir que o player seja renderizado corretamente
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    } catch (error) {
      console.error("Erro ao inicializar o player do Vimeo:", error);
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.off("ended");
        playerRef.current.off("timeupdate");
        playerRef.current.destroy();
      }
    };
  }, [videoId, onComplete, onProgress]);

  return (
    <div className={`aspect-video bg-black ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}