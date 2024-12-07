import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Certificate from "@/models/Certificate";
import { getSession } from "@/lib/auth/auth";
import QuizResponse from "@/models/QuizResponse";
import Quiz from "@/models/Quiz";
import User from "@/models/User";
import Course from "@/models/Course";
import { generateCertificatePDF } from "@/lib/services/certificate-service";
import { customAlphabet } from "nanoid";

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

    const certificate = await Certificate.findOne({
      user: session.id,
      course: courseId,
      status: "active",
    }).populate("course", "title");

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Erro ao buscar certificado:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log("Iniciando geração de certificado...");
    await connectDB();

    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const data = await request.json();
    const { courseId } = data;

    if (!courseId) {
      return new NextResponse("ID do curso é obrigatório", { status: 400 });
    }

    // Verifica se já existe certificado
    const existingCertificate = await Certificate.findOne({
      user: session.id,
      course: courseId,
    });

    if (existingCertificate) {
      return new NextResponse("Certificado já existe para este curso", {
        status: 400,
      });
    }

    // Busca dados necessários
    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz) {
      return new NextResponse("Quiz não encontrado", { status: 404 });
    }

    const quizResponse = await QuizResponse.findOne({
      quiz: quiz._id,
      user: session.id,
    }).sort({ completedAt: -1 });

    if (!quizResponse || quizResponse.score < 70) {
      return new NextResponse(
        "Nota mínima não atingida para gerar certificado",
        { status: 400 }
      );
    }

    console.log("Buscando dados do usuário e curso...");
    const user = await User.findById(session.id);
    const course = await Course.findById(courseId);

    // Gera código de validação único
    const generateValidationCode = customAlphabet(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      8
    );
    const validationCode = generateValidationCode();

    // Cria o certificado no banco
    const certificate = await Certificate.create({
      user: session.id,
      course: courseId,
      quizScore: quizResponse.score,
      validationCode,
      status: "active",
    });

    const populatedCertificate = await Certificate.findById(
      certificate._id
    ).populate("course", "title");

    console.log("Certificado gerado com sucesso!");
    return NextResponse.json(populatedCertificate);
  } catch (error) {
    console.error("Erro detalhado ao gerar certificado:", error);
    return new NextResponse(
      "Erro interno do servidor: " + (error as Error).message,
      { status: 500 }
    );
  }
}
