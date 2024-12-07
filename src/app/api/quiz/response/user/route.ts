export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import QuizResponse from "@/models/QuizResponse";
import Quiz from "@/models/Quiz";
import { getSession } from "@/lib/auth/auth";

export async function GET(request: Request) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return new NextResponse("ID do curso é obrigatório", { status: 400 });
    }

    // Primeiro busca o quiz do curso
    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz) {
      return new NextResponse("Quiz não encontrado", { status: 404 });
    }

    // Busca a última resposta do usuário para este quiz
    const response = await QuizResponse.findOne({
      quiz: quiz._id,
      user: session.id,
    })
      .sort({ completedAt: -1 })
      .select("score completedAt")
      .lean();

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar resposta do quiz:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
