// src/components/EnhancedVideoPlayer.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { formatTime, extractVimeoId } from "@/lib/utils";

interface EnhancedVideoPlayerProps {
  videoId: string;
  title?: string;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  className?: string;
  autoplay?: boolean;
  primaryColor?: string;
  logo?: string;
  chapters?: { time: number; title: string }[];
  disableSkipping?: boolean; // Nova prop para impedir que o usuário pule partes do vídeo
}

export default function EnhancedVideoPlayer({
  videoId,
  title,
  onComplete,
  onProgress,
  className = "",
  autoplay = false,
  primaryColor = "#3b82f6", // azul padrão
  logo,
  chapters = [],
  disableSkipping = false, // Por padrão, permitir avançar
}: EnhancedVideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showPlaybackOptions, setShowPlaybackOptions] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [furthestWatchedTime, setFurthestWatchedTime] = useState(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Processar o ID do vídeo
  const processedVideoId = extractVimeoId(videoId);

  // Formatar CSS para usar a cor primária escolhida
  const primaryColorStyle = {
    "--primary-color": primaryColor,
  } as React.CSSProperties;

  // Buscar dados do vídeo da API
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
        setFurthestWatchedTime(0);

        // Definir thumbnail temporário (pode ser substituído pelos dados da API)
        setThumbnailUrl(`https://vumbnail.com/${processedVideoId}.jpg`);

        const response = await fetch(`/api/videos/${processedVideoId}`);

        if (!response.ok) {
          throw new Error(`Erro ao buscar vídeo: ${response.status}`);
        }

        const data = await response.json();

        // Atualizar thumbnail
        if (data.pictures?.sizes && data.pictures.sizes.length > 0) {
          const sortedSizes = [...data.pictures.sizes].sort(
            (a, b) => b.width - a.width
          );
          setThumbnailUrl(sortedSizes[0].link);
        }

        // Obter melhor qualidade de vídeo disponível
        if (data.files && data.files.length > 0) {
          const progressiveFiles = data.files.filter(
            (file: any) => file.type && file.type.includes("mp4")
          );

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

  // Controlar visibilidade dos controles
  const hideControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Configurar eventos do mouse para mostrar/ocultar controles
  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container) return;

    const handleMouseMove = () => {
      setShowControls(true);
      hideControlsTimer();
    };

    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [hideControlsTimer, isPlaying]);

  // Configurar eventos de teclado - desativados se disableSkipping for true
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlayPause();
          break;
        case "arrowright":
          if (!disableSkipping) {
            e.preventDefault();
            seekForward();
          }
          break;
        case "arrowleft":
          if (!disableSkipping) {
            e.preventDefault();
            seekBackward();
          }
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((prev) => Math.min(1, prev + 0.1));
          if (videoRef.current)
            videoRef.current.volume = Math.min(1, volume + 0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
          if (videoRef.current)
            videoRef.current.volume = Math.max(0, volume - 0.1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [volume, disableSkipping]);

  // Configurar eventos do player de vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setIsPlaying(!video.paused);

      // Atualizar o tempo mais distante assistido
      if (video.currentTime > furthestWatchedTime) {
        setFurthestWatchedTime(video.currentTime);
      }

      if (video.duration) {
        const newProgress = (video.currentTime / video.duration) * 100;
        setProgress(newProgress);

        if (onProgress) {
          onProgress(newProgress);
        }

        // Marcar como concluído ao atingir 95%
        if (newProgress >= 95 && !completedRef.current) {
          completedRef.current = true;
          if (onComplete) {
            onComplete();
          }
        }
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      video.volume = volume;

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
      hideControlsTimer();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    // Impedir que o usuário pule para uma posição que não assistiu
    const handleSeeking = () => {
      if (disableSkipping && video.currentTime > furthestWatchedTime + 1) {
        video.currentTime = furthestWatchedTime;
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    // Adicionar event listener para seeking se disableSkipping estiver ativado
    if (disableSkipping) {
      video.addEventListener("seeking", handleSeeking);
    }

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);

      if (disableSkipping) {
        video.removeEventListener("seeking", handleSeeking);
      }
    };
  }, [
    onComplete,
    onProgress,
    autoplay,
    volume,
    hideControlsTimer,
    disableSkipping,
    furthestWatchedTime,
  ]);

  // Funções de controle
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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Erro ao entrar em tela cheia: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Detectar mudanças no modo de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Função para manipular cliques na barra de progresso
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableSkipping) {
      // Se disableSkipping estiver ativado, apenas permitir retroceder até o início
      // ou avançar até onde já foi assistido
      const progressBar = progressBarRef.current;
      const video = videoRef.current;
      if (!progressBar || !video) return;

      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const targetTime = pos * video.duration;

      // Só permitir ir até o ponto mais distante já assistido
      if (targetTime <= furthestWatchedTime) {
        video.currentTime = targetTime;
      } else {
        // Mostrar feedback visual (opcional)
        showSkippingWarning();
      }
    } else {
      // Comportamento normal - permitir pular para qualquer ponto
      const progressBar = progressBarRef.current;
      const video = videoRef.current;
      if (!progressBar || !video) return;

      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    }
  };

  // Funções para avançar e retroceder com restrições
  const seekForward = () => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = video.currentTime + 10;

    if (!disableSkipping || newTime <= furthestWatchedTime) {
      video.currentTime = Math.min(video.duration, newTime);
    } else {
      showSkippingWarning();
    }
  };

  const seekBackward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  // Mostrar aviso que não é possível pular
  const [showWarning, setShowWarning] = useState(false);

  const showSkippingWarning = () => {
    setShowWarning(true);
    setTimeout(() => {
      setShowWarning(false);
    }, 1500);
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowPlaybackOptions(false);
  };

  const goToChapter = (time: number) => {
    if (videoRef.current) {
      if (!disableSkipping || time <= furthestWatchedTime) {
        videoRef.current.currentTime = time;
      } else {
        showSkippingWarning();
      }
    }
    setShowChapters(false);
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

  // Renderizar o player completo
  return (
    <div
      className={`video-player w-full ${className}`}
      style={primaryColorStyle}
    >
      {title && <h3 className="font-medium text-lg mb-2">{title}</h3>}

      <div
        ref={videoContainerRef}
        className="relative group bg-black overflow-hidden rounded-lg"
      >
        {/* Vídeo */}
        <video
          ref={videoRef}
          className="w-full aspect-video"
          playsInline
          preload="metadata"
          poster={thumbnailUrl || undefined}
          onClick={togglePlayPause}
        >
          <source src={videoUrl} type="video/mp4" />
          Seu navegador não suporta reprodução de vídeos.
        </video>

        {/* Overlay de buffer */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
        )}

        {/* Logo */}
        {logo && (
          <div className="absolute top-4 right-4 z-10 opacity-70">
            <img src={logo} alt="Logo" className="h-8" />
          </div>
        )}

        {/* Aviso de que não é possível pular */}
        {showWarning && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-3 rounded-lg z-20 text-center">
            <p>Não é possível avançar além do conteúdo já assistido</p>
          </div>
        )}

        {/* Controles */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Barra de progresso */}
          <div
            ref={progressBarRef}
            className={`relative w-full h-1 bg-white/30 rounded-full mb-4 group ${
              disableSkipping ? "" : "cursor-pointer"
            }`}
            onClick={handleProgressBarClick}
          >
            {/* Progresso atual */}
            <div
              className="absolute top-0 left-0 h-full bg-[var(--primary-color)] rounded-full transition-all duration-100"
              style={{ width: `${Math.min(100, progress)}%` }}
            ></div>

            {/* Área já assistida (se estiver usando restrição) */}
            {disableSkipping && (
              <div
                className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (furthestWatchedTime / duration) * 100
                  )}%`,
                }}
              ></div>
            )}

            {/* Marcadores de capítulos */}
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className="absolute top-0 h-full w-1 bg-white"
                style={{
                  left: `${(chapter.time / duration) * 100}%`,
                }}
                title={chapter.title}
              ></div>
            ))}

            {/* Bolinha indicadora de progresso */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white transform scale-0 group-hover:scale-100 transition-transform"
              style={{ left: `calc(${progress}% - 6px)` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Botão play/pause */}
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-[var(--primary-color)] transition-colors"
                aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="5 3 19 12 5 21"></polygon>
                  </svg>
                )}
              </button>

              {/* Retroceder 10s - sempre permitido */}
              <button
                onClick={seekBackward}
                className="text-white hover:text-[var(--primary-color)] transition-colors"
                aria-label="Retroceder 10 segundos"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 4v6h6"></path>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  <text
                    x="10"
                    y="16"
                    fontSize="9"
                    fill="currentColor"
                    stroke="none"
                  >
                    10
                  </text>
                </svg>
              </button>

              {/* Avançar 10s - desabilitado se estiver usando restrição e ainda não assistiu */}
              <button
                onClick={seekForward}
                className={`text-white hover:text-[var(--primary-color)] transition-colors ${
                  disableSkipping && furthestWatchedTime < duration
                    ? "opacity-50"
                    : ""
                }`}
                aria-label="Avançar 10 segundos"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 4v6h-6"></path>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  <text
                    x="10"
                    y="16"
                    fontSize="9"
                    fill="currentColor"
                    stroke="none"
                  >
                    10
                  </text>
                </svg>
              </button>

              {/* Controle de volume */}
              <div className="relative flex items-center">
                <button
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className="text-white hover:text-[var(--primary-color)] transition-colors"
                  aria-label={isMuted ? "Ativar som" : "Silenciar"}
                >
                  {isMuted || volume === 0 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                      <path d="M9 9v6a6 6 0 0 0 .29-6.27"></path>
                      <path d="M16.5 16.5A10.5 10.5 0 0 0 21 6.34"></path>
                      <path d="M12 6v2m0 12v-2"></path>
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
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
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                  )}
                </button>

                {/* Slider de volume */}
                <div
                  className={`absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-800 p-2 rounded-lg transition-opacity duration-200 ${
                    showVolumeSlider
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="appearance-none w-24 h-1 bg-white/30 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
              </div>

              {/* Tempo */}
              <div className="text-white text-sm">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Seletor de velocidade */}
              <div className="relative">
                <button
                  onClick={() => setShowPlaybackOptions(!showPlaybackOptions)}
                  className="text-white hover:text-[var(--primary-color)] transition-colors text-sm px-2 py-1 rounded"
                  aria-label="Velocidade de reprodução"
                >
                  {playbackRate}x
                </button>

                {/* Menu de velocidades */}
                {showPlaybackOptions && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded overflow-hidden">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`block w-full text-left px-4 py-1 text-sm ${
                          playbackRate === rate
                            ? "bg-[var(--primary-color)] text-white"
                            : "text-white hover:bg-gray-700"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão de capítulos */}
              {chapters.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowChapters(!showChapters)}
                    className="text-white hover:text-[var(--primary-color)] transition-colors"
                    aria-label="Capítulos"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </button>

                  {/* Menu de capítulos */}
                  {showChapters && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded overflow-hidden max-h-60 overflow-y-auto">
                      {chapters.map((chapter, index) => (
                        <button
                          key={index}
                          onClick={() => goToChapter(chapter.time)}
                          className={`block w-full text-left px-4 py-2 text-sm border-b border-gray-700 ${
                            currentTime >= chapter.time &&
                            (index === chapters.length - 1 ||
                              currentTime < chapters[index + 1].time)
                              ? "bg-[var(--primary-color)] text-white"
                              : "text-white hover:bg-gray-700"
                          } ${
                            disableSkipping &&
                            chapter.time > furthestWatchedTime
                              ? "opacity-50"
                              : ""
                          }`}
                          disabled={
                            disableSkipping &&
                            chapter.time > furthestWatchedTime
                          }
                        >
                          <div className="flex items-center">
                            <span className="mr-2">
                              {formatTime(chapter.time)}
                            </span>
                            <span>{chapter.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tela cheia */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-[var(--primary-color)] transition-colors"
                aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              >
                {isFullscreen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                    <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
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
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                    <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Ícone grande de play no centro quando pausado */}
        {!isPlaying && !isBuffering && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlayPause}
          >
            <div className="rounded-full bg-black/30 p-6 backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="white"
              >
                <polygon points="5 3 19 12 5 21"></polygon>
              </svg>
            </div>
          </div>
        )}

        {/* Mostra qual área do vídeo já foi assistida (opcional) */}
        {disableSkipping && (
          <div className="absolute top-0 left-0 right-0 p-1 bg-black/70 text-xs text-white text-center">
            {/* {Math.round((furthestWatchedTime / duration) * 100)}% assistido -
            Não é possível avançar além do conteúdo assistido */}
          </div>
        )}

        {/* Overlay de instruções para controles de teclado ao iniciar */}
        {!isPlaying && !loading && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs p-2 rounded pointer-events-none opacity-70">
            Espaço: Play/Pause | {!disableSkipping ? "←→: ±10s | " : ""}M: Mudo
            | F: Tela cheia
          </div>
        )}
      </div>
    </div>
  );
}
