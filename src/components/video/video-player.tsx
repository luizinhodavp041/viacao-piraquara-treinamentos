"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Player from "@vimeo/player";

interface VideoPlayerProps {
  publicId: string; // ID do vídeo do Vimeo (será convertido para número)
  title: string;
  lessonId: string;
  courseId: string;
  onComplete?: (lessonId: string) => void;
}

export function VideoPlayer({
  publicId,
  title,
  lessonId,
  courseId,
  onComplete,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const lastTimeRef = useRef<number>(0);

  const handleVideoProgress = useCallback(async () => {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          courseId,
          completed: true,
        }),
      });

      onComplete?.(lessonId);
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  }, [lessonId, courseId, onComplete]);

  const rewindFiveSeconds = useCallback(async () => {
    if (playerRef.current) {
      const currentTime = await playerRef.current.getCurrentTime();
      const newTime = Math.max(0, currentTime - 5);
      playerRef.current.setCurrentTime(newTime);
      lastTimeRef.current = newTime;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inicializar o player do Vimeo
    playerRef.current = new Player(containerRef.current, {
      id: parseInt(publicId, 10),
      width: 640,
      height: 360,
      controls: true,
      responsive: true,
      autoplay: false,
      maxwidth: 900,
      pip: false,
      dnt: true, // Do Not Track
    });

    // Configurar eventos do player
    playerRef.current.on("ended", handleVideoProgress);

    playerRef.current.on("timeupdate", ({ seconds }: { seconds: number }) => {
      if (seconds > lastTimeRef.current + 0.5) {
        playerRef.current?.setCurrentTime(lastTimeRef.current);
      } else {
        lastTimeRef.current = seconds;
      }
    });

    // Adicionar botão de retroceder
    const setupCustomControls = () => {
      const container = containerRef.current;
      if (container) {
        const rewindButton = document.createElement("button");
        rewindButton.className = "rewind-button";
        rewindButton.innerHTML = "↺ 5s";
        rewindButton.onclick = rewindFiveSeconds;
        container.appendChild(rewindButton);
      }
    };

    setTimeout(setupCustomControls, 1000);

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      const rewindButton = document.querySelector(".rewind-button");
      if (rewindButton) {
        rewindButton.remove();
      }
    };
  }, [publicId, handleVideoProgress, rewindFiveSeconds]);

  if (!publicId) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Nenhum vídeo disponível</p>
      </div>
    );
  }

  return (
    <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
      <div ref={containerRef} className="w-full h-full" />
      <style jsx global>{`
        .rewind-button {
          position: absolute;
          bottom: 70px;
          left: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          z-index: 1000;
          font-size: 14px;
          transition: background 0.2s;
        }

        .rewind-button:hover {
          background: rgba(0, 0, 0, 0.9);
        }
      `}</style>
    </div>
  );
}
