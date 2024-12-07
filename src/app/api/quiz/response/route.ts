import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import QuizResponse from "@/models/QuizResponse";
import Quiz from "@/models/Quiz";
import User from "@/models/User";
import { getSession } from "@/lib/auth/auth";

interface ResponseGroup {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  quiz: {
    _id: string;
    course: {
      _id: string;
      title: string;
    } | null;
  };
  score: number;
  completedAt: string;
  answers: any[];
}

export async function GET(request: Request) {
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

    // Verifica se há filtro por curso
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    // Busca todas as respostas para poder calcular tentativas
    let baseQuery = {};
    if (courseId) {
      const quizzes = await Quiz.find({ course: courseId });
      const quizIds = quizzes.map((quiz) => quiz._id);
      baseQuery = { quiz: { $in: quizIds } };
    }

    const allResponses = await QuizResponse.find(baseQuery)
      .populate("user", "name email")
      .populate({
        path: "quiz",
        populate: {
          path: "course",
          select: "title",
        },
      })
      .sort({ completedAt: -1 });

    // Filtra respostas sem quiz ou curso válido
    const validResponses = allResponses.filter(
      (response) => response.quiz && response.quiz.course
    );

    // Agrupa respostas por usuário e quiz
    const responseGroups = validResponses.reduce<
      Record<string, ResponseGroup[]>
    >((groups, response) => {
      const key = `${response.user._id}-${response.quiz._id}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(response.toObject());
      return groups;
    }, {});

    // Processa cada grupo para encontrar a resposta aprovada e contar tentativas
    const processedResponses = Object.values(responseGroups).map(
      (group: ResponseGroup[]) => {
        // Ordena respostas por data
        const sortedResponses = group.sort(
          (a, b) =>
            new Date(a.completedAt).getTime() -
            new Date(b.completedAt).getTime()
        );

        // Encontra a primeira resposta aprovada
        const passedResponseIndex = sortedResponses.findIndex(
          (r) => r.score >= 70
        );
        const finalResponse =
          passedResponseIndex !== -1
            ? sortedResponses[passedResponseIndex]
            : sortedResponses[sortedResponses.length - 1];

        // Formata a resposta
        return {
          _id: finalResponse._id,
          user: {
            name: finalResponse.user?.name || "Usuário não encontrado",
            email: finalResponse.user?.email || "",
          },
          quiz: {
            course: finalResponse.quiz?.course
              ? {
                  _id: finalResponse.quiz.course._id,
                  title: finalResponse.quiz.course.title,
                }
              : null,
          },
          score: finalResponse.score,
          completedAt: finalResponse.completedAt,
          answers: finalResponse.answers,
          attemptsBeforePass:
            passedResponseIndex !== -1
              ? passedResponseIndex + 1
              : sortedResponses.length,
        };
      }
    );

    // Ordena por data de conclusão (mais recentes primeiro)
    const sortedResponses = processedResponses.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    return NextResponse.json(sortedResponses);
  } catch (error) {
    console.error("Erro ao buscar respostas:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const data = await request.json();

    // Validação básica
    if (!data.quizId || !data.answers) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    // Busca o quiz e valida se existe e tem um curso associado
    const quiz = await Quiz.findById(data.quizId).populate("course");
    if (!quiz) {
      return new NextResponse("Quiz não encontrado", { status: 404 });
    }

    if (!quiz.course) {
      return new NextResponse("Quiz sem curso associado", { status: 400 });
    }

    // Calcula a pontuação
    let correctAnswers = 0;
    const answersWithResults = data.answers.map(
      (answer: any, index: number) => {
        const isCorrect =
          answer.selectedAnswer === quiz.questions[index].correctAnswer;
        if (isCorrect) correctAnswers++;
        return {
          ...answer,
          isCorrect,
        };
      }
    );

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Salva a resposta
    const response = await QuizResponse.create({
      quiz: data.quizId,
      user: session.id,
      answers: answersWithResults,
      score,
      completedAt: new Date(),
    });

    // Popula os dados para retorno com validação
    const populatedResponse = await QuizResponse.findById(response._id)
      .populate("user", "name email")
      .populate({
        path: "quiz",
        populate: {
          path: "course",
          select: "title",
        },
      });

    if (!populatedResponse) {
      return new NextResponse("Erro ao criar resposta", { status: 500 });
    }

    // Garante formato consistente na resposta
    const formattedResponse = {
      _id: populatedResponse._id,
      user: {
        name: populatedResponse.user?.name || "Usuário não encontrado",
        email: populatedResponse.user?.email || "",
      },
      quiz: {
        course: populatedResponse.quiz?.course
          ? {
              _id: populatedResponse.quiz.course._id,
              title: populatedResponse.quiz.course.title,
            }
          : null,
      },
      score: populatedResponse.score,
      completedAt: populatedResponse.completedAt,
      answers: populatedResponse.answers,
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Erro ao salvar resposta:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
