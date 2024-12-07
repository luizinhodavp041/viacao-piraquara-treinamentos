"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateModuleForm } from "./create-module-form";

interface CreateModuleDialogProps {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateModuleDialog({
  courseId,
  open,
  onOpenChange,
  onSuccess,
}: CreateModuleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Módulo</DialogTitle>
        </DialogHeader>
        <CreateModuleForm courseId={courseId} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
