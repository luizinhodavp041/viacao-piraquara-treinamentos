// src/components/lessons/vimeo-lesson-player.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  
  // Usar uma abordagem mais simples e direta para evitar problemas com o DOM
  // Não manipularemos diretamente o DOM, apenas renderizaremos um iframe
  
  // Validar o ID do vídeo
  const isValidVimeoId = (id: string) => /^\d+$/.test(id);
  
  if (!videoId || !isValidVimeoId(videoId)) {
    return (
      <div className={`aspect-video bg-gray-800 flex items-center justify-center text-white ${className}`}>
        <p>ID de vídeo inválido: {videoId}</p>
      </div>
    );
  }
  
  // Construir URL do iframe com parâmetros que maximizam a compatibilidade
  const iframeSrc = `https://player.vimeo.com/video/${videoId}?byline=0&title=0&portrait=0&transparent=0&autopause=0&app_id=58479&dnt=1`;
  
  useEffect(() => {
    // Carregar script do Vimeo Player API se necessário
    const existingScript = document.getElementById('vimeo-player-api');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'vimeo-player-api';
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      document.body.appendChild(script);
    }
    
    // Monitorar eventos após o iframe ser carregado
    const handleIframeLoad = () => {
      const iframe = document.getElementById(`vimeo-player-${videoId}`);
      if (iframe && onComplete) {
        try {
          const player = new Player(iframe);
          player.on('ended', onComplete);
          
          if (onProgress) {
            player.on('timeupdate', (data: { percent: number }) => {
              onProgress(data.percent * 100);
            });
          }
        } catch (err) {
          console.error('Erro ao inicializar o player:', err);
        }
      }
    };
    
    // Definir um temporizador para iniciar após o iframe ser renderizado
    const timer = setTimeout(handleIframeLoad, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [videoId, onComplete, onProgress]);

  return (
    <div className={`aspect-video ${className}`}>
      <iframe
        id={`vimeo-player-${videoId}`}
        src={iframeSrc}
        className="w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={`Vimeo Video ${videoId}`}
      ></iframe>
    </div>
  );
}