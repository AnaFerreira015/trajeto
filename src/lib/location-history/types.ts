/**
 * Tipos do formato bruto exportado pelo Google Maps (Linha do Tempo)
 * e do modelo interno normalizado usado pela interface.
 */

/* ---------- Formato bruto (Google) ---------- */

export interface RawTopCandidateVisit {
  probability?: string;
  semanticType?: string;
  placeID?: string;
  placeLocation?: string;
}

export interface RawVisit {
  hierarchyLevel?: string;
  probability?: string;
  topCandidate?: RawTopCandidateVisit;
}

export interface RawActivity {
  probability?: string;
  start?: string;
  end?: string;
  distanceMeters?: string;
  topCandidate?: { type?: string; probability?: string };
}

export interface RawTimelinePathPoint {
  point?: string;
  durationMinutesOffsetFromStartTime?: string;
}

export interface RawRecord {
  startTime?: string;
  endTime?: string;
  visit?: RawVisit;
  activity?: RawActivity;
  timelinePath?: RawTimelinePathPoint[];
}

/* ---------- Modelo interno normalizado ---------- */

export interface LatLng {
  lat: number;
  lng: number;
}

interface BaseEvent {
  id: string;
  start: Date;
  end: Date;
  /** Duração em minutos */
  durationMinutes: number;
}

export interface VisitEvent extends BaseEvent {
  kind: "visit";
  location: LatLng;
  semanticType?: string | undefined;
  hierarchyLevel: number;
  probability?: number | undefined;
  placeId?: string | undefined;
}

export interface TripEvent extends BaseEvent {
  kind: "trip";
  from: LatLng;
  to: LatLng;
  distanceMeters?: number | undefined;
  transportType?: string | undefined;
  probability?: number | undefined;
}

export interface PathEvent extends BaseEvent {
  kind: "path";
  points: LatLng[];
}

export type TimelineEvent = VisitEvent | TripEvent | PathEvent;

export interface MonthKey {
  /** "2026-01" */
  key: string;
  year: number;
  /** 0-11 */
  month: number;
  label: string;
}
