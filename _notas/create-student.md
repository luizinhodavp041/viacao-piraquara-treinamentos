import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash("student123", 10);

    const student = await User.create({
      name: "Student Test",
      email: "student@example.com",
      password: hashedPassword,
      role: "student",
    });

    return NextResponse.json({
      message: "Student criado com sucesso",
      student: {
        name: student.name,
        email: student.email,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("Erro ao criar student:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
