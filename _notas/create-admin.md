import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    // Verifica se já existe um admin
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return new NextResponse("Admin já existe", { status: 400 });
    }

    // Cria senha hash
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Cria usuário admin
    const admin = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json({
      message: "Admin criado com sucesso",
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
