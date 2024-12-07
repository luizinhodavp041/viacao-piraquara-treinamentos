"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditCourseForm } from "./edit-course-form";

interface Course {
  _id: string;
  title: string;
  description: string;
  modules: any[];
}

interface EditCourseDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function EditCourseDialog({
  course,
  open,
  onOpenChange,
  onUpdate,
}: EditCourseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
        </DialogHeader>
        {course && (
          <EditCourseForm
            course={course}
            onSuccess={() => {
              onUpdate();
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
