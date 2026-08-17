import {
  Bike,
  Bus,
  Car,
  Footprints,
  Home,
  MapPin,
  Navigation,
  Plane,
  Route,
  Ship,
  TrainFront,
} from "lucide-react";
import type { ComponentType } from "react";

import { formatDistance } from "@/lib/location-history/coordinates";
import { formatDuration } from "@/lib/location-history/dates";
import { placeLabel, transportLabel } from "@/lib/location-history/normalizer";
import type { TimelineEvent } from "@/lib/location-history/types";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

export function transportIcon(type: string | undefined): IconType {
  const label = transportLabel(type);
  switch (label) {
    case "Carro":
    case "Táxi":
    case "Transporte por app":
    case "Veículo":
      return Car;
    case "Ônibus":
      return Bus;
    case "Trem":
    case "Metrô":
    case "Bonde":
      return TrainFront;
    case "Caminhada":
    case "A pé":
    case "Corrida":
      return Footprints;
    case "Bicicleta":
    case "Moto":
      return Bike;
    case "Avião":
      return Plane;
    case "Barco":
      return Ship;
    default:
      return Navigation;
  }
}

export function placeIcon(semanticType: string | undefined): IconType {
  return placeLabel(semanticType) === "Casa" ? Home : MapPin;
}

export function eventIcon(event: TimelineEvent): IconType {
  if (event.kind === "visit") return placeIcon(event.semanticType);
  if (event.kind === "trip") return transportIcon(event.transportType);
  return Route;
}

/** Título curto e amigável do evento. */
export function eventTitle(event: TimelineEvent): string {
  if (event.kind === "visit") return placeLabel(event.semanticType);
  if (event.kind === "trip") return transportLabel(event.transportType);
  return "Trajeto percorrido";
}

/** Detalhe secundário (distância ou duração). */
export function eventDetail(event: TimelineEvent): string {
  if (event.kind === "trip") {
    const distance = formatDistance(event.distanceMeters);
    return distance === "—" ? formatDuration(event.durationMinutes) : distance;
  }
  return formatDuration(event.durationMinutes);
}
