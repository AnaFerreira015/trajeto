import { normalizeRecords } from "./normalizer";
import type { RawRecord, TimelineEvent } from "./types";

export type ParseResult =
  | { ok: true; events: TimelineEvent[] }
  | { ok: false; message: string };

const GENERIC_ERROR =
  "Não conseguimos ler este arquivo. Verifique se ele é o arquivo exportado da Linha do Tempo do Google Maps.";

/** Lê o conteúdo de texto de um arquivo, inteiramente no navegador. */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read-error"));
    reader.readAsText(file);
  });
}

/** Valida e converte o conteúdo do arquivo no modelo interno. Nunca expõe erros técnicos. */
export function parseTimelineFile(content: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }

  const records = extractRecords(data);
  data = null;
  if (!records) return { ok: false, message: GENERIC_ERROR };

  const events = normalizeRecords(records);
  if (events.length === 0) {
    return {
      ok: false,
      message: "Este arquivo não contém deslocamentos ou locais que possamos mostrar.",
    };
  }
  return { ok: true, events };
}

/** Aceita o array raiz ou algumas variações comuns do export. */
function extractRecords(data: unknown): RawRecord[] | null {
  if (Array.isArray(data)) return data as RawRecord[];
  if (data && typeof data === "object") {
    const container = data as Record<string, unknown>;
    for (const key of ["semanticSegments", "timelineObjects", "locationHistory"]) {
      const value = container[key];
      if (Array.isArray(value)) return value as RawRecord[];
    }
  }
  return null;
}
