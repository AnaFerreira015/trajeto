import { ChevronRight, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDistance } from "@/lib/location-history/coordinates";
import { formatShortDate } from "@/lib/location-history/dates";
import type { DayGroup, MonthSummary } from "@/lib/location-history/filters";

interface MonthPanelProps {
  summary: MonthSummary;
  days: DayGroup[];
  hiddenDays: Set<string>;
  onToggleDay: (key: string) => void;
  onShowAll: () => void;
  onOpenDay: (key: string) => void;
}

export function MonthPanel({
  summary,
  days,
  hiddenDays,
  onToggleDay,
  onShowAll,
  onOpenDay,
}: MonthPanelProps) {
  const stats = [
    { label: "Distância registrada", value: formatDistance(summary.totalDistanceMeters) },
    { label: "Deslocamentos", value: String(summary.tripCount) },
    { label: "Locais visitados", value: String(summary.visitCount) },
    { label: "Dias com registros", value: String(summary.dayCount) },
  ];

  return (
    <div className="space-y-8">
      <section aria-label="Resumo do mês">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="mt-0.5 font-display text-2xl font-semibold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Dias do mês" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Dias
          </h2>
          <Button variant="ghost" size="sm" onClick={onShowAll} disabled={hiddenDays.size === 0}>
            Mostrar todos
          </Button>
        </div>

        <ul className="divide-y divide-border">
          {days.map((day) => {
            const hidden = hiddenDays.has(day.key);
            return (
              <li key={day.key} className="flex items-center gap-1 py-1">
                <button
                  type="button"
                  onClick={() => onOpenDay(day.key)}
                  className="flex min-h-11 flex-1 items-center justify-between gap-3 rounded-lg px-2 text-left transition-colors hover:bg-secondary"
                >
                  <span>
                    <span className="block text-base font-medium">
                      {formatShortDate(day.date)}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {day.events.length} registros
                      {hidden ? " · oculto no mapa" : ""}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleDay(day.key)}
                  aria-pressed={hidden}
                  aria-label={
                    hidden
                      ? `Mostrar ${formatShortDate(day.date)} no mapa`
                      : `Ocultar ${formatShortDate(day.date)} do mapa`
                  }
                  className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {hidden ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
