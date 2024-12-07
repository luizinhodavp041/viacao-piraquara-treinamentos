"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditModuleForm } from "./edit-module-form";

interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
}

interface EditModuleDialogProps {
  module: Module | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditModuleDialog({
  module,
  open,
  onOpenChange,
  onSuccess,
}: EditModuleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Módulo</DialogTitle>
        </DialogHeader>
        {module && <EditModuleForm module={module} onSuccess={onSuccess} />}
      </DialogContent>
    </Dialog>
  );
}
