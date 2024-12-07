"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl?: string;
  order: number;
}

interface DeleteLessonDialogProps {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteLessonDialog({
  lesson,
  open,
  onOpenChange,
  onSuccess,
}: DeleteLessonDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!lesson) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/lessons/${lesson._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar aula");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao deletar aula:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deletar Aula</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar a aula {lesson?.title}? Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deletando..." : "Deletar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
