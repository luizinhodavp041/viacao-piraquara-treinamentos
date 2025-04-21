// src/app/api/lessons/route.ts (atualizado)
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Lesson from "@/models/Lesson";
import Module from "@/models/Module";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();
    
    // Validação básica
    if (!data.title || !data.videoPublicId || !data.moduleId) {
      return NextResponse.json(
        { message: "Dados incompletos. Título, vídeo e módulo são obrigatórios." },
        { status: 400 }
      );
    }

    // Verificar se o módulo existe
    const module = await Module.findById(data.moduleId);
    if (!module) {
      return NextResponse.json(
        { message: "Módulo não encontrado" },
        { status: 404 }
      );
    }

    // Encontrar a ordem máxima atual para ordenar corretamente
    const maxOrderLesson = await Lesson.findOne({ module: data.moduleId })
      .sort({ order: -1 })
      .limit(1);
    
    const nextOrder = maxOrderLesson ? maxOrderLesson.order + 1 : 0;

    // Criar nova aula
    const newLesson = new Lesson({
      title: data.title,
      description: data.description || "",
      videoPublicId: data.videoPublicId,
      videoSource: data.videoSource || "cloudinary",
      module: data.moduleId,
      courseId: module.course, // Adicionar courseId do módulo
      order: nextOrder,
      isPublished: false,
      // Se for vimeo, também definir vimeoId para compatibilidade
      vimeoId: data.videoSource === "vimeo" ? data.videoPublicId : null
    });

    // Salvar a aula
    const savedLesson = await newLesson.save();

    // IMPORTANTE: Adicionar a aula ao módulo
    await Module.findByIdAndUpdate(data.moduleId, {
      $push: { lessons: savedLesson._id }
    });

    return NextResponse.json(savedLesson, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar aula:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 500 }
    );
  }
}