// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatar tempo em minutos e segundos (MM:SS)
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Extrair ID numérico do Vimeo de diferentes formatos
export function extractVimeoId(input: string): string | null {
  // Se já for um ID numérico
  if (/^\d+$/.test(input)) {
    return input;
  }

  // Tentar extrair de URL
  const urlMatch = input.match(
    /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/
  );
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // Tentar extrair qualquer sequência de números que pareça um ID
  const numbersMatch = input.match(/\d{6,}/);
  if (numbersMatch && numbersMatch[0]) {
    return numbersMatch[0];
  }

  return null;
}

// Obter URL de thumbnail do Vimeo com base no ID
export function getVimeoThumbnail(
  vimeoId: string,
  size: "small" | "medium" | "large" = "large"
): string {
  // Fallback para um placeholder se não tiver ID
  if (!vimeoId) {
    return `https://placehold.co/640x360?text=Video`;
  }

  // URL do serviço de thumbnails do Vimeo
  return `https://vumbnail.com/${vimeoId}_${size}.jpg`;
}
