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
  const playerRef = useRef<Player | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Validar o ID do vídeo
  const isValidVimeoId = (id: string) => /^\d+$/.test(id);
  
  if (!videoId || !isValidVimeoId(videoId)) {
    return (
      <div className={`aspect-video bg-gray-800 flex items-center justify-center text-white ${className}`}>
        <p>ID de vídeo inválido: {videoId}</p>
      </div>
    );
  }
  
  // Construir URL do iframe com parâmetros que restringem funcionalidades
  // Desativa alguns controles e personaliza aparência
  const iframeSrc = `https://player.vimeo.com/video/${videoId}?byline=0&title=0&portrait=0&transparent=0&autopause=0&app_id=58479&dnt=1&controls=1&color=0066ff&quality=auto`;
  
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
    
    let player: Player | null = null;
    
    // Inicializar o player após o iframe ser carregado
    const handleIframeLoad = () => {
      const iframe = document.getElementById(`vimeo-player-${videoId}`) as HTMLIFrameElement;
      if (!iframe) return;
      
      try {
        // Inicializar o player
        player = new Player(iframe);
        playerRef.current = player;
        
        // Configurar eventos do player
        player.on('loaded', () => {
          console.log('Player Vimeo carregado');
          
          // Restringir a busca de tempo (seek)
          player.on('seeked', async (data: { seconds: number }) => {
            const currentTime = data.seconds;
            
            // Se o usuário tentou avançar além de 5 segundos do último ponto assistido,
            // voltar para o último ponto
            if (currentTime > lastTimeRef.current + 5) {
              console.log('Tentativa de avançar detectada, retornando ao ponto anterior');
              await player?.setCurrentTime(lastTimeRef.current);
            } else {
              // Atualizar o último tempo assistido
              lastTimeRef.current = currentTime;
            }
          });
          
          // Rastrear o progresso do vídeo
          player.on('timeupdate', async (data: { seconds: number, percent: number }) => {
            // Atualizar o último tempo assistido se estiver progredindo normalmente
            if (data.seconds > lastTimeRef.current) {
              lastTimeRef.current = data.seconds;
            }
            
            // Chamar callback de progresso, se fornecido
            if (onProgress) {
              onProgress(data.percent * 100);
            }
          });
          
          // Evento de conclusão
          if (onComplete) {
            player.on('ended', onComplete);
          }
        });
      } catch (err) {
        console.error('Erro ao inicializar o player:', err);
      }
    };
    
    // Definir um temporizador para iniciar após o iframe ser renderizado
    const timer = setTimeout(handleIframeLoad, 1000);
    
    // Cleanup ao desmontar
    return () => {
      clearTimeout(timer);
      
      if (player) {
        player.off('seeked');
        player.off('timeupdate');
        player.off('ended');
        player.off('loaded');
      }
    };
  }, [videoId, onComplete, onProgress]);

  return (
    <div className={`aspect-video ${className} relative`}>
      <iframe
        id={`vimeo-player-${videoId}`}
        src={iframeSrc}
        className="w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={`Vimeo Video ${videoId}`}
      ></iframe>
      
      {/* Opcional: Adicionar botão para retroceder 5 segundos */}
      <button 
        className="absolute bottom-14 left-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity z-10"
        onClick={() => {
          if (playerRef.current) {
            playerRef.current.getCurrentTime().then(currentTime => {
              const newTime = Math.max(0, currentTime - 5);
              playerRef.current?.setCurrentTime(newTime);
            });
          }
        }}
      >
        {/* Ícone de retroceder 5s */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 4v6h6"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          <text x="9" y="15" fontSize="8" fill="currentColor">5s</text>
        </svg>
      </button>
    </div>
  );
}