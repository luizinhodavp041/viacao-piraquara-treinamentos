import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { encrypt } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Busca usuário
    const user = await User.findOne({ email });
    if (!user) {
      return new NextResponse("Credenciais inválidas", { status: 401 });
    }

    // Verifica senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return new NextResponse("Credenciais inválidas", { status: 401 });
    }

    // Gera token
    const token = await encrypt({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Configura cookie com o token
    const response = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
