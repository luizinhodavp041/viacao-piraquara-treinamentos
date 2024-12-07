import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const data = await request.json();
    const userId = params.id;

    // Verifica se email já existe em outro usuário
    const existingUser = await User.findOne({
      email: data.email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      return new NextResponse("Email já cadastrado", { status: 400 });
    }

    // Prepara dados para atualização
    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
    };

    // Se uma nova senha foi fornecida, faz o hash
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Atualiza o usuário
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = params.id;

    // Não permite deletar o próprio usuário
    // TODO: Implementar verificação do usuário logado

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
