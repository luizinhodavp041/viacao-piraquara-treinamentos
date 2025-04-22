// src/components/lessons/vimeo-lesson-player.tsx
"use client";

import { useEffect, useRef } from "react";

interface VimeoLessonPlayerProps {
  videoId: string;
  className?: string;
  onComplete?: () => void;
}

export function VimeoLessonPlayer({
  videoId,
  className = "",
  onComplete,
}: VimeoLessonPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Evento de mensagem para escutar eventos do iframe
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("vimeo.com")) return;

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data.event === "ended" && onComplete) {
          onComplete();
        }
      } catch (e) {
        // Ignora mensagens que não são JSON
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onComplete]);

  if (!videoId) {
    return (
      <div
        className={`aspect-video bg-gray-800 flex items-center justify-center text-white ${className}`}
      >
        <p>ID de vídeo não fornecido</p>
      </div>
    );
  }

  // URL do iframe com parâmetros para mensagens de API
  const iframeSrc = `https://player.vimeo.com/video/${videoId}?byline=0&title=0&portrait=0&transparent=0&autopause=0&api=1&player_id=vimeo_player_${videoId}`;

  return (
    <div className={`aspect-video ${className}`}>
      <iframe
        ref={iframeRef}
        id={`vimeo_player_${videoId}`}
        src={iframeSrc}
        className="w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo Video Player"
      ></iframe>
    </div>
  );
}
