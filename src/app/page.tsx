import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/auth/auth";

export default async function RootPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  // Se não tiver token, redireciona para login
  if (!token) {
    redirect("/login");
  }

  try {
    // Verifica o papel do usuário e redireciona adequadamente
    const session = await decrypt(token.value);

    if (session.role === "admin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/home");
    }
  } catch {
    // Se o token for inválido, redireciona para login
    redirect("/login");
  }

  return null; // Nunca será renderizado devido aos redirecionamentos
}
