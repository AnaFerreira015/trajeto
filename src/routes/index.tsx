import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { DaySelector, MonthSelector } from "@/features/filters/MonthSelector";
import { ImportScreen } from "@/features/import/ImportScreen";
import { MapPanel } from "@/features/map/MapPanel";
import { DayTimeline } from "@/features/timeline/DayTimeline";
import { EventDetails } from "@/features/timeline/EventDetails";
import { MonthPanel } from "@/features/timeline/MonthPanel";
import { dateFromDayKey, listMonths } from "@/lib/location-history/dates";
import { filterByMonth, groupByDay, summarize } from "@/lib/location-history/filters";
import type { TimelineEvent } from "@/lib/location-history/types";
import { cn } from "@/lib/utils";

const TITLE = "Trajeto — visualize seus caminhos ao longo do tempo";
const DESCRIPTION =
  "Importe o arquivo da Linha do Tempo do Google Maps e veja seus deslocamentos no mapa, mês a mês. Tudo processado no seu próprio dispositivo.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);

  if (!events) return <ImportScreen onLoaded={setEvents} />;
  return <TimelineView events={events} />;
}

function TimelineView({ events }: { events: TimelineEvent[] }) {
  const months = useMemo(() => listMonths(events), [events]);
  const [monthKey, setMonthKey] = useState(() => months[months.length - 1]?.key ?? "");
  const [view, setView] = useState<"month" | "day">("month");
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [hiddenDays, setHiddenDays] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const month = months.find((item) => item.key === monthKey) ?? months[months.length - 1]!;
  const monthEvents = useMemo(() => filterByMonth(events, month), [events, month]);
  const days = useMemo(() => groupByDay(monthEvents), [monthEvents]);
  const summary = useMemo(() => summarize(monthEvents), [monthEvents]);

  const dayGroup = days.find((day) => day.key === activeDay) ?? null;
  const visibleEvents =
    view === "day" && dayGroup
      ? dayGroup.events
      : monthEvents.filter((event) => !hiddenDays.has(dayKeyOf(days, event)));

  const selectedEvent = visibleEvents.find((event) => event.id === selectedId) ?? null;

  function openDay(key: string) {
    setActiveDay(key);
    setView("day");
    setSelectedId(null);
    setSheetOpen(true);
  }

  function changeMonth(key: string) {
    setMonthKey(key);
    setActiveDay(null);
    setView("month");
    setSelectedId(null);
    setHiddenDays(new Set());
  }

  function toggleDay(key: string) {
    setHiddenDays((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const panel =
    view === "day" && dayGroup ? (
      <DayTimeline
        date={dateFromDayKey(dayGroup.key)}
        events={dayGroup.events}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onBack={() => {
          setView("month");
          setActiveDay(null);
          setSelectedId(null);
        }}
      />
    ) : (
      <MonthPanel
        summary={summary}
        days={days}
        hiddenDays={hiddenDays}
        onToggleDay={toggleDay}
        onShowAll={() => setHiddenDays(new Set())}
        onOpenDay={openDay}
      />
    );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="isolate z-20 shrink-0 border-b border-border bg-card/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold sm:text-2xl">Trajeto</h1>
          <div className="flex flex-wrap items-center gap-2">
            <MonthSelector months={months} value={month.key} onChange={changeMonth} />
            <DaySelector
              days={days}
              value={activeDay ?? ""}
              onChange={(key) => {
                if (key) openDay(key);
                else {
                  setView("month");
                  setActiveDay(null);
                  setSelectedId(null);
                }
              }}
            />
          </div>
        </div>
        <p className="mt-1.5 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Processado apenas neste dispositivo. Nada é enviado ou armazenado.
        </p>
      </header>

      <div className="relative flex min-h-0 flex-1 lg:grid lg:grid-cols-[1fr_23rem] xl:grid-cols-[1fr_26rem]">
        <div className="isolate absolute inset-0 lg:relative">
          <MapPanel events={visibleEvents} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* Painel lateral (desktop) / bottom sheet (mobile) */}
        <aside
          aria-label="Resumo e registros"
          className={cn(
            "z-30 flex flex-col border-border bg-card transition-[max-height] duration-300",
            "absolute inset-x-0 bottom-0 max-h-[70dvh] rounded-t-3xl border-t shadow-soft",
            !sheetOpen && "max-h-14",
            "lg:static lg:max-h-none lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none",
          )}
        >
          <button
            type="button"
            onClick={() => setSheetOpen((open) => !open)}
            aria-expanded={sheetOpen}
            className="flex min-h-14 shrink-0 items-center justify-center gap-2 text-sm font-medium text-muted-foreground lg:hidden"
          >
            {sheetOpen ? (
              <ChevronDown className="size-4" aria-hidden="true" />
            ) : (
              <ChevronUp className="size-4" aria-hidden="true" />
            )}

            {sheetOpen ? "Recolher painel" : "Ver resumo e registros"}
          </button>

          <div
            className={cn(
              "min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pt-2 pb-8 lg:pt-6",
              !sheetOpen && "hidden lg:block",
            )}
          >
            {selectedEvent ? (
              <EventDetails
                event={selectedEvent}
                onClose={() => setSelectedId(null)}
              />
            ) : null}

            {panel}
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Descobre a qual dia visível um evento pertence. */
function dayKeyOf(days: ReturnType<typeof groupByDay>, event: TimelineEvent): string {
  return days.find((day) => day.events.some((item) => item.id === event.id))?.key ?? "";
}
