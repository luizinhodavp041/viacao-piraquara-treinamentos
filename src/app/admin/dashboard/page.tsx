"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  BookOpen,
  Trophy,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalLessons: number;
  totalCompletions: number;
  studentProgress: {
    active: number;
    inactive: number;
    completed: number;
  };
  courseEngagement: {
    courseName: string;
    totalStudents: number;
    completionRate: number;
  }[];
  recentActivities: {
    studentName: string;
    action: string;
    courseName: string;
    date: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) throw new Error("Erro ao carregar estatísticas");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!stats) {
    return <div>Erro ao carregar dados</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Admin</h2>
        <p className="text-muted-foreground">
          Visão geral da plataforma e progresso dos alunos.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.studentProgress.active} ativos recentemente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLessons} aulas no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conclusão
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompletions}</div>
            <p className="text-xs text-muted-foreground">cursos completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (stats.studentProgress.active / stats.totalStudents) * 100
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">dos alunos ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Cursos mais populares */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.courseEngagement.map((course) => (
          <Card key={course.courseName}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {course.courseName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{course.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">
                    taxa de conclusão
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {course.totalStudents} alunos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Atividades Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.studentName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action} em {activity.courseName}
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
