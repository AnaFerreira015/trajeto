import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

import type { TimelineMapProps } from "./TimelineMapClient";

const TimelineMapClient = lazy(() => import("./TimelineMapClient"));

function MapFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary/60">
      <p className="text-sm text-muted-foreground">Preparando o mapa…</p>
    </div>
  );
}

export function MapPanel(props: TimelineMapProps) {
  return (
    <ClientOnly fallback={<MapFallback />}>
      <Suspense fallback={<MapFallback />}>
        <TimelineMapClient {...props} />
      </Suspense>
    </ClientOnly>
  );
}
