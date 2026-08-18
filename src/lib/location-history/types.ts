/**
 * Tipos do formato bruto exportado pelo Google Maps (Linha do Tempo)
 * e do modelo interno normalizado usado pela interface.
 */

/* ---------- Formato bruto (Google) ---------- */
export type RawGeoValue = string | { latLng?: string } | undefined;

export interface RawTopCandidateVisit {
  probability?: string | number;
  semanticType?: string;
  /** iOS */
  placeID?: string;
  /** Android */
  placeId?: string;
  placeLocation?: RawGeoValue;
}

export interface RawVisit {
  hierarchyLevel?: string | number;
  probability?: string | number;
  topCandidate?: RawTopCandidateVisit;
}

export interface RawActivity {
  probability?: string | number;
  start?: RawGeoValue;
  end?: RawGeoValue;
  distanceMeters?: string | number;
  topCandidate?: { type?: string; probability?: string | number };
}

export interface RawTimelinePathPoint {
  point?: RawGeoValue;
  /** iOS */
  durationMinutesOffsetFromStartTime?: string;
  /** Android */
  time?: string;
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
