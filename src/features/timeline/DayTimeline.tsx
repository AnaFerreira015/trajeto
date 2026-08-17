import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDistance } from "@/lib/location-history/coordinates";
import { formatDuration, formatFullDate, formatTime } from "@/lib/location-history/dates";
import type { TimelineEvent } from "@/lib/location-history/types";
import { cn } from "@/lib/utils";

import { eventDetail, eventIcon, eventTitle } from "./event-presentation";

interface DayTimelineProps {
  date: Date;
  events: TimelineEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export function DayTimeline({ date, events, selectedId, onSelect, onBack }: DayTimelineProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar ao mês
        </Button>
        <h2 className="text-xl font-semibold first-letter:uppercase">{formatFullDate(date)}</h2>
      </div>

      <ol className="relative space-y-1 border-l border-border pl-0">
        {events.map((event) => {
          const Icon = eventIcon(event);
          const active = selectedId === event.id;
          return (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onSelect(event.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "-ml-px flex min-h-14 w-full items-center gap-3 border-l-2 py-2 pr-2 pl-4 text-left transition-colors",
                  active
                    ? "border-l-primary bg-secondary"
                    : "border-l-transparent hover:bg-secondary/60",
                )}
              >
                <time
                  dateTime={event.start.toISOString()}
                  className="w-12 shrink-0 text-sm tabular-nums text-muted-foreground"
                >
                  {formatTime(event.start)}
                </time>
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    event.kind === "visit" ? "bg-visit/10 text-visit" : "bg-trip/10 text-trip",
                  )}
                >
                  <Icon className="size-4" aria-hidden={true} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-medium">{eventTitle(event)}</span>
                  <span className="block text-sm text-muted-foreground">
                    {eventDetail(event)}
                    {event.kind === "trip" && event.durationMinutes > 0
                      ? ` · ${formatDuration(event.durationMinutes)}`
                      : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum registro neste dia.</p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Total registrado no dia:{" "}
        {formatDistance(
          events.reduce(
            (sum, event) => sum + (event.kind === "trip" ? (event.distanceMeters ?? 0) : 0),
            0,
          ),
        )}
      </p>
    </div>
  );
}
