// src/components/lessons/vimeo-lesson-player.tsx
"use client";

import { useEffect, useRef, useState } from "react";

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
  const lastTimeRef = useRef<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Validar o ID do vídeo
  const isValidVimeoId = (id: string) => /^\d+$/.test(id);
  const isValidId = videoId && isValidVimeoId(videoId);

  // Construir URL do iframe com parâmetros específicos:
  // - playbar=1: Mostra a barra de progresso
  // - background=0: Não ativa o modo background (que retira controles)
  // - controls=0: Desativa controles interativos
  // - keyboard=0: Desativa controles de teclado
  // - quality=auto: Melhor qualidade disponível
  // - speed=0: Desativa controles de velocidade
  // Importante: a opção 'controls' aqui se refere aos botões de controle, não à barra de progresso

  const iframeSrc = isValidId
    ? `https://player.vimeo.com/video/${videoId}?byline=0&title=0&portrait=0&transparent=0&autopause=0&playbar=1&background=0&controls=0&keyboard=0&quality=auto&speed=0&dnt=1&color=0066ff`
    : "";

  useEffect(() => {
    if (!isValidId) {
      setError(`ID de vídeo inválido: ${videoId}`);
      return;
    }

    // Configuração do listener para mensagens do iframe
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("vimeo.com")) return;

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        // Detectar eventos do player
        if (
          data.event === "timeupdate" &&
          data.data &&
          data.data.seconds !== undefined
        ) {
          const newTime = data.data.seconds;
          setCurrentTime(newTime);

          // Se o usuário tentar pular para frente (mais de 5 segundos)
          if (newTime > lastTimeRef.current + 5) {
            // Encontrar o iframe
            const iframe = document.getElementById(
              `vimeo_player_${videoId}`
            ) as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
              // Enviar mensagem para voltar ao último ponto válido
              iframe.contentWindow.postMessage(
                {
                  method: "setCurrentTime",
                  value: lastTimeRef.current,
                },
                "*"
              );
            }
          } else {
            // Progresso normal
            lastTimeRef.current = newTime;

            // Informar o progresso, se um callback foi fornecido
            if (onProgress) {
              onProgress(data.data.percent * 100);
            }
          }
        }

        // Evento de vídeo finalizado
        if (data.event === "ended" && onComplete) {
          onComplete();
        }
      } catch (e) {
        // Ignora mensagens que não são JSON válido
      }
    };

    window.addEventListener("message", handleMessage);

    // Limpar evento quando componente for desmontado
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [videoId, onComplete, onProgress, isValidId]);

  // Função para retroceder 5 segundos
  const handleRewind = () => {
    const iframe = document.getElementById(
      `vimeo_player_${videoId}`
    ) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      const newTime = Math.max(0, currentTime - 5);
      iframe.contentWindow.postMessage(
        {
          method: "setCurrentTime",
          value: newTime,
        },
        "*"
      );
    }
  };

  if (!isValidId) {
    return (
      <div
        className={`aspect-video bg-gray-800 flex items-center justify-center text-white ${className}`}
      >
        <p>{error || `ID de vídeo inválido: ${videoId}`}</p>
      </div>
    );
  }

  return (
    <div className={`aspect-video ${className} relative group`}>
      <iframe
        id={`vimeo_player_${videoId}`}
        src={iframeSrc}
        className="w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo Video Player"
      ></iframe>

      {/* Botão personalizado para retroceder 5 segundos */}
      <button
        className="absolute bottom-14 left-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity z-10 opacity-0 group-hover:opacity-100"
        onClick={handleRewind}
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

      {/* Botões de controle personalizados (opcional) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
          onClick={() => {
            const iframe = document.getElementById(
              `vimeo_player_${videoId}`
            ) as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({ method: "play" }, "*");
            }
          }}
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
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
        <button
          className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
          onClick={() => {
            const iframe = document.getElementById(
              `vimeo_player_${videoId}`
            ) as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({ method: "pause" }, "*");
            }
          }}
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
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
      </div>
    </div>
  );
}
