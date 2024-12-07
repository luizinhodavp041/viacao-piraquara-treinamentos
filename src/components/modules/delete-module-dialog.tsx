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

interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
}

interface DeleteModuleDialogProps {
  module: Module | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteModuleDialog({
  module,
  open,
  onOpenChange,
  onSuccess,
}: DeleteModuleDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!module) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/modules/${module._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar módulo");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao deletar módulo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deletar Módulo</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar o módulo {module?.title}? Esta ação
            não pode ser desfeita e também removerá todas as aulas associadas.
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
