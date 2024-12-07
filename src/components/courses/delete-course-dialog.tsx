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

interface Course {
  _id: string;
  title: string;
  description: string;
  modules: any[];
}

interface DeleteCourseDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function DeleteCourseDialog({
  course,
  open,
  onOpenChange,
  onDelete,
}: DeleteCourseDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!course) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${course._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar curso");
      }

      onDelete();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao deletar curso:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deletar Curso</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar o curso {course?.title}? Esta ação
            não pode ser desfeita e também removerá todos os módulos e aulas
            associados.
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
