// src/components/video/video-player.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { VimeoLessonPlayer } from "@/components/lessons/vimeo-lesson-player";
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
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(0);

  const handleVideoProgress = useCallback(async () => {
    try {
      console.log("Marcando aula como completa:", lessonId);
      
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

      if (onComplete) {
        onComplete(lessonId);
      }
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  }, [lessonId, courseId, onComplete]);

  useEffect(() => {
    // Resetar o estado de carregamento quando mudar o vídeo
    setLoading(true);
    
    // Simular um tempo de carregamento curto
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [publicId]);

  if (!publicId) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Nenhum vídeo disponível</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
      <VimeoLessonPlayer 
        videoId={publicId}
        onComplete={handleVideoProgress}
        onProgress={(progress) => {
          // Opcional: você pode usar este callback para rastrear o progresso
          console.log(`Progresso do vídeo: ${progress.toFixed(2)}%`);
        }}
      />
    </div>
  );
}