import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";
import Progress from "@/models/Progress";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import { getSession } from "@/lib/auth/auth";

interface ModuleType {
  lessons: any[];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verifica se é admin
    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const admin = await User.findById(session.id);
    if (!admin || admin.role !== "admin") {
      return new NextResponse("Acesso negado", { status: 403 });
    }

    // Busca todos os cursos com seus módulos e aulas
    const courses = await Course.find().populate({
      path: "modules",
      model: Module,
      populate: {
        path: "lessons",
        model: Lesson,
      },
    });

    // Calcula o progresso para cada curso
    const courseProgress = await Promise.all(
      courses.map(async (course) => {
        const totalLessons = course.modules.reduce(
          (total: number, module: ModuleType) =>
            total + (module.lessons?.length || 0),
          0
        );

        const progress = await Progress.find({
          user: params.id,
          course: course._id,
          completed: true,
        }).sort({ updatedAt: -1 });

        const lastAccess = progress[0]?.updatedAt;

        return {
          courseId: course._id,
          courseName: course.title,
          completedLessons: progress.length,
          totalLessons,
          percentComplete: Math.round((progress.length / totalLessons) * 100),
          lastAccess,
        };
      })
    );

    return NextResponse.json({ courseProgress });
  } catch (error) {
    console.error("Erro ao buscar progresso:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
