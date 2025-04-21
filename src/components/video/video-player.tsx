// src/components/video/video-player.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { VimeoLessonPlayer } from "@/components/lessons/vimeo-lesson-player";

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
  const [loading, setLoading] = useState(true);
  
  const handleVideoComplete = useCallback(() => {
    console.log("Vídeo concluído, marcando aula como completa:", lessonId);
    if (onComplete) {
      onComplete(lessonId);
    }
  }, [lessonId, onComplete]);

  useEffect(() => {
    // Resetar o estado quando mudar o vídeo
    setLoading(true);
    
    console.log("VideoPlayer inicializado com:", {
      publicId,
      lessonId,
      title
    });
    
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [publicId, lessonId, title]);

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
    <div className="relative w-full">
      <VimeoLessonPlayer 
        videoId={publicId} 
        className="rounded-lg overflow-hidden" 
        onComplete={handleVideoComplete}
        onProgress={(progress) => console.log(`Progresso do vídeo: ${progress.toFixed(2)}%`)}
      />
    </div>
  );
}