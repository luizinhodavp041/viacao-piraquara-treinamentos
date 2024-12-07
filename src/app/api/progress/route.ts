import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Progress from "@/models/Progress";
import { getSession } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { lessonId, courseId, completed } = await request.json();

    const progress = await Progress.findOneAndUpdate(
      {
        user: session.id,
        lesson: lessonId,
        course: courseId,
      },
      {
        completed,
        lastWatched: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Erro ao atualizar progresso:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const progress = await Progress.find({
      user: session.id,
      ...(courseId && { course: courseId }),
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Erro ao buscar progresso:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
