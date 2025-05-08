// src/app/home/courses/[courseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EnhancedVideoPlayer from "@/components/EnhancedVideoPlayer"; // Importe o componente
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft, CheckCircle, Circle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoId?: string;
  vimeoId?: string;
  videoPublicId?: string;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  modules: Module[];
}

export default function CoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estado para armazenar o ID de vídeo atual
  const [currentVideoId, setCurrentVideoId] = useState<string>("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);

        // Carregar dados do curso
        console.log("Buscando curso:", courseId);
        const courseRes = await fetch(`/api/courses/${courseId}`);

        if (!courseRes.ok) {
          throw new Error(`Erro ao carregar curso: ${courseRes.status}`);
        }

        const courseData = await courseRes.json();
        console.log("Dados do curso recebidos:", courseData);

        setCourse(courseData);

        // Selecionar primeira lição por padrão
        if (
          courseData.modules &&
          courseData.modules.length > 0 &&
          courseData.modules[0].lessons &&
          courseData.modules[0].lessons.length > 0
        ) {
          const firstLesson = courseData.modules[0].lessons[0];
          console.log("Primeira lição:", firstLesson);
          setSelectedLesson(firstLesson);

          // Atualizar o ID do vídeo
          updateVideoId(firstLesson);
        }

        // Carregar progresso do curso
        const progressRes = await fetch(`/api/progress?courseId=${courseId}`);
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          console.log("Dados de progresso:", progressData);

          // Extrair IDs das lições concluídas
          const completedIds = progressData
            .filter((item: any) => item.progress >= 100)
            .map((item: any) => item.lesson);

          setCompletedLessons(completedIds);
        }
      } catch (err: any) {
        console.error("Erro:", err);
        setError(err.message || "Erro ao carregar dados do curso");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Função para extrair o ID do vídeo a partir da lição selecionada
  const updateVideoId = (lesson: Lesson | null) => {
    if (!lesson) {
      setCurrentVideoId("");
      return;
    }

    // Ordem de prioridade: videoId > vimeoId > videoPublicId
    const videoId =
      lesson.videoId || lesson.vimeoId || lesson.videoPublicId || "";
    setCurrentVideoId(videoId);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    console.log("Selecionando lição:", lesson);
    setSelectedLesson(lesson);
    updateVideoId(lesson);
  };

  const handleLessonComplete = (lessonId: string) => {
    console.log("Lição completada:", lessonId);
    // Atualizar localmente a lista de lições concluídas
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
    }

    // Opcional: salvar o progresso no servidor
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lesson: lessonId,
        course: courseId,
        progress: 100,
      }),
    }).catch((err) => {
      console.error("Erro ao salvar progresso:", err);
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
          <h2 className="text-lg font-bold">Erro</h2>
          <p>{error}</p>
        </div>
        <Link href="/home/courses">
          <Button variant="outline" className="mt-4">
            Voltar para lista de cursos
          </Button>
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">
            Curso não encontrado
          </h2>
          <p className="mt-2 text-gray-600">
            O curso solicitado não está disponível.
          </p>
          <Link href="/home/courses">
            <Button variant="outline" className="mt-4">
              Voltar para lista de cursos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/home/courses">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-gray-500">{course.description}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Área principal com vídeo e descrição */}
        <div className="space-y-4">
          {selectedLesson ? (
            <>
              <div className="bg-gray-100 p-2 rounded mb-2">
                <p className="text-sm text-gray-600">
                  Video ID: {currentVideoId || "Nenhum"}
                </p>
              </div>

              {/* Usar o EnhancedVideoPlayer em vez do LessonVideo */}
              <EnhancedVideoPlayer
                videoId={currentVideoId}
                title={selectedLesson.title}
                onComplete={() => {
                  if (selectedLesson) {
                    handleLessonComplete(selectedLesson._id);
                  }
                }}
                disableSkipping={true} // Ativar a restrição de avançar
                primaryColor="#4f46e5" // Customizar a cor primária (opcional)
                // Você pode adicionar mais propriedades conforme necessário
              />

              <div className="mt-4">
                <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                <p className="mt-2 text-gray-600">
                  {selectedLesson.description}
                </p>
              </div>
            </>
          ) : (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500">Selecione uma lição para começar</p>
            </div>
          )}
        </div>

        {/* Sidebar com módulos e lições */}
        <div className="border rounded-lg overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {course.modules.map((module, index) => (
              <AccordionItem key={module._id} value={module._id}>
                <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                  <div className="flex items-center gap-2 text-left">
                    <span className="font-medium">Módulo {index + 1}</span>
                    <span className="text-sm text-gray-500">
                      {module.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 px-2">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson._id}
                        onClick={() => handleLessonSelect(lesson)}
                        className={`w-full flex items-center gap-2 p-2 text-left rounded hover:bg-gray-100 transition-colors ${
                          selectedLesson?._id === lesson._id
                            ? "bg-gray-100"
                            : ""
                        }`}
                      >
                        {completedLessons.includes(lesson._id) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : selectedLesson?._id === lesson._id ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                        <span className="text-sm">{lesson.title}</span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
