import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { getSession } from "@/lib/auth/auth";

export async function PATCH(
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

    const data = await request.json();

    // Atualiza o status do usuário
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { status: data.status },
      { new: true }
    );

    if (!updatedUser) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
