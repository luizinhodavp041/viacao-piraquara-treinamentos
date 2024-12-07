"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateLessonForm } from "./create-lesson-form";

interface CreateLessonDialogProps {
  moduleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateLessonDialog({
  moduleId,
  open,
  onOpenChange,
  onSuccess,
}: CreateLessonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Aula</DialogTitle>
        </DialogHeader>
        <CreateLessonForm moduleId={moduleId} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
