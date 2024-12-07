"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Clock } from "lucide-react";
import Link from "next/link";

interface CourseProgress {
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
  lastWatched?: string;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  lessons: any[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  modules: Module[];
  progress: CourseProgress | null;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses/available");
      if (!response.ok) throw new Error("Erro ao carregar cursos");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalLessons = (modules: Module[]) => {
    return modules.reduce((total, module) => total + module.lessons.length, 0);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Cursos Disponíveis
          </h2>
          <p className="text-muted-foreground">
            Explore nossos cursos e comece a aprender.
          </p>
        </div>
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "Nenhum curso encontrado com este termo."
              : "Nenhum curso disponível no momento."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="flex-1 text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <BookOpen className="mr-1 h-4 w-4" />
                      {course.modules.length} módulos
                    </div>
                    <div>{getTotalLessons(course.modules)} aulas</div>
                  </div>

                  {course.progress && course.progress.percentComplete > 0 && (
                    <>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                course.progress.percentComplete
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>
                            {course.progress.percentComplete}% concluído
                          </span>
                          <span>
                            {course.progress.completedLessons}/
                            {course.progress.totalLessons} aulas
                          </span>
                        </div>
                      </div>

                      {course.progress.lastWatched && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>
                            Última aula:{" "}
                            {new Date(
                              course.progress.lastWatched
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <Button asChild className="w-full">
                    <Link href={`/home/courses/${course._id}`}>
                      {course.progress && course.progress.percentComplete > 0
                        ? "Continuar"
                        : "Começar"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
