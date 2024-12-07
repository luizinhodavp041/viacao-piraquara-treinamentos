import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Module from "@/models/Module";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const moduleId = params.id;

    const module = await Module.findById(moduleId).populate({
      path: "lessons",
      options: { sort: { order: 1 } },
    });

    if (!module) {
      return new NextResponse("Módulo não encontrado", { status: 404 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error("Erro ao buscar módulo:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const moduleId = params.id;
    const data = await request.json();

    // Validação básica
    if (!data.title || !data.description) {
      return new NextResponse("Título e descrição são obrigatórios", {
        status: 400,
      });
    }

    const module = await Module.findByIdAndUpdate(
      moduleId,
      {
        title: data.title,
        description: data.description,
      },
      { new: true }
    );

    if (!module) {
      return new NextResponse("Módulo não encontrado", { status: 404 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error("Erro ao atualizar módulo:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const moduleId = params.id;

    // Busca o módulo
    const module = await Module.findById(moduleId);
    if (!module) {
      return new NextResponse("Módulo não encontrado", { status: 404 });
    }

    // Remove o módulo do curso
    await Course.findByIdAndUpdate(module.course, {
      $pull: { modules: moduleId },
    });

    // Deleta todas as aulas do módulo
    if (module.lessons?.length) {
      await Lesson.deleteMany({ _id: { $in: module.lessons } });
    }

    // Deleta o módulo
    await Module.findByIdAndDelete(moduleId);

    // Reordena os módulos restantes
    const remainingModules = await Module.find({ course: module.course }).sort({
      order: 1,
    });

    for (let i = 0; i < remainingModules.length; i++) {
      await Module.findByIdAndUpdate(remainingModules[i]._id, { order: i });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao deletar módulo:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
