// src/app/api/progress/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Progress from "@/models/Progress";

export async function POST(request: Request) {
  try {
    // Conectar ao banco de dados
    await dbConnect();

    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter ID do usuário do session
    const userId = session.user.id;

    // Obter dados do corpo da requisição
    const data = await request.json();
    const { lesson, course, progress } = data;

    // Validar dados obrigatórios
    if (!lesson || !course || progress === undefined) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Buscar progresso existente para atualizar ou criar um novo
    let progressRecord = await Progress.findOne({
      user: userId,
      lesson: lesson,
      course: course,
    });

    if (progressRecord) {
      // Atualizar apenas se o novo progresso for maior que o existente
      if (progress > progressRecord.progress) {
        progressRecord.progress = progress;
        progressRecord.updatedAt = new Date();
        await progressRecord.save();
      }
    } else {
      // Criar novo registro de progresso
      progressRecord = await Progress.create({
        user: userId,
        lesson: lesson,
        course: course,
        progress: progress,
        completed: progress >= 100,
      });
    }

    return NextResponse.json(progressRecord);
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json(
      { error: "Falha ao processar solicitação" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Conectar ao banco de dados
    await dbConnect();

    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter ID do usuário do session
    const userId = session.user.id;

    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    // Verificar se courseId foi fornecido
    if (!courseId) {
      return NextResponse.json(
        { error: "ID do curso é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar progresso do usuário para o curso especificado
    const progress = await Progress.find({
      user: userId,
      course: courseId,
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Erro ao buscar progresso:", error);
    return NextResponse.json(
      { error: "Falha ao processar solicitação" },
      { status: 500 }
    );
  }
}
