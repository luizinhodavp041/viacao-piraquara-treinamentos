import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const data = await request.json();
    const courseId = params.id;

    // Validação básica
    if (!data.title || !data.description) {
      return new NextResponse("Título e descrição são obrigatórios", {
        status: 400,
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        title: data.title,
        description: data.description,
      },
      { new: true }
    );

    if (!course) {
      return new NextResponse("Curso não encontrado", { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const courseId = params.id;

    // Busca o curso e seus módulos
    const course = await Course.findById(courseId);
    if (!course) {
      return new NextResponse("Curso não encontrado", { status: 404 });
    }

    // Busca todos os módulos do curso
    const modules = await Module.find({ _id: { $in: course.modules } });

    // Coleta todos os IDs de aulas dos módulos
    const lessonIds = modules.reduce((acc: string[], module) => {
      return [...acc, ...(module.lessons as string[])];
    }, []);

    // Deleta em cascata
    await Lesson.deleteMany({ _id: { $in: lessonIds } }); // Delete todas as aulas
    await Module.deleteMany({ _id: { $in: course.modules } }); // Delete todos os módulos
    await Course.findByIdAndDelete(courseId); // Delete o curso

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao deletar curso:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const courseId = params.id;

    const course = await Course.findById(courseId).populate({
      path: "modules",
      populate: {
        path: "lessons",
      },
    });

    if (!course) {
      return new NextResponse("Curso não encontrado", { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
