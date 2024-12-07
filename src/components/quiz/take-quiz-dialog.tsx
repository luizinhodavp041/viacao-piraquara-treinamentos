"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Quiz {
  _id: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface TakeQuizDialogProps {
  quiz: Quiz;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function TakeQuizDialog({
  quiz,
  open,
  onOpenChange,
  onComplete,
}: TakeQuizDialogProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/quiz/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz._id,
          answers: answers.map((answer, index) => ({
            question: quiz.questions[index],
            selectedAnswer: answer,
            isCorrect: answer === quiz.questions[index].correctAnswer,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar respostas");
      }

      const data = await response.json();
      setScore(data.score);
      setShowResults(true);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setCurrentQuestion(0);
      setAnswers([]);
      setShowResults(false);
      if (showResults) {
        onComplete();
      }
    }
  };

  const question = quiz.questions[currentQuestion];
  const hasAnswered = answers[currentQuestion] !== undefined;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {showResults
              ? "Resultado"
              : `Questão ${currentQuestion + 1} de ${quiz.questions.length}`}
          </DialogTitle>
        </DialogHeader>

        {showResults ? (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">{score}%</div>
              <p className="text-muted-foreground">
                Você acertou {Math.round((score / 100) * quiz.questions.length)}{" "}
                de {quiz.questions.length} questões
              </p>
            </div>

            <div className="border-t pt-4 text-center">
              <Button onClick={handleClose}>Finalizar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-lg font-medium">{question.question}</p>

              <RadioGroup
                onValueChange={handleAnswer}
                value={answers[currentQuestion]?.toString()}
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                    />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={!hasAnswered || loading}>
                {loading
                  ? "Enviando..."
                  : currentQuestion === quiz.questions.length - 1
                  ? "Finalizar"
                  : "Próxima"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
