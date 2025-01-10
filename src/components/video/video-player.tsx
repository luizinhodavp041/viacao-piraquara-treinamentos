"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface VideoPlayerProps {
  publicId: string;
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
  const playerRef = useRef<any>(null);
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

  const rewindFiveSeconds = useCallback(() => {
    if (playerRef.current?.getCurrentTime) {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = Math.max(0, currentTime - 5);
      playerRef.current.seekTo(newTime);
      lastTimeRef.current = newTime;
    }
  }, []);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const setupPlayer = () => {
      playerRef.current = new window.YT.Player(`youtube-player-${publicId}`, {
        videoId: publicId,
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 0,
          controls: 1,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleVideoProgress();
            }
            if (event.data === window.YT.PlayerState.PLAYING) {
              const currentTime = event.target.getCurrentTime();
              if (currentTime > lastTimeRef.current + 0.5) {
                event.target.seekTo(lastTimeRef.current);
              } else {
                lastTimeRef.current = currentTime;
              }
            }
          },
        },
      });
    };

    if (window.YT) {
      setupPlayer();
    } else {
      window.onYouTubeIframeAPIReady = setupPlayer;
    }

    const setupCustomControls = () => {
      const container = document.getElementById(
        `youtube-player-${publicId}`
      )?.parentElement;
      if (container) {
        const rewindButton = document.createElement("button");
        rewindButton.className = "rewind-button";
        rewindButton.innerHTML = "↺ 5s";
        rewindButton.onclick = rewindFiveSeconds;
        container.appendChild(rewindButton);
      }
    };

    setTimeout(setupCustomControls, 1000);

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
      <div id={`youtube-player-${publicId}`} className="w-full h-full" />
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

        /* Esconder a timeline do YouTube */
        .ytp-chrome-bottom {
          display: none !important;
        }
        .ytp-progress-bar-container {
          display: none !important;
        }
        .ytp-time-display {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
