export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Course from "@/models/Course";
import Module from "@/models/Module"; // Adicione esta importação
import Lesson from "@/models/Lesson"; // Adicione esta importação também
import Progress from "@/models/Progress";
import { getSession } from "@/lib/auth/auth";

interface ModuleType {
  lessons: any[];
}

export async function GET() {
  console.log("=== Iniciando rota do dashboard ===");

  try {
    console.log("Conectando ao MongoDB...");
    await connectDB();

    console.log("Verificando sessão...");
    const session = await getSession();
    console.log("Dados da sessão:", session);

    if (!session?.id) {
      console.log("Usuário não autenticado");
      return new NextResponse(JSON.stringify({ message: "Não autorizado" }), {
        status: 401,
      });
    }

    console.log("Buscando cursos...");
    const courses = await Course.find().populate({
      path: "modules",
      model: Module,
      populate: {
        path: "lessons",
        model: Lesson,
      },
    });

    console.log(`Encontrados ${courses.length} cursos`);

    console.log("Calculando progresso...");
    const coursesProgress = await Promise.all(
      courses.map(async (course) => {
        const totalLessons = course.modules.reduce(
          (total: number, module: ModuleType) =>
            total + (module.lessons?.length || 0),
          0
        );

        const completedLessons = await Progress.countDocuments({
          user: session.id,
          course: course._id,
          completed: true,
        });

        const lastProgress = await Progress.findOne({
          user: session.id,
          course: course._id,
        })
          .sort({ updatedAt: -1 })
          .select("updatedAt");

        const percentComplete =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          course: {
            _id: course._id,
            title: course.title,
            description: course.description,
          },
          completedLessons,
          totalLessons,
          lastWatched: lastProgress?.updatedAt || new Date(),
          percentComplete,
        };
      })
    );

    const stats = {
      totalCourses: courses.length,
      completedLessons: await Progress.countDocuments({
        user: session.id,
        completed: true,
      }),
      inProgress: coursesProgress.filter(
        (p) => p.percentComplete > 0 && p.percentComplete < 100
      ).length,
    };

    const sortedProgress = coursesProgress
      .filter((p) => p.percentComplete > 0)
      .sort(
        (a, b) =>
          new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
      );

    console.log("=== Dashboard gerado com sucesso ===");

    return NextResponse.json({
      coursesProgress: sortedProgress,
      stats,
    });
  } catch (error) {
    console.error("=== Erro no dashboard ===");
    console.error(
      "Tipo do erro:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "Mensagem:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Stack:",
      error instanceof Error ? error.stack : "No stack available"
    );

    return new NextResponse(
      JSON.stringify({
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : String(error),
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
