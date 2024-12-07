import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Lesson from "@/models/Lesson";
import Module from "@/models/Module";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const lessonId = params.id;
    const data = await request.json();

    // Validação básica
    if (!data.title || !data.description || !data.videoPublicId) {
      return new NextResponse(
        JSON.stringify({
          message: "Todos os campos são obrigatórios",
        }),
        { status: 400 }
      );
    }

    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        title: data.title,
        description: data.description,
        videoPublicId: data.videoPublicId,
      },
      { new: true }
    );

    if (!lesson) {
      return new NextResponse(
        JSON.stringify({
          message: "Aula não encontrada",
        }),
        { status: 404 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error("Erro ao atualizar aula:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Erro interno do servidor",
        error: error?.message,
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const lessonId = params.id;

    // Busca a aula
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return new NextResponse(
        JSON.stringify({
          message: "Aula não encontrada",
        }),
        { status: 404 }
      );
    }

    // Remove a aula do módulo
    await Module.findByIdAndUpdate(lesson.module, {
      $pull: { lessons: lessonId },
    });

    // Deleta a aula
    await Lesson.findByIdAndDelete(lessonId);

    // TODO: Poderíamos também deletar o vídeo do Cloudinary aqui

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Erro ao deletar aula:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Erro interno do servidor",
        error: error?.message,
      }),
      { status: 500 }
    );
  }
}
