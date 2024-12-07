"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ModulesList } from "@/components/modules/modules-list";

interface Course {
  _id: string;
  title: string;
  description: string;
  modules: any[];
}

export default function CourseModulesPage({
  params,
}: {
  params: { courseId: string };
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}`);
      if (!response.ok) throw new Error("Erro ao carregar curso");
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!course) return <div>Curso não encontrado</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {course.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      <ModulesList courseId={params.courseId} onUpdate={fetchCourse} />
    </div>
  );
}
