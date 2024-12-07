"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Pencil, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { CreateModuleDialog } from "./create-module-dialog";
import { EditModuleDialog } from "./edit-module-dialog";
import { DeleteModuleDialog } from "./delete-module-dialog";

interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
  lessons: any[];
}

interface ModulesListProps {
  courseId: string;
  onUpdate: () => void;
}

export function ModulesList({ courseId, onUpdate }: ModulesListProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Função para buscar os módulos do curso
  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error("Erro ao carregar módulos");
      const data = await response.json();
      setModules(data.modules || []);
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega os módulos quando o componente montar ou quando houver atualização
  useEffect(() => {
    fetchModules();
  }, [courseId]);

  if (loading) {
    return <div>Carregando módulos...</div>;
  }

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Módulos</h3>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Módulo
        </Button>
      </div>

      <div className="space-y-2">
        {sortedModules.map((module) => (
          <div
            key={module._id}
            className="flex items-center gap-2 p-4 border rounded-lg bg-white"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <div className="font-medium">{module.title}</div>
              <div className="text-sm text-gray-500">{module.description}</div>
              <div className="text-sm text-gray-400">
                {module.lessons?.length || 0} aulas
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingModule(module)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletingModule(module)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={`/admin/courses/${courseId}/modules/${module._id}/lessons`}
                >
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}

        {sortedModules.length === 0 && (
          <div className="text-center p-4 text-gray-500">
            Nenhum módulo cadastrado
          </div>
        )}
      </div>

      <CreateModuleDialog
        courseId={courseId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          fetchModules();
          setIsCreateOpen(false);
        }}
      />

      <EditModuleDialog
        module={editingModule}
        open={!!editingModule}
        onOpenChange={(open) => !open && setEditingModule(null)}
        onSuccess={() => {
          fetchModules();
          setEditingModule(null);
        }}
      />

      <DeleteModuleDialog
        module={deletingModule}
        open={!!deletingModule}
        onOpenChange={(open) => !open && setDeletingModule(null)}
        onSuccess={() => {
          fetchModules();
          setDeletingModule(null);
        }}
      />
    </div>
  );
}
