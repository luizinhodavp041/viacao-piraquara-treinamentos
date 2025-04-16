"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Video } from "lucide-react";
import Link from "next/link";
import { LessonsList } from "@/components/lessons/lessons-list";
import { CreateLessonDialog } from "@/components/lessons/create-lesson-dialog";
import { VimeoUploadDialog } from "@/components/vimeo/vimeo-upload-dialog";
import { Alert } from "@/components/ui/alert";

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [vimeoUploadOpen, setVimeoUploadOpen] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message?: string;
  } | null>(null);

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

  const handleVimeoUploadSuccess = (videoId: string, videoData: any) => {
    // Mostrar alerta de sucesso
    setAlert({
      show: true,
      type: "success",
      title: "Vídeo enviado com sucesso!",
      message: `O vídeo "${
        videoData?.title || videoId
      }" foi enviado para o Vimeo. ID: ${videoId}`,
    });

    // Copiar o ID do vídeo para a área de transferência
    navigator.clipboard.writeText(videoId).then(() => {
      setTimeout(() => {
        setAlert({
          show: true,
          type: "info",
          title: "ID do vídeo copiado!",
          message: "O ID do vídeo foi copiado para a área de transferência.",
        });
      }, 3000);
    });
  };

  if (loading) return <div>Carregando...</div>;
  if (!module) return <div>Módulo não encontrado</div>;

  return (
    <div className="space-y-4">
      {alert && alert.show && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

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

        {/* Botões de ação */}
        <div className="flex items-center gap-2">
          {/* Botão Upload para Vimeo */}
          <Button variant="outline" onClick={() => setVimeoUploadOpen(true)}>
            <Video className="h-4 w-4 mr-2" />
            Upload para Vimeo
          </Button>

          {/* Botão Nova Aula */}
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Aula
          </Button>
        </div>
      </div>

      {/* Lista de Aulas */}
      <LessonsList
        moduleId={params.moduleId}
        courseId={params.courseId}
        onUpdate={fetchModule}
      />

      {/* Diálogo para criação de nova aula */}
      <CreateLessonDialog
        moduleId={params.moduleId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false);
          fetchModule();
        }}
      />

      {/* Diálogo para upload direto para o Vimeo */}
      <VimeoUploadDialog
        open={vimeoUploadOpen}
        onOpenChange={setVimeoUploadOpen}
        onSuccess={handleVimeoUploadSuccess}
      />
    </div>
  );
}
