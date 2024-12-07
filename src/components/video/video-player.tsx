"use client";

import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";
import { useEffect, useState, useRef, useCallback } from "react";

interface VideoPlayerProps {
  publicId: string;
  title: string;
  lessonId: string;
  courseId: string;
  onComplete?: (lessonId: string) => void; // Novo prop
}

export function VideoPlayer({
  publicId,
  title,
  lessonId,
  courseId,
  onComplete,
}: VideoPlayerProps) {
  const [playerKey, setPlayerKey] = useState(0);
  const playerRef = useRef<any>(null);

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

      // Chama o callback onComplete após salvar o progresso
      onComplete?.(lessonId);
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  }, [lessonId, courseId, onComplete]);

  useEffect(() => {
    setPlayerKey((prev) => prev + 1);
  }, [publicId]);

  useEffect(() => {
    // Função para configurar o player após ele estar pronto
    const setupPlayer = () => {
      const player = playerRef.current;
      if (player) {
        // Desabilita interações com a barra de progresso
        const progressControl = player.getElementsByClassName(
          "vjs-progress-control"
        )[0];
        if (progressControl) {
          progressControl.style.pointerEvents = "none";
        }

        // Remove botões de retroceder existentes antes de adicionar um novo
        const existingSkipButtons = player.getElementsByClassName("skip-back");
        while (existingSkipButtons.length > 0) {
          existingSkipButtons[0].remove();
        }

        // Adiciona botão de retroceder 5 segundos
        const skipButton = document.createElement("button");
        skipButton.className = "vjs-control vjs-button skip-back";
        skipButton.innerHTML = '<span class="vjs-icon-replay-10"></span>';
        skipButton.onclick = () => {
          const videoElement = player.getElementsByTagName("video")[0];
          if (videoElement) {
            videoElement.currentTime = Math.max(
              0,
              videoElement.currentTime - 5
            );
          }
        };

        const controlBar = player.getElementsByClassName("vjs-control-bar")[0];
        if (controlBar) {
          const playButton =
            controlBar.getElementsByClassName("vjs-play-control")[0];
          if (playButton) {
            controlBar.insertBefore(skipButton, playButton.nextSibling);
          }
        }

        // Adiciona evento para quando o vídeo terminar
        const videoElement = player.getElementsByTagName("video")[0];
        if (videoElement) {
          videoElement.addEventListener("ended", handleVideoProgress);
        }
      }
    };

    // Adiciona um pequeno delay para garantir que o player foi montado
    const timeoutId = setTimeout(setupPlayer, 1000);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      const videoElement = playerRef.current?.getElementsByTagName("video")[0];
      if (videoElement) {
        videoElement.removeEventListener("ended", handleVideoProgress);
      }
    };
  }, [playerKey, handleVideoProgress]);

  if (!publicId) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Nenhum vídeo disponível</p>
      </div>
    );
  }

  return (
    <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
      <div ref={playerRef}>
        <CldVideoPlayer
          key={playerKey}
          width="1920"
          height="1080"
          src={publicId}
          colors={{
            base: "#000000",
            text: "#ffffff",
            accent: "#4f46e5",
          }}
          autoPlay={false}
          loop={false}
          controls={true}
          transformation={{
            quality: "auto",
          }}
        />
      </div>
      <style jsx global>{`
        /* Remove cursor pointer da barra de progresso */
        .vjs-progress-control .vjs-progress-holder {
          cursor: default !important;
        }

        /* Esconde o tooltip de tempo */
        .vjs-mouse-display {
          display: none !important;
        }

        /* Esconde o handle de arraste */
        .vjs-play-progress:before {
          display: none !important;
        }

        /* Esconde controles não desejados */
        .vjs-playback-rate,
        .vjs-forward-control,
        .vjs-picture-in-picture-control {
          display: none !important;
        }

        /* Desabilita interações com a barra de progresso */
        .vjs-progress-control {
          pointer-events: none !important;
        }

        /* Estilo para o botão de retroceder */
        .skip-back {
          cursor: pointer;
          font-size: 1.5em;
          width: 3em;
        }

        .skip-back:hover {
          opacity: 0.7;
        }

        /* Ícone do botão de retroceder */
        .vjs-icon-replay-10:before {
          content: "↺";
          font-family: Arial, sans-serif;
        }

        /* Mostra o seletor de qualidade */
        .vjs-quality-selector {
          display: block !important;
        }

        /* Ajusta a ordem dos controles */
        .vjs-control-bar {
          display: flex;
          align-items: center;
        }

        .vjs-remaining-time {
          order: 1;
        }

        .vjs-volume-panel {
          order: 2;
        }

        .vjs-quality-selector {
          order: 3;
        }

        .vjs-fullscreen-control {
          order: 4;
        }
      `}</style>
    </div>
  );
}
