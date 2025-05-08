// src/components/DiagnosticPanel.tsx
"use client";

import { useState } from "react";

interface DiagnosticPanelProps {
  course: any;
  selectedLesson: any;
  completedLessons: string[];
}

export default function DiagnosticPanel({
  course,
  selectedLesson,
  completedLessons,
}: DiagnosticPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!course) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-yellow-800">Diagnóstico</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded"
        >
          {expanded ? "Recolher" : "Expandir"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <h4 className="font-semibold">Lição Selecionada:</h4>
            {selectedLesson ? (
              <div className="ml-2 mt-1">
                <div>
                  <span className="font-medium">ID:</span> {selectedLesson._id}
                </div>
                <div>
                  <span className="font-medium">Título:</span>{" "}
                  {selectedLesson.title}
                </div>
                <div>
                  <span className="font-medium">VideoId:</span>{" "}
                  {selectedLesson.videoId || "Não definido"}
                </div>
                <div>
                  <span className="font-medium">vimeoId:</span>{" "}
                  {selectedLesson.vimeoId || "Não definido"}
                </div>
                <div>
                  <span className="font-medium">videoPublicId:</span>{" "}
                  {selectedLesson.videoPublicId || "Não definido"}
                </div>
              </div>
            ) : (
              <div className="text-red-500 ml-2">Nenhuma lição selecionada</div>
            )}
          </div>

          <div>
            <h4 className="font-semibold">Lições Completadas:</h4>
            <div className="ml-2 mt-1">
              {completedLessons.length > 0 ? (
                completedLessons.map((id) => <div key={id}>{id}</div>)
              ) : (
                <div>Nenhuma lição completada</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Estrutura do Curso:</h4>
            <div className="ml-2 mt-1">
              <div>
                <span className="font-medium">ID:</span> {course._id}
              </div>
              <div>
                <span className="font-medium">Título:</span> {course.title}
              </div>
              <div>
                <span className="font-medium">Módulos:</span>{" "}
                {course.modules?.length || 0}
              </div>

              <div className="mt-2">
                <div className="font-medium">
                  Exemplo de IDs de vídeo nas lições:
                </div>
                <ul className="list-disc ml-5">
                  {course.modules?.slice(0, 2).map((module: any, i: number) => (
                    <li key={i}>
                      Módulo {i + 1} ({module.title?.substring(0, 20)}...):
                      <ul className="list-disc ml-5">
                        {module.lessons
                          ?.slice(0, 2)
                          .map((lesson: any, j: number) => (
                            <li key={j}>
                              Lição {j + 1}:
                              {lesson.videoId ||
                                lesson.vimeoId ||
                                lesson.videoPublicId ||
                                "Sem ID de vídeo"}
                            </li>
                          ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
