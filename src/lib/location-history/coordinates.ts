import type { LatLng } from "./types";

/** Converte "geo:-9.123,-35.123" em { lat, lng }. Retorna null se inválido. */
export function parseGeoPoint(value: unknown): LatLng | null {
  if (value && typeof value === "object") {
    const nested = (value as { latLng?: unknown; LatLng?: unknown });
    return parseGeoPoint(nested.latLng ?? nested.LatLng);
  }
  if (typeof value !== "string") return null;
  const raw = value.trim().replace(/^geo:/i, "").replace(/°/g, "");
  const parts = raw.split(",");
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** Metros -> texto amigável ("850 m" / "7,2 km"). */
export function formatDistance(meters: number | undefined): string {
  if (meters === undefined || !Number.isFinite(meters)) return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${metersToKilometers(meters).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`;
}

export function metersToKilometers(meters: number): number {
  return meters / 1000;
}

/** Média simples de uma lista de pontos, usada para centralizar o mapa. */
export function centerOf(points: LatLng[]): LatLng | null {
  if (points.length === 0) return null;
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 },
  );
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}
