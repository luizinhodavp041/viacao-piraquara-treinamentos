import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Module from "@/models/Module";

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

    return NextResponse.json(module.lessons);
  } catch (error) {
    console.error("Erro ao buscar aulas:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
