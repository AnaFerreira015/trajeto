import { dayKey, monthKeyOf } from "./dates";
import type { LatLng, MonthKey, TimelineEvent } from "./types";

/** Eventos que interceptam (mesmo que parcialmente) o mês informado. */
export function filterByMonth(events: TimelineEvent[], month: MonthKey): TimelineEvent[] {
  const monthStart = new Date(month.year, month.month, 1).getTime();
  const monthEnd = new Date(month.year, month.month + 1, 1).getTime();
  return sortChronologically(
    events.filter((event) => event.start.getTime() < monthEnd && event.end.getTime() >= monthStart),
  );
}

export function sortChronologically(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
}

export interface DayGroup {
  key: string;
  date: Date;
  events: TimelineEvent[];
}

/** Agrupa eventos por dia (pelo horário de início, no fuso local). */
export function groupByDay(events: TimelineEvent[]): DayGroup[] {
  const groups = new Map<string, TimelineEvent[]>();
  for (const event of sortChronologically(events)) {
    const key = dayKey(event.start);
    const bucket = groups.get(key);
    if (bucket) bucket.push(event);
    else groups.set(key, [event]);
  }
  return [...groups.entries()]
    .map(([key, dayEvents]) => ({
      key,
      date: dayEvents[0]!.start,
      events: dayEvents,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export interface MonthSummary {
  totalDistanceMeters: number;
  tripCount: number;
  visitCount: number;
  dayCount: number;
}

export function summarize(events: TimelineEvent[]): MonthSummary {
  let totalDistanceMeters = 0;
  let tripCount = 0;
  let visitCount = 0;
  const days = new Set<string>();
  for (const event of events) {
    days.add(dayKey(event.start));
    if (event.kind === "trip") {
      tripCount += 1;
      totalDistanceMeters += event.distanceMeters ?? 0;
    }
    if (event.kind === "visit") visitCount += 1;
  }
  return { totalDistanceMeters, tripCount, visitCount, dayCount: days.size };
}

/** Todos os pontos geográficos usados por um conjunto de eventos. */
export function collectPoints(events: TimelineEvent[]): LatLng[] {
  const points: LatLng[] = [];
  for (const event of events) {
    if (event.kind === "visit") points.push(event.location);
    if (event.kind === "trip") points.push(event.from, event.to);
    if (event.kind === "path") points.push(...event.points);
  }
  return points;
}

export function monthOfEvent(event: TimelineEvent): string {
  return monthKeyOf(event.start);
}
