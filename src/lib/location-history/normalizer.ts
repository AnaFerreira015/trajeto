import { parseGeoPoint } from "./coordinates";
import { durationInMinutes, parseIsoDate } from "./dates";
import type { LatLng, RawRecord, RawTimelinePathPoint, TimelineEvent, VisitEvent } from "./types";

/** Converte um registro bruto do Google no modelo interno. Retorna null se inutilizável. */
export function normalizeRecord(record: RawRecord, index: number): TimelineEvent | null {
  const start = parseIsoDate(record.startTime);
  const end = parseIsoDate(record.endTime) ?? start;
  if (!start || !end) return null;
  const durationMinutes = durationInMinutes(start, end);

  if (record.visit) {
    const location = parseGeoPoint(record.visit.topCandidate?.placeLocation);
    if (!location) return null;
    return {
      kind: "visit",
      id: `visit-${index}`,
      start,
      end,
      durationMinutes,
      location,
      semanticType: record.visit.topCandidate?.semanticType,
      hierarchyLevel: Number(record.visit.hierarchyLevel ?? "0") || 0,
      probability: toProbability(
        record.visit.topCandidate?.probability ?? record.visit.probability,
      ),
      placeId: record.visit.topCandidate?.placeID ?? record.visit.topCandidate?.placeId,
    };
  }

  if (record.activity) {
    const from = parseGeoPoint(record.activity.start);
    const to = parseGeoPoint(record.activity.end);
    if (!from || !to) return null;
    const distance = Number(record.activity.distanceMeters);
    return {
      kind: "trip",
      id: `trip-${index}`,
      start,
      end,
      durationMinutes,
      from,
      to,
      distanceMeters: Number.isFinite(distance) ? distance : undefined,
      transportType: record.activity.topCandidate?.type,
      probability: toProbability(
        record.activity.topCandidate?.probability ?? record.activity.probability,
      ),
    };
  }

  if (Array.isArray(record.timelinePath)) {
    const points = [...record.timelinePath]
      .map((point) => ({
        offset: pointOffsetMinutes(point, start),
        coords: parseGeoPoint(point?.point),
      }))
      .filter((point): point is { offset: number; coords: LatLng } => point.coords !== null)
      .sort((a, b) => a.offset - b.offset)
      .map((point) => point.coords);
    if (points.length === 0) return null;
    return { kind: "path", id: `path-${index}`, start, end, durationMinutes, points };
  }

  return null;
}

export function normalizeRecords(records: RawRecord[]): TimelineEvent[] {
  const events = records
    .map((record, index) => normalizeRecord(record, index))
    .filter((event): event is TimelineEvent => event !== null);
  return dedupeVisits(events).sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Ignora visitas secundárias (hierarchyLevel != "0") quando existe uma visita
 * principal equivalente no mesmo intervalo de tempo.
 */
function dedupeVisits(events: TimelineEvent[]): TimelineEvent[] {
  const primaryIntervals = events
    .filter((event): event is VisitEvent => event.kind === "visit" && event.hierarchyLevel === 0)
    .map((event) => [event.start.getTime(), event.end.getTime()] as const);

  return events.filter((event) => {
    if (event.kind !== "visit" || event.hierarchyLevel === 0) return true;
    const startMs = event.start.getTime();
    const endMs = event.end.getTime();
    return !primaryIntervals.some(([ps, pe]) => startMs >= ps - 60000 && endMs <= pe + 60000);
  });
}

function toProbability(value: string | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed > 1 ? parsed / 100 : parsed;
}

const TRANSPORT_LABELS: Record<string, string> = {
  "in passenger vehicle": "Carro",
  "in vehicle": "Veículo",
  driving: "Carro",
  walking: "Caminhada",
  "on foot": "A pé",
  running: "Corrida",
  cycling: "Bicicleta",
  "in bus": "Ônibus",
  "in train": "Trem",
  "in subway": "Metrô",
  "in tram": "Bonde",
  "in ferry": "Barco",
  flying: "Avião",
  motorcycling: "Moto",
  "in taxi": "Táxi",
  "in rideshare": "Transporte por app",
  unknown: "Deslocamento",
};

/** Rótulo amigável em português para um tipo de transporte do Google. */
export function transportLabel(type: string | undefined): string {
  if (!type) return "Deslocamento";
  const normalized = type.toLowerCase().replace(/_/g, " ");
  return TRANSPORT_LABELS[normalized] ?? "Deslocamento";
}

const SEMANTIC_LABELS: Record<string, string> = {
  home: "Casa",
  work: "Trabalho",
  "searched address": "Endereço pesquisado",
  "inferred home": "Casa",
  "inferred work": "Trabalho",
  unknown: "Local visitado",
};

/** Rótulo amigável em português para o tipo de local. */
export function placeLabel(semanticType: string | undefined): string {
  if (!semanticType) return "Local visitado";
  const normalized = semanticType.toLowerCase().replace(/_/g, " ");
  return SEMANTIC_LABELS[normalized] ?? "Local visitado";
}

function pointOffsetMinutes(point: RawTimelinePathPoint | undefined, start: Date): number {
  const offset = Number(point?.durationMinutesOffsetFromStartTime);
  if (Number.isFinite(offset)) return offset;
  const time = parseIsoDate(point?.time);
  if (time) return (time.getTime() - start.getTime()) / 60000;
  return 0;
}
