// src/components/LessonVideo.tsx
"use client";

import { useState } from "react";
import VideoPlayer from "./VideoPlayer";

interface LessonVideoProps {
  lessonId: string;
  courseId: string;
  videoId: string;
  title?: string;
  className?: string;
}

export default function LessonVideo({
  lessonId,
  courseId,
  videoId,
  title,
  className = "",
}: LessonVideoProps) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Manipulador de progresso do vídeo
  const handleProgress = async (progressPercent: number) => {
    setProgress(progressPercent);

    // Salvar progresso no backend a cada 10% (evitar muitas chamadas)
    if (progressPercent % 10 < 1 && progressPercent > 0) {
      try {
        await saveProgress(Math.floor(progressPercent));
      } catch (error) {
        console.error("Erro ao salvar progresso:", error);
      }
    }
  };

  // Manipulador de conclusão do vídeo
  const handleComplete = async () => {
    if (completed) return; // Evitar chamadas duplicadas

    console.log(`Aula ${lessonId} concluída`);
    setCompleted(true);

    try {
      // Salvar progresso final
      await saveProgress(100);

      // Você pode adicionar aqui lógica adicional após a conclusão da aula
      // por exemplo, ir para a próxima aula, mostrar um quiz, etc.
    } catch (error) {
      console.error("Erro ao registrar conclusão:", error);
    }
  };

  // Função para salvar progresso no backend
  const saveProgress = async (progressValue: number) => {
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lesson: lessonId,
        course: courseId,
        progress: progressValue,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao salvar progresso: ${error}`);
    }

    return response.json();
  };

  if (!videoId) {
    return (
      <div
        className={`aspect-video bg-gray-800 flex items-center justify-center text-white ${className}`}
      >
        <p>Nenhum vídeo disponível para esta aula.</p>
      </div>
    );
  }

  return (
    <div className={`lesson-video ${className}`}>
      <VideoPlayer
        videoId={videoId}
        title={title}
        onComplete={handleComplete}
        onProgress={handleProgress}
        className="w-full"
      />

      {/* Badge de progresso (opcional) */}
      {progress > 0 && progress < 100 && !completed && (
        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Progresso: {Math.floor(progress)}%
        </div>
      )}

      {/* Badge de concluído (opcional) */}
      {completed && (
        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Aula concluída
        </div>
      )}
    </div>
  );
}
