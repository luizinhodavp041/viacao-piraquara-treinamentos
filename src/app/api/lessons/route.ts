import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Lesson from "@/models/Lesson";
import Module from "@/models/Module";

export async function POST(request: Request) {
  try {
    await connectDB();

    const data = await request.json();
    console.log("Dados recebidos:", data);

    // Validação básica
    if (
      !data.title ||
      !data.description ||
      !data.moduleId ||
      !data.videoPublicId
    ) {
      return new NextResponse(
        JSON.stringify({
          message: "Todos os campos são obrigatórios",
        }),
        { status: 400 }
      );
    }

    // Busca o módulo
    const module = await Module.findById(data.moduleId);
    if (!module) {
      return new NextResponse(
        JSON.stringify({
          message: "Módulo não encontrado",
        }),
        { status: 404 }
      );
    }

    // Determina a ordem da nova aula
    const lastLesson = await Lesson.findOne({ module: data.moduleId }).sort({
      order: -1,
    });
    const order = lastLesson ? lastLesson.order + 1 : 0;

    // Cria a aula com o novo campo videoSource
    const lesson = await Lesson.create({
      title: data.title,
      description: data.description,
      videoPublicId: data.videoPublicId,
      videoSource: data.videoSource || "cloudinary", // Valor padrão para manter compatibilidade
      module: data.moduleId,
      course: module.course,
      order,
    });

    // Adiciona a aula ao módulo
    module.lessons = module.lessons || [];
    module.lessons.push(lesson._id);
    await module.save();

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error("Erro ao criar aula:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Erro interno do servidor",
        error: error?.message,
      }),
      { status: 500 }
    );
  }
}

// GET route para listar as aulas
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");

    if (!moduleId) {
      return new NextResponse(
        JSON.stringify({
          message: "ID do módulo é obrigatório",
        }),
        { status: 400 }
      );
    }

    const lessons = await Lesson.find({ module: moduleId }).sort({ order: 1 });
    return NextResponse.json(lessons);
  } catch (error: any) {
    console.error("Erro ao listar aulas:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Erro interno do servidor",
        error: error?.message,
      }),
      { status: 500 }
    );
  }
}
