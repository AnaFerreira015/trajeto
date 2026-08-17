import type { MonthKey, TimelineEvent } from "./types";

/** Converte data ISO (com offset) em Date. Retorna null se inválida. */
export function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function durationInMinutes(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

/** "2h 15min", "45min", "1 dia 3h" */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "menos de 1min";
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.round(minutes % 60);
  const parts: string[] = [];
  if (days > 0) parts.push(days === 1 ? "1 dia" : `${days} dias`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0 && days === 0) parts.push(`${mins}min`);
  return parts.join(" ") || "menos de 1min";
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

/** Chave local do dia: "2026-01-05" */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Chave local do mês: "2026-01" */
export function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function monthLabel(year: number, month: number): string {
  const label = new Date(year, month, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function dateFromDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Todos os meses realmente presentes nos eventos, do mais antigo ao mais recente. */
export function listMonths(events: TimelineEvent[]): MonthKey[] {
  const found = new Map<string, MonthKey>();
  for (const event of events) {
    for (const cursor of monthsBetween(event.start, event.end)) {
      found.set(cursor.key, cursor);
    }
  }
  return [...found.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function monthsBetween(start: Date, end: Date): MonthKey[] {
  const result: MonthKey[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor.getTime() <= last.getTime()) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    result.push({
      key: `${year}-${pad(month + 1)}`,
      year,
      month,
      label: monthLabel(year, month),
    });
    cursor.setMonth(cursor.getMonth() + 1);
    if (result.length > 1200) break;
  }
  return result;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
