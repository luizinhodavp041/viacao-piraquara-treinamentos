import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const secretKey = process.env.JWT_SECRET || "";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(token: string): Promise<any> {
  const { payload } = await jwtVerify(token, key);
  return payload;
}

export async function login(token: string) {
  // Primeiro, obtenha o cookieStore aguardando a Promise
  const cookieStore = await cookies();
  // Agora use o método set
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

export async function logout() {
  // Primeiro, obtenha o cookieStore aguardando a Promise
  const cookieStore = await cookies();
  // Agora use o método delete
  cookieStore.delete("token");
}

export async function getSession() {
  // Primeiro, obtenha o cookieStore aguardando a Promise
  const cookieStore = await cookies();
  // Agora use o método get
  const token = cookieStore.get("token");

  if (!token) return null;

  try {
    const session = await decrypt(token.value);
    return session;
  } catch (error) {
    return null;
  }
}
