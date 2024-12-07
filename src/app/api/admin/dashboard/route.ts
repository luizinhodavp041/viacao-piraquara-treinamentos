export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import User from "@/models/User";
import Progress from "@/models/Progress";
import { getSession } from "@/lib/auth/auth";

interface ModuleType {
  lessons: any[];
}

interface CourseType {
  _id: string;
  title: string;
  modules: ModuleType[];
}

// Função auxiliar para calcular atividade recente (últimos 30 dias)
function isRecent(date: Date) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return date >= thirtyDaysAgo;
}

export async function GET() {
  try {
    console.log("=== Iniciando rota do dashboard admin ===");
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

    // Busca dados básicos
    const [users, courses, progress] = await Promise.all([
      User.find({ role: "student" }),
      Course.find().populate({
        path: "modules",
        model: Module,
        populate: {
          path: "lessons",
          model: Lesson,
        },
      }),
      Progress.find().populate(["user", "course"]),
    ]);

    // Calcula total de aulas
    const totalLessons = courses.reduce((total: number, course: CourseType) => {
      return (
        total +
        course.modules.reduce((moduleTotal: number, module: ModuleType) => {
          return moduleTotal + (module.lessons?.length || 0);
        }, 0)
      );
    }, 0);

    // Calcula progresso dos alunos
    const studentProgress = {
      active: 0,
      inactive: 0,
      completed: 0,
    };

    // Mapeia atividade por aluno
    const studentActivity = new Map();
    progress.forEach((p) => {
      if (!studentActivity.has(p.user._id.toString())) {
        studentActivity.set(p.user._id.toString(), []);
      }
      studentActivity.get(p.user._id.toString()).push(p.updatedAt);
    });

    // Calcula status de cada aluno
    users.forEach((user) => {
      const activities = studentActivity.get(user._id.toString()) || [];
      const hasRecentActivity = activities.some((date: Date) =>
        isRecent(new Date(date))
      );

      if (activities.length === 0) {
        studentProgress.inactive++;
      } else if (hasRecentActivity) {
        studentProgress.active++;
      } else {
        studentProgress.inactive++;
      }
    });

    // Calcula engajamento por curso
    const courseEngagement = await Promise.all(
      courses.map(async (course: CourseType) => {
        const totalStudentsInCourse = await Progress.countDocuments({
          course: course._id,
        });

        const totalLessonsInCourse = course.modules.reduce(
          (total: number, module: ModuleType) =>
            total + (module.lessons?.length || 0),
          0
        );

        const completedLessons = await Progress.countDocuments({
          course: course._id,
          completed: true,
        });

        const completionRate =
          totalLessonsInCourse > 0
            ? Math.round(
                (completedLessons /
                  (totalLessonsInCourse * totalStudentsInCourse)) *
                  100
              )
            : 0;

        return {
          courseName: course.title,
          totalStudents: totalStudentsInCourse,
          completionRate,
        };
      })
    );

    // Busca atividades recentes
    const recentActivities = await Progress.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate(["user", "course"])
      .then((activities) =>
        activities.map((activity) => ({
          studentName: activity.user.name,
          action: activity.completed
            ? "completou uma aula"
            : "iniciou uma aula",
          courseName: activity.course.title,
          date: activity.updatedAt,
        }))
      );

    // Calcula total de conclusões de curso
    const totalCompletions = await Progress.aggregate([
      {
        $group: {
          _id: {
            user: "$user",
            course: "$course",
          },
          completedLessons: {
            $sum: { $cond: ["$completed", 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id.course",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      {
        $match: {
          courseInfo: { $ne: [] },
        },
      },
    ]).then((results) => {
      return results.filter((result) => {
        const course = result.courseInfo[0] as CourseType;
        const totalLessons = course.modules.reduce(
          (total: number, module: ModuleType) =>
            total + (module.lessons?.length || 0),
          0
        );
        return result.completedLessons === totalLessons;
      }).length;
    });

    return NextResponse.json({
      totalStudents: users.length,
      totalCourses: courses.length,
      totalLessons,
      totalCompletions,
      studentProgress,
      courseEngagement: courseEngagement.sort(
        (a, b) => b.totalStudents - a.totalStudents
      ),
      recentActivities,
    });
  } catch (error) {
    console.error("Erro no dashboard admin:", error);
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
