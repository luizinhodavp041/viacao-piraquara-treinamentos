"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, BookOpen, FileQuestion, FileEdit } from "lucide-react";
import Link from "next/link";
import { EditCourseDialog } from "./edit-course-dialog";
import { DeleteCourseDialog } from "./delete-course-dialog";
import { CreateQuizDialog } from "../quiz/create-quiz-dialog";
import { CreateCourseButton } from "./create-course-button";

interface Course {
  _id: string;
  title: string;
  description: string;
  modules: any[];
}

interface CourseWithQuiz extends Course {
  hasQuiz?: boolean;
}

export function CoursesTable() {
  const [courses, setCourses] = useState<CourseWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [creatingQuiz, setCreatingQuiz] = useState<Course | null>(null);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      const data = await response.json();

      // Verificar quais cursos já têm quiz
      const coursesWithQuizStatus = await Promise.all(
        data.map(async (course: Course) => {
          try {
            const quizResponse = await fetch(
              `/api/quiz?courseId=${course._id}`
            );
            return {
              ...course,
              hasQuiz: quizResponse.ok && (await quizResponse.json()) !== null,
            };
          } catch (error) {
            console.error(
              `Erro ao verificar quiz do curso ${course._id}:`,
              error
            );
            return { ...course, hasQuiz: false };
          }
        })
      );

      setCourses(coursesWithQuizStatus);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleQuizClick = async (course: CourseWithQuiz) => {
    if (course.hasQuiz) {
      // Aqui você pode redirecionar para a página de edição do quiz
      // ou mostrar um modal de edição
      alert(
        "Este curso já possui um quiz. A edição será implementada em breve."
      );
      return;
    }
    setCreatingQuiz(course);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Cursos</h2>
        <CreateCourseButton onSuccess={fetchCourses} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-center">Módulos</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.description}</TableCell>
                <TableCell className="text-center">
                  {course.modules?.length || 0}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCourse(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCourse(course)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/courses/${course._id}/modules`}>
                        <BookOpen className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuizClick(course)}
                      title={course.hasQuiz ? "Quiz já existe" : "Criar Quiz"}
                    >
                      {course.hasQuiz ? (
                        <FileEdit className="h-4 w-4" />
                      ) : (
                        <FileQuestion className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditCourseDialog
        course={editingCourse}
        open={!!editingCourse}
        onOpenChange={(open) => !open && setEditingCourse(null)}
        onUpdate={fetchCourses}
      />

      <DeleteCourseDialog
        course={deletingCourse}
        open={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
        onDelete={fetchCourses}
      />

      <CreateQuizDialog
        course={creatingQuiz}
        open={!!creatingQuiz}
        onOpenChange={(open) => !open && setCreatingQuiz(null)}
        onSuccess={() => {
          setCreatingQuiz(null);
          fetchCourses();
        }}
      />
    </>
  );
}
