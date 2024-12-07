import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Module from "@/models/Module";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { moduleIds } = await request.json();

    // Atualiza a ordem de cada módulo
    for (let i = 0; i < moduleIds.length; i++) {
      await Module.findByIdAndUpdate(moduleIds[i], { order: i });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao reordenar módulos:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
