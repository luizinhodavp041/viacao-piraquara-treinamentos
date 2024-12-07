export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Certificate from "@/models/Certificate";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return new NextResponse("Código de validação é obrigatório", {
        status: 400,
      });
    }

    const certificate = await Certificate.findOne({
      validationCode: code,
      status: "active",
    })
      .populate("user", "name")
      .populate("course", "title");

    if (!certificate) {
      return new NextResponse("Certificado não encontrado", { status: 404 });
    }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Erro ao validar certificado:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
