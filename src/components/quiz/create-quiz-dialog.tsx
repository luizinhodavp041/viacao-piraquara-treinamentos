"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Course {
  _id: string;
  title: string;
}

interface CreateQuizDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateQuizDialog({
  course,
  open,
  onOpenChange,
  onSuccess,
}: CreateQuizDialogProps) {
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!course) return;

    // Validação
    if (
      questions.some(
        (q) => !q.question.trim() || q.options.some((opt) => !opt.trim())
      )
    ) {
      setError("Por favor, preencha todas as perguntas e opções");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course._id,
          questions,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao criar quiz");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(newQuestions);
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Quiz - {course.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Questão {qIndex + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(qIndex)}
                  disabled={questions.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                value={question.question}
                onChange={(e) =>
                  updateQuestion(qIndex, "question", e.target.value)
                }
                placeholder="Digite a pergunta"
                required
              />

              <div className="space-y-3">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      placeholder={`Opção ${oIndex + 1}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCorrectAnswer(qIndex, oIndex)}
                      className={cn(
                        question.correctAnswer === oIndex &&
                          "bg-green-50 border-green-500"
                      )}
                    >
                      <CheckCircle
                        className={cn(
                          "h-4 w-4",
                          question.correctAnswer === oIndex
                            ? "text-green-500"
                            : "text-gray-400"
                        )}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Questão
          </Button>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Quiz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
