import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Quiz from "@/models/Quiz";
import Course from "@/models/Course";
import { getSession } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    await connectDB();

    // Verifica se é admin
    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const data = await request.json();

    // Valida dados obrigatórios
    if (!data.courseId || !data.questions || !data.questions.length) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    // Verifica se o curso existe
    const course = await Course.findById(data.courseId);
    if (!course) {
      return new NextResponse("Curso não encontrado", { status: 404 });
    }

    // Verifica se já existe um quiz para este curso
    const existingQuiz = await Quiz.findOne({ course: data.courseId });
    if (existingQuiz) {
      return new NextResponse("Já existe um quiz para este curso", {
        status: 400,
      });
    }

    // Cria o quiz
    const quiz = await Quiz.create({
      course: data.courseId,
      questions: data.questions,
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Erro ao criar quiz:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return new NextResponse("ID do curso é obrigatório", { status: 400 });
    }

    const quiz = await Quiz.findOne({ course: courseId });

    return NextResponse.json(quiz || null);
  } catch (error) {
    console.error("Erro ao buscar quiz:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
