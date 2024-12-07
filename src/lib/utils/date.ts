// src/lib/utils/date.ts
export function formatDate(date: string | Date) {
  if (!date) return "";

  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
