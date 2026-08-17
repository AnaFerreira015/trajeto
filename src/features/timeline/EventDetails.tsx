import { X } from "lucide-react";

import { formatDistance } from "@/lib/location-history/coordinates";
import { formatDuration, formatFullDate, formatTime } from "@/lib/location-history/dates";
import { placeLabel, transportLabel } from "@/lib/location-history/normalizer";
import type { TimelineEvent } from "@/lib/location-history/types";

import { eventIcon } from "./event-presentation";

interface EventDetailsProps {
  event: TimelineEvent;
  onClose: () => void;
}

/** Detalhes do registro selecionado, em linguagem simples. */
export function EventDetails({ event, onClose }: EventDetailsProps) {
  const Icon = eventIcon(event);
  const rows: Array<[string, string]> = [["Data", formatFullDate(event.start)]];

  if (event.kind === "visit") {
    rows.push(
      ["Chegada", formatTime(event.start)],
      ["Saída", formatTime(event.end)],
      ["Tempo no local", formatDuration(event.durationMinutes)],
    );
    if (event.semanticType) rows.push(["Tipo de local", placeLabel(event.semanticType)]);
  } else if (event.kind === "trip") {
    rows.push(
      ["Horário", `${formatTime(event.start)} – ${formatTime(event.end)}`],
      ["Distância", formatDistance(event.distanceMeters)],
      ["Meio de transporte", transportLabel(event.transportType)],
      ["Duração", formatDuration(event.durationMinutes)],
    );
    if (event.probability !== undefined && event.probability > 0) {
      rows.push(["Confiança da estimativa", `${Math.round(event.probability * 100)}%`]);
    }
  } else {
    rows.push(
      ["Horário", `${formatTime(event.start)} – ${formatTime(event.end)}`],
      ["Duração", formatDuration(event.durationMinutes)],
      ["Pontos registrados", String(event.points.length)],
    );
  }

  return (
    <section
      aria-label="Detalhes do registro selecionado"
      className="rounded-2xl border border-border bg-card p-4 shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Icon className="size-4 text-primary" aria-hidden={true} />
          {event.kind === "visit"
            ? placeLabel(event.semanticType)
            : event.kind === "trip"
              ? transportLabel(event.transportType)
              : "Trajeto percorrido"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium first-letter:uppercase">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
