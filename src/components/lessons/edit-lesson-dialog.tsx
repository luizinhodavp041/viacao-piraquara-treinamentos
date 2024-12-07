"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditLessonForm } from "./edit-lesson-form";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl?: string;
  order: number;
}

interface EditLessonDialogProps {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditLessonDialog({
  lesson,
  open,
  onOpenChange,
  onSuccess,
}: EditLessonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Aula</DialogTitle>
        </DialogHeader>
        {lesson && <EditLessonForm lesson={lesson} onSuccess={onSuccess} />}
      </DialogContent>
    </Dialog>
  );
}
