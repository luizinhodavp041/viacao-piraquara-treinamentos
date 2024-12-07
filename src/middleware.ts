import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  // Se já estiver logado e tentar acessar /login, redireciona
  if (pathname === "/login" && token) {
    try {
      const session = await decrypt(token.value);
      // Redireciona admin para dashboard e student para home
      return NextResponse.redirect(
        new URL(
          session.role === "admin" ? "/admin/dashboard" : "/home",
          request.url
        )
      );
    } catch {
      // Se token for inválido, remove o cookie e deixa acessar login
      return NextResponse.next();
    }
  }

  // Rotas públicas
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Sem token, redireciona para login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const session = await decrypt(token.value);

    // Protege rotas admin
    if (pathname.startsWith("/admin") && session.role !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    // Protege rotas student
    if (pathname.startsWith("/home") && session.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    // Se token for inválido, redireciona para login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/login", "/home/:path*", "/admin/:path*"],
};
