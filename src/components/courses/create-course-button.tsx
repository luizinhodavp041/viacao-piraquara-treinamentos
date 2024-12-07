"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateCourseForm } from "./create-course-form";

interface CreateCourseButtonProps {
  onSuccess: () => void;
}

export function CreateCourseButton({ onSuccess }: CreateCourseButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Curso
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Curso</DialogTitle>
        </DialogHeader>
        <CreateCourseForm
          onSuccess={() => {
            onSuccess();
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
