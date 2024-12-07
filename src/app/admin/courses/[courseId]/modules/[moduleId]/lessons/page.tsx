"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { LessonsList } from "@/components/lessons/lessons-list";

interface Module {
  _id: string;
  title: string;
  description: string;
  lessons: any[];
}

export default function ModuleLessonsPage({
  params,
}: {
  params: { courseId: string; moduleId: string };
}) {
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModule();
  }, []);

  const fetchModule = async () => {
    try {
      const response = await fetch(`/api/modules/${params.moduleId}`);
      if (!response.ok) throw new Error("Erro ao carregar módulo");
      const data = await response.json();
      setModule(data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!module) return <div>Módulo não encontrado</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/courses/${params.courseId}/modules`}>
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {module.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {module.description}
            </p>
          </div>
        </div>
      </div>

      <LessonsList
        moduleId={params.moduleId}
        courseId={params.courseId}
        onUpdate={fetchModule}
      />
    </div>
  );
}
