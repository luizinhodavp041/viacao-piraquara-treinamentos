// src/components/lessons/create-lesson-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VimeoUploadDialog } from "@/components/vimeo/vimeo-upload-dialog"; // Ajuste o caminho conforme necessário
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [openVimeoUpload, setOpenVimeoUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vimeoId, setVimeoId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Função chamada quando o upload para o Vimeo é concluído
  const handleVimeoUploadSuccess = (videoId: string, videoData: any) => {
    setVimeoId(videoId);
    // Fechar o diálogo de upload do Vimeo
    setOpenVimeoUpload(false);
    setSuccess(`Vídeo enviado com sucesso! ID: ${videoId}`);
  };

  // Função para criar a aula após o vídeo ser carregado
  const handleCreateLesson = async () => {
    if (!title.trim()) {
      setError("O título da aula é obrigatório");
      return;
    }

    if (!vimeoId) {
      setError("É necessário fazer upload de um vídeo para o Vimeo");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Adicionar a aula ao módulo
      const response = await fetch(`/api/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          vimeoId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar aula");
      }

      setSuccess("Aula criada com sucesso!");
      
      // Limpar estados
      setTitle("");
      setDescription("");
      setVimeoId(null);
      
      // Fechar o diálogo principal
      onOpenChange(false);
      
      // Chamar função de sucesso para atualizar a interface
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar aula:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar aula");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Criar Nova Aula</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 text-sm text-green-500 bg-green-50 rounded-md">
                {success}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título da Aula
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da aula"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite a descrição da aula"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Vídeo da Aula</label>
              {vimeoId ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 text-sm">
                    Vídeo enviado com sucesso! ID do vídeo: {vimeoId}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => setOpenVimeoUpload(true)}
                  >
                    Trocar Vídeo
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setOpenVimeoUpload(true)}>
                  Fazer Upload para o Vimeo
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateLesson}
              disabled={!title || !vimeoId || isCreating}
            >
              {isCreating ? "Criando..." : "Criar Aula"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de upload para o Vimeo */}
      <VimeoUploadDialog
        open={openVimeoUpload}
        onOpenChange={setOpenVimeoUpload}
        onSuccess={handleVimeoUploadSuccess}
      />
    </>
  );
}