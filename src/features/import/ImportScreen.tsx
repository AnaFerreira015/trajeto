import { Loader2, MapPinned, ShieldCheck, Upload } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { parseTimelineFile, readFileAsText } from "@/lib/location-history/parser";
import type { TimelineEvent } from "@/lib/location-history/types";
import { cn } from "@/lib/utils";

interface ImportScreenProps {
  onLoaded: (events: TimelineEvent[]) => void;
}

export function ImportScreen({ onLoaded }: ImportScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      setStatus("error");
      setMessage("Escolha um arquivo com final .json exportado do Google Maps.");
      return;
    }
    setStatus("loading");
    setMessage("Lendo o arquivo neste dispositivo…");
    try {
      const content = await readFileAsText(file);
      const result = parseTimelineFile(content);
      if (!result.ok) {
        setStatus("error");
        setMessage(result.message);
        return;
      }
      setMessage("Arquivo lido com sucesso. Abrindo sua linha do tempo.");
      onLoaded(result.events);
    } catch {
      setStatus("error");
      setMessage("Não conseguimos abrir este arquivo. Tente novamente.");
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-10 px-6 py-16">
      <header className="space-y-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm text-secondary-foreground">
          <MapPinned className="size-4" aria-hidden="true" />
          Linha do Tempo do Google Maps
        </span>
        <h1 className="text-4xl font-semibold text-balance sm:text-5xl">
          Trajeto
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Visualize seus caminhos ao longo do tempo. Importe seu histórico do Google Maps e explore seus deslocamentos por mês.
        </p>
      </header>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-3xl border-2 border-dashed bg-card p-10 text-center transition-colors sm:p-14",
          dragging ? "border-primary bg-secondary" : "border-border",
        )}
      >
        <Upload className="mx-auto size-10 text-primary" aria-hidden="true" />
        <p className="mt-4 text-base font-medium">Arraste o arquivo até aqui</p>
        <p className="mt-1 text-sm text-muted-foreground">ou escolha no seu dispositivo</p>

        <label htmlFor="timeline-file" className="sr-only">
          Selecionar arquivo da Linha do Tempo (.json)
        </label>
        <input
          ref={inputRef}
          id="timeline-file"
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          size="lg"
          className="mt-6 h-12 px-8 text-base"
          onClick={() => inputRef.current?.click()}
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : null}
          Selecionar arquivo
        </Button>

        <p className="mx-auto mt-6 flex max-w-sm items-start justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          Seu arquivo é processado neste dispositivo e não é enviado nem armazenado.
        </p>
      </div>

      <p
        aria-live="polite"
        role="status"
        className={cn(
          "min-h-6 text-center text-sm",
          status === "error" ? "font-medium text-destructive" : "text-muted-foreground",
        )}
      >
        {message}
      </p>
    </main>
  );
}
