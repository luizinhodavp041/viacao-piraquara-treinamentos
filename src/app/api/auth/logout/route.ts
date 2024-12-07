import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logout realizado com sucesso",
    });

    // Remove o cookie de autenticação
    response.cookies.delete("token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
