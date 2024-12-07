import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({})
      .select("-password") // Exclui o campo password
      .sort({ createdAt: -1 }); // Ordena por data de criação, mais recente primeiro

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const data = await request.json();

    // Verifica se email já existe
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return new NextResponse("Email já cadastrado", { status: 400 });
    }

    // Hash da senha
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Cria o usuário
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    // Retorna o usuário sem a senha
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
