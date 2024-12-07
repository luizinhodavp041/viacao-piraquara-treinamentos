export const dynamic = "force-dynamic";

// src/app/api/certificates/download/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Certificate from "@/models/Certificate";
import { getSession } from "@/lib/auth/auth";
import { generateCertificatePDF } from "@/lib/services/certificate-service";
import User from "@/models/User";
import Course from "@/models/Course";

export async function GET(request: Request) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get("certificateId");

    if (!certificateId) {
      return new NextResponse("ID do certificado é obrigatório", {
        status: 400,
      });
    }

    const certificate = await Certificate.findById(certificateId)
      .populate("user")
      .populate("course");

    if (!certificate) {
      return new NextResponse("Certificado não encontrado", { status: 404 });
    }

    // Verifica se o usuário tem acesso a este certificado
    if (certificate.user._id.toString() !== session.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Gera o PDF
    const pdf = await generateCertificatePDF({
      studentName: certificate.user.name,
      courseName: certificate.course.title,
      completionDate: certificate.issuedAt,
      validationCode: certificate.validationCode,
      quizScore: certificate.quizScore,
      courseHours: certificate.course.hours || 10,
    });

    // Retorna o PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado-${certificate.course.title
          .toLowerCase()
          .replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
