"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Pencil, Trash2, Video } from "lucide-react";
import { CreateLessonDialog } from "./create-lesson-dialog";
import { EditLessonDialog } from "./edit-lesson-dialog";
import { DeleteLessonDialog } from "./delete-lesson-dialog";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl?: string;
  order: number;
}

interface LessonsListProps {
  moduleId: string;
  courseId: string;
  onUpdate: () => void;
}

export function LessonsList({
  moduleId,
  courseId,
  onUpdate,
}: LessonsListProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/lessons`);
      if (!response.ok) throw new Error("Erro ao carregar aulas");
      const data = await response.json();
      setLessons(data);
    } catch (error) {
      console.error("Erro ao carregar aulas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [moduleId]);

  if (loading) {
    return <div>Carregando aulas...</div>;
  }

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Aulas</h3>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      </div>

      <div className="space-y-2">
        {sortedLessons.map((lesson) => (
          <div
            key={lesson._id}
            className="flex items-center gap-2 p-4 border rounded-lg bg-white"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <div className="font-medium">{lesson.title}</div>
              <div className="text-sm text-gray-500">{lesson.description}</div>
              {lesson.videoUrl && (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Video className="h-3 w-3" />
                  <span>Vídeo disponível</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingLesson(lesson)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletingLesson(lesson)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {sortedLessons.length === 0 && (
          <div className="text-center p-4 text-gray-500">
            Nenhuma aula cadastrada
          </div>
        )}
      </div>

      <CreateLessonDialog
        moduleId={moduleId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          fetchLessons();
          setIsCreateOpen(false);
        }}
      />

      <EditLessonDialog
        lesson={editingLesson}
        open={!!editingLesson}
        onOpenChange={(open) => !open && setEditingLesson(null)}
        onSuccess={() => {
          fetchLessons();
          setEditingLesson(null);
        }}
      />

      <DeleteLessonDialog
        lesson={deletingLesson}
        open={!!deletingLesson}
        onOpenChange={(open) => !open && setDeletingLesson(null)}
        onSuccess={() => {
          fetchLessons();
          setDeletingLesson(null);
        }}
      />
    </div>
  );
}
