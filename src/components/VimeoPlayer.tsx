// components/VimeoPlayer.tsx

import React, { useRef, useEffect, useState } from "react";
import Player from "@vimeo/player";

interface VimeoPlayerProps {
  videoId: string;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  responsive?: boolean;
  playbackRateControls?: boolean;
  color?: string; // Cor dos elementos de controle
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onProgress?: (data: {
    seconds: number;
    percent: number;
    duration: number;
  }) => void;
  onTimeUpdate?: (data: {
    seconds: number;
    percent: number;
    duration: number;
  }) => void;
  className?: string;
}

export default function VimeoPlayer({
  videoId,
  width = "100%",
  height = "auto",
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  responsive = true,
  playbackRateControls = true,
  color = "#00adef", // Cor padrão do Vimeo
  onReady,
  onPlay,
  onPause,
  onEnd,
  onProgress,
  onTimeUpdate,
  className,
}: VimeoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Certifique-se de que o elemento DOM existe
    if (!playerRef.current) return;

    // Limpar player existente se houver
    if (player) {
      player.destroy();
    }

    try {
      // Determinar se estamos usando ID numérico ou URL
      const isNumericId = !isNaN(Number(videoId));

      // Criar opções do player baseado no tipo de ID
      const playerOptions: any = {
        autopause: false,
        autoplay,
        loop,
        muted,
        controls,
        responsive,
        playsinline: true,
        quality: "auto",
        speed: playbackRateControls,
        title: false,
        byline: false,
        portrait: false,
        color,
      };

      // Adicionar largura e altura se forem fornecidas
      if (width !== "auto" && width !== undefined) {
        playerOptions.width = width;
      }

      if (height !== "auto" && height !== undefined) {
        playerOptions.height = height;
      }

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
          onReady && onReady();
        })
        .catch((err: Error) => {
          console.error("Erro ao carregar o vídeo:", err);
          setError("Não foi possível carregar o vídeo.");
        });

      // Adicionar event listeners
      if (onPlay) vimeoPlayer.on("play", onPlay);
      if (onPause) vimeoPlayer.on("pause", onPause);
      if (onEnd) vimeoPlayer.on("ended", onEnd);
      if (onProgress) vimeoPlayer.on("progress", onProgress);
      if (onTimeUpdate) vimeoPlayer.on("timeupdate", onTimeUpdate);

      // Função de limpeza
      return () => {
        vimeoPlayer.off("play");
        vimeoPlayer.off("pause");
        vimeoPlayer.off("ended");
        vimeoPlayer.off("progress");
        vimeoPlayer.off("timeupdate");
        vimeoPlayer.destroy();
      };
    } catch (err) {
      console.error("Erro ao inicializar o player:", err);
      setError("Falha ao inicializar o player de vídeo.");
      return undefined;
    }
  }, [videoId]);

  // Permitir atualização de configurações
  useEffect(() => {
    if (!player) return;

    // Atualizar configurações se o player já estiver criado
    // Observe que nem todas as configurações podem ser alteradas após a inicialização
    player.setColor(color);
    player.setLoop(loop);
    player.setVolume(muted ? 0 : 1);
  }, [player, color, loop, muted]);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`vimeo-player-container relative ${className || ""}`}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
    >
      <div
        ref={playerRef}
        className="vimeo-player"
        style={{ paddingBottom: height === "auto" ? "56.25%" : "0" }}
      />
    </div>
  );
}
