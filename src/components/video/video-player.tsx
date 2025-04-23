// src/components/video/video-player.tsx
"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Simulação de carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [publicId]);

  const handleVideoComplete = () => {
    // Registrar progresso quando o vídeo terminar
    console.log("Vídeo concluído, registrando progresso...");

    // Chame a API para registrar progresso
    fetch("/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lessonId,
        courseId,
        completed: true,
      }),
    })
      .then(() => {
        if (onComplete) {
          onComplete(lessonId);
        }
      })
      .catch((error) => {
        console.error("Erro ao registrar progresso:", error);
      });
  };

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
        onProgress={(progress) => console.log(`Progresso: ${progress}%`)}
      />
    </div>
  );
}
