import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Course from "@/models/Course";

export async function GET() {
  try {
    await connectDB();

    const courses = await Course.find({}).sort({ createdAt: -1 });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const data = await request.json();

    // Validação básica
    if (!data.title || !data.description) {
      return new NextResponse("Título e descrição são obrigatórios", {
        status: 400,
      });
    }

    // Cria o curso
    const course = await Course.create({
      title: data.title,
      description: data.description,
      modules: [], // Inicialmente sem módulos
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
