"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Student {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  progress: {
    totalCourses: number;
    completedCourses: number;
    lastAccess?: string;
    totalLessonsCompleted: number;
  };
  status: "active" | "inactive";
}

interface CourseProgress {
  courseId: string;
  courseName: string;
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  lastAccess?: string;
}

interface ViewStudentDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewStudentDialog({
  student,
  open,
  onOpenChange,
}: ViewStudentDialogProps) {
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student && open) {
      fetchStudentProgress();
    }
  }, [student, open]);

  const fetchStudentProgress = async () => {
    if (!student) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/students/${student._id}/progress`
      );
      if (!response.ok) throw new Error("Erro ao carregar progresso");
      const data = await response.json();
      setCourseProgress(data.courseProgress);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Progresso do Aluno</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Aluno */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Cursos Concluídos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {student.progress.completedCourses}/
                  {student.progress.totalCourses}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Aulas Concluídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {student.progress.totalLessonsCompleted}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Último Acesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {student.progress.lastAccess
                    ? new Date(student.progress.lastAccess).toLocaleDateString()
                    : "Nunca acessou"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progresso por Curso */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Progresso por Curso</h3>
            {loading ? (
              <div>Carregando...</div>
            ) : (
              <div className="space-y-4">
                {courseProgress.map((course) => (
                  <div
                    key={course.courseId}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{course.courseName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.completedLessons} de {course.totalLessons}{" "}
                          aulas concluídas
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {course.percentComplete}%
                      </span>
                    </div>
                    <Progress value={course.percentComplete} />
                    {course.lastAccess && (
                      <p className="text-sm text-muted-foreground">
                        Último acesso:{" "}
                        {new Date(course.lastAccess).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}

                {courseProgress.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum curso iniciado
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
