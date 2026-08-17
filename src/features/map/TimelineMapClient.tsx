import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";

import { collectPoints } from "@/lib/location-history/filters";
import type { TimelineEvent } from "@/lib/location-history/types";
import { placeLabel } from "@/lib/location-history/normalizer";

export interface TimelineMapProps {
  events: TimelineEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function FitBounds({ events, selectedId }: { events: TimelineEvent[]; selectedId: string | null }) {
  const map = useMap();
  const signature = useMemo(() => events.map((event) => event.id).join("|"), [events]);

  useEffect(() => {
    const points = collectPoints(events);
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, map]);

  useEffect(() => {
    if (!selectedId) return;
    const selected = events.find((event) => event.id === selectedId);
    if (!selected) return;
    const points = collectPoints([selected]);
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng] as [number, number]));
    map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 16, duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return null;
}

function visitIcon(label: string, active: boolean) {
  const isHome = label === "Casa";
  return L.divIcon({
    className: "",
    html: `<span role="img" aria-label="${label}" style="display:flex;align-items:center;justify-content:center;width:${
      active ? 34 : 26
    }px;height:${active ? 34 : 26}px;border-radius:999px;background:${
      active ? "oklch(0.62 0.14 45)" : "oklch(0.45 0.09 200)"
    };color:#fff;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.28);font-size:13px;">${
      isHome ? "⌂" : "•"
    }</span>`,
    iconSize: [active ? 34 : 26, active ? 34 : 26],
    iconAnchor: [active ? 17 : 13, active ? 17 : 13],
  });
}

export default function TimelineMapClient({ events, selectedId, onSelect }: TimelineMapProps) {
  const paths = events.filter((event) => event.kind === "path");
  const trips = events.filter((event) => event.kind === "trip");
  const visits = events.filter((event) => event.kind === "visit");

  return (
    <MapContainer
      center={[-14.235, -51.925]}
      zoom={4}
      className="h-full w-full"
      scrollWheelZoom
      attributionControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />
      <FitBounds events={events} selectedId={selectedId} />

      {paths.map((event) =>
        event.kind === "path" ? (
          <Polyline
            key={event.id}
            positions={event.points.map((point) => [point.lat, point.lng] as [number, number])}
            pathOptions={{
              color: selectedId === event.id ? "oklch(0.62 0.14 45)" : "oklch(0.52 0.11 195)",
              weight: selectedId === event.id ? 7 : 4,
              opacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelect(event.id) }}
          />
        ) : null,
      )}

      {trips.map((event) =>
        event.kind === "trip" ? (
          <Polyline
            key={event.id}
            positions={[
              [event.from.lat, event.from.lng],
              [event.to.lat, event.to.lng],
            ]}
            pathOptions={{
              color: "oklch(0.62 0.14 45)",
              weight: selectedId === event.id ? 6 : 3,
              opacity: selectedId === event.id ? 1 : 0.7,
              dashArray: "2 9",
              lineCap: "round",
            }}
            eventHandlers={{ click: () => onSelect(event.id) }}
          />
        ) : null,
      )}

      {trips.map((event) =>
        event.kind === "trip" ? (
          <CircleMarker
            key={`${event.id}-ends`}
            center={[event.to.lat, event.to.lng]}
            radius={selectedId === event.id ? 7 : 5}
            pathOptions={{ color: "#fff", weight: 2, fillColor: "oklch(0.62 0.14 45)", fillOpacity: 1 }}
            eventHandlers={{ click: () => onSelect(event.id) }}
          />
        ) : null,
      )}

      {visits.map((event) =>
        event.kind === "visit" ? (
          <Marker
            key={event.id}
            position={[event.location.lat, event.location.lng]}
            icon={visitIcon(placeLabel(event.semanticType), selectedId === event.id)}
            keyboard
            alt={placeLabel(event.semanticType)}
            eventHandlers={{ click: () => onSelect(event.id) }}
          />
        ) : null,
      )}
    </MapContainer>
  );
}
