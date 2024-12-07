import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Permitir que rotas da API sejam dinâmicas
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Excluir rotas estáticas
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
