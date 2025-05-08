// src/middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Obter o caminho da URL
  const path = request.nextUrl.pathname;

  // Verificar se o caminho é público
  const isPublicPath =
    path === "/login" || path === "/register" || path === "/";

  // Obter o token da sessão
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Se o caminho é público e o usuário está logado, redirecionar para home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Se o caminho não é público e o usuário não está logado, redirecionar para login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se for um caminho admin, verificar se o usuário tem a role admin
  if (path.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Permitir a requisição a continuar
  return NextResponse.next();
}

// Configurar quais caminhos o middleware deve ser executado
export const config = {
  matcher: [
    // Aplicar a todos os caminhos, exceto _next, api, e arquivos estáticos
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
