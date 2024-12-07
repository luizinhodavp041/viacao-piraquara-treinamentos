import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Module from "@/models/Module";
import Course from "@/models/Course";

export async function POST(request: Request) {
  try {
    await connectDB();

    const data = await request.json();
    console.log("Dados recebidos:", data);

    // Validação básica
    if (!data.title || !data.description || !data.courseId) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    // Busca o curso
    const course = await Course.findById(data.courseId);
    if (!course) {
      return new NextResponse("Curso não encontrado", { status: 404 });
    }

    // Determina a ordem do novo módulo
    const lastModule = await Module.findOne({ course: data.courseId }).sort({
      order: -1,
    });
    const order = lastModule ? lastModule.order + 1 : 0;

    // Cria o módulo
    const module = await Module.create({
      title: data.title,
      description: data.description,
      course: data.courseId, // Adiciona a referência ao curso
      order,
      lessons: [], // Inicialmente sem aulas
    });

    // Adiciona o módulo ao curso
    course.modules.push(module._id);
    await course.save();

    return NextResponse.json(module);
  } catch (error: any) {
    console.error("Erro ao criar módulo:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Erro interno do servidor",
        error: error?.message || "Erro desconhecido",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
