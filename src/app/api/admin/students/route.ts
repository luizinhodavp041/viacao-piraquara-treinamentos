export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Progress from "@/models/Progress";
import { getSession } from "@/lib/auth/auth";
import Course from "@/models/Course";

export async function GET() {
  try {
    await connectDB();

    // Verifica se é admin
    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const user = await User.findById(session.id);
    if (!user || user.role !== "admin") {
      return new NextResponse("Acesso negado", { status: 403 });
    }

    // Busca todos os estudantes
    const students = await User.find({ role: "student" });

    // Busca o progresso de cada estudante
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        const progress = await Progress.find({ user: student._id });
        const courses = await Course.find();

        const lastAccess =
          progress.length > 0
            ? progress.reduce(
                (latest, p) => (p.updatedAt > latest ? p.updatedAt : latest),
                progress[0].updatedAt
              )
            : null;

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          createdAt: student.createdAt,
          status: student.status || "active",
          progress: {
            totalCourses: courses.length,
            completedCourses: progress.length,
            lastAccess,
            totalLessonsCompleted: progress.filter((p) => p.completed).length,
          },
        };
      })
    );

    return NextResponse.json(studentsWithProgress);
  } catch (error) {
    console.error("Erro ao listar estudantes:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
