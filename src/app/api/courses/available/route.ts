export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Course from "@/models/Course";
import Progress from "@/models/Progress";
import { getSession } from "@/lib/auth/auth";

interface Module {
  lessons: any[];
}

export async function GET() {
  try {
    await connectDB();

    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Busca todos os cursos com seus módulos e aulas
    const courses = await Course.find().populate({
      path: "modules",
      populate: {
        path: "lessons",
      },
    });

    // Para cada curso, calcula o progresso do usuário
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        // Calcula total de aulas do curso
        const totalLessons = course.modules.reduce(
          (total: number, module: Module) => total + module.lessons.length,
          0
        );

        // Busca aulas completadas deste curso
        const completedLessons = await Progress.countDocuments({
          user: session.id,
          course: course._id,
          completed: true,
        });

        // Busca última aula assistida
        const lastProgress = await Progress.findOne({
          user: session.id,
          course: course._id,
        })
          .sort({ updatedAt: -1 })
          .select("updatedAt");

        // Calcula percentual de conclusão
        const percentComplete =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        // Retorna curso com informações de progresso
        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          modules: course.modules,
          progress: {
            completedLessons,
            totalLessons,
            percentComplete,
            lastWatched: lastProgress?.updatedAt || null,
          },
        };
      })
    );

    // Ordena os cursos: em progresso primeiro, depois não iniciados
    const sortedCourses = coursesWithProgress.sort((a, b) => {
      // Cursos em progresso vêm primeiro
      if (a.progress.percentComplete > 0 && b.progress.percentComplete === 0)
        return -1;
      if (a.progress.percentComplete === 0 && b.progress.percentComplete > 0)
        return 1;

      // Entre cursos em progresso, ordena por último acesso
      if (a.progress.lastWatched && b.progress.lastWatched) {
        return (
          new Date(b.progress.lastWatched).getTime() -
          new Date(a.progress.lastWatched).getTime()
        );
      }

      // Mantém a ordem original para cursos não iniciados
      return 0;
    });

    return NextResponse.json(sortedCourses);
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
