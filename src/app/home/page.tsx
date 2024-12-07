"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Trophy, Activity } from "lucide-react";
import Link from "next/link";

interface Course {
  _id: string;
  title: string;
  description: string;
  modules: any[];
}

interface Progress {
  course: Course;
  completedLessons: number;
  totalLessons: number;
  lastWatched: string;
  percentComplete: number;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [coursesProgress, setCoursesProgress] = useState<Progress[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    inProgress: 0,
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Erro ao carregar dashboard");
      const data = await response.json();

      setCoursesProgress(data.coursesProgress);
      setStats(data.stats);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está seu progresso.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aulas Concluídas
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedLessons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cursos em Andamento */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Cursos em Andamento</h3>
          <Button variant="outline" asChild>
            <Link href="/home/courses">Ver todos os cursos</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coursesProgress.map((progress) => (
            <Card key={progress.course._id}>
              <CardHeader>
                <CardTitle className="line-clamp-1">
                  {progress.course.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Barra de Progresso */}
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress.percentComplete}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{progress.percentComplete}% concluído</span>
                    <span>
                      {progress.completedLessons}/{progress.totalLessons} aulas
                    </span>
                  </div>
                </div>

                {/* Última aula assistida */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>
                    Última aula:{" "}
                    {new Date(progress.lastWatched).toLocaleDateString()}
                  </span>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/home/courses/${progress.course._id}`}>
                    Continuar
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}

          {coursesProgress.length === 0 && (
            <div className="col-span-full text-center py-6 text-muted-foreground">
              <p>Nenhum curso em andamento.</p>
              <Button variant="outline" className="mt-2" asChild>
                <Link href="/home/courses">Explorar cursos</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
