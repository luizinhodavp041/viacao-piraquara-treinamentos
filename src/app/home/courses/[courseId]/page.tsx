"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VideoPlayer } from "@/components/video/video-player";
import {
  ChevronLeft,
  Play,
  CheckCircle,
  Circle,
  FileQuestion,
  Lock,
  Download,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { TakeQuizDialog } from "@/components/quiz/take-quiz-dialog";

interface Lesson {
  _id: string;
  title: string;
  description: string;
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

interface Quiz {
  _id: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface QuizResponse {
  _id: string;
  score: number;
  completedAt: string;
}

interface Certificate {
  _id: string;
  issuedAt: string;
  validationCode: string;
}

export default function CoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResponse, setQuizResponse] = useState<QuizResponse | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Definição de allLessonsCompleted movida para antes dos useEffects
  const allLessonsCompleted =
    course?.modules?.every((module) => {
      const moduleCompleted = module.lessons.every((lesson) => {
        const isCompleted = completedLessons.includes(lesson._id);
        console.log(
          `Aula ${lesson.title}:`,
          isCompleted ? "Completa" : "Incompleta"
        );
        return isCompleted;
      });
      console.log(
        `Módulo ${module.title}:`,
        moduleCompleted ? "Completo" : "Incompleto"
      );
      return moduleCompleted;
    }) ?? false;

  useEffect(() => {
    fetchCourse();
    fetchProgress();
    fetchQuiz();
    fetchQuizResponse();
    fetchCertificate();
  }, [params.courseId]);

  useEffect(() => {
    console.log("Debug do curso:", {
      courseId: params.courseId,
      hasModules: !!course?.modules,
      modulesCount: course?.modules?.length,
      hasQuiz: !!quiz,
      completedLessonsCount: completedLessons.length,
      totalLessons: course?.modules?.reduce(
        (total, module) => total + module.lessons.length,
        0
      ),
      allLessonsCompleted,
      quizResponse: !!quizResponse,
      quizScore: quizResponse?.score,
      certificate: !!certificate,
    });
  }, [
    course,
    quiz,
    completedLessons,
    quizResponse,
    certificate,
    allLessonsCompleted,
    params.courseId,
  ]);

  const fetchCourse = async () => {
    try {
      console.log("Buscando curso:", params.courseId);
      const response = await fetch(`/api/courses/${params.courseId}`);
      if (!response.ok) throw new Error("Erro ao carregar curso");
      const data = await response.json();
      console.log("Curso carregado:", data);
      setCourse(data);

      if (data.modules[0]?.lessons[0]) {
        setSelectedLesson(data.modules[0].lessons[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar curso:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      console.log("Buscando progresso");
      const response = await fetch(`/api/progress?courseId=${params.courseId}`);
      if (!response.ok) throw new Error("Erro ao carregar progresso");
      const progress = await response.json();
      console.log("Progresso carregado:", progress);
      setCompletedLessons(progress.map((p: any) => p.lesson));
    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
    }
  };

  const fetchQuiz = async () => {
    try {
      console.log("Buscando quiz");
      const response = await fetch(`/api/quiz?courseId=${params.courseId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Quiz carregado:", data);
        setQuiz(data);
      }
    } catch (error) {
      console.error("Erro ao carregar quiz:", error);
    }
  };

  const fetchQuizResponse = async () => {
    try {
      console.log("Buscando resposta do quiz");
      const response = await fetch(
        `/api/quiz/response/user?courseId=${params.courseId}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Resposta do quiz carregada:", data);
        setQuizResponse(data);
      }
    } catch (error) {
      console.error("Erro ao carregar resposta do quiz:", error);
    }
  };

  const fetchCertificate = async () => {
    try {
      console.log("Buscando certificado");
      const response = await fetch(
        `/api/certificates?courseId=${params.courseId}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Certificado carregado:", data);
        setCertificate(data);
      }
    } catch (error) {
      console.error("Erro ao carregar certificado:", error);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      setIsGenerating(true);
      console.log("Gerando certificado");
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: params.courseId }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar certificado");
      }

      const data = await response.json();
      console.log("Certificado gerado:", data);
      setCertificate(data);
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const findNextLesson = (currentLessonId: string) => {
    let foundCurrent = false;
    for (const module of course?.modules || []) {
      for (const lesson of module.lessons) {
        if (foundCurrent) {
          return lesson;
        }
        if (lesson._id === currentLessonId) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  const handleLessonComplete = async (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      console.log("Marcando aula como completa:", lessonId);
      setCompletedLessons((prev) => [...prev, lessonId]);
    }

    if (selectedLesson) {
      const nextLesson = findNextLesson(selectedLesson._id);
      if (nextLesson) {
        setSelectedLesson(nextLesson);
      }
    }
  };

  const handleQuizComplete = async () => {
    setShowQuiz(false);
    await fetchQuizResponse();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!course) {
    return <div>Curso não encontrado</div>;
  }

  console.log("Renderizando com estados:", {
    allLessonsCompleted,
    hasQuiz: !!quiz,
    quizResponse,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/home/courses">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{course.title}</h2>
          <p className="text-muted-foreground">{course.description}</p>
        </div>
        {allLessonsCompleted && quiz && (
          <div>
            {quizResponse ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Última tentativa:{" "}
                  {new Date(quizResponse.completedAt).toLocaleDateString()} -{" "}
                  {quizResponse.score}%
                </span>
                <Button
                  onClick={() => setShowQuiz(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <FileQuestion className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                {quizResponse.score >= 70 && (
                  <>
                    {certificate ? (
                      <Button variant="outline" asChild className="gap-2">
                        <a
                          href={`/api/certificates/download?certificateId=${certificate._id}`}
                        >
                          <Download className="h-4 w-4" />
                          Baixar Certificado
                        </a>
                      </Button>
                    ) : (
                      <Button
                        onClick={handleGenerateCertificate}
                        disabled={isGenerating}
                        variant="outline"
                        className="gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        {isGenerating ? "Gerando..." : "Gerar Certificado"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setShowQuiz(true)}
                variant="outline"
                className="gap-2"
              >
                <FileQuestion className="h-4 w-4" />
                Quiz Final
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {selectedLesson && (
            <>
              <div className="aspect-video">
                <VideoPlayer
                  publicId={selectedLesson.videoPublicId || ""}
                  title={selectedLesson.title}
                  lessonId={selectedLesson._id}
                  courseId={params.courseId}
                  onComplete={handleLessonComplete}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedLesson.title}
                </h3>
                <p className="text-muted-foreground">
                  {selectedLesson.description}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="border rounded-lg">
          <Accordion type="single" collapsible className="w-full">
            {course.modules.map((module, moduleIndex) => (
              <AccordionItem key={module._id} value={module._id}>
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2 text-left">
                    <span className="font-semibold">
                      Módulo {moduleIndex + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {module.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson._id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`w-full flex items-center gap-2 p-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                        selectedLesson?._id === lesson._id ? "bg-accent" : ""
                      }`}
                    >
                      {completedLessons.includes(lesson._id) ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : selectedLesson?._id === lesson._id ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      {lesson.title}
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {quiz && (
        <TakeQuizDialog
          quiz={quiz}
          open={showQuiz}
          onOpenChange={setShowQuiz}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}
