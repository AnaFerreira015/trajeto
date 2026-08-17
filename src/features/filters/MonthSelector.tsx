import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatShortDate } from "@/lib/location-history/dates";
import type { MonthKey } from "@/lib/location-history/types";
import type { DayGroup } from "@/lib/location-history/filters";

interface MonthSelectorProps {
  months: MonthKey[];
  value: string;
  onChange: (key: string) => void;
}

export function MonthSelector({ months, value, onChange }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="month-select" className="sr-only">
        Escolher mês
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="month-select" className="h-11 min-w-52 bg-card text-base">
          <SelectValue placeholder="Escolher mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.key} value={month.key} className="text-base">
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface DaySelectorProps {
  days: DayGroup[];
  value: string;
  onChange: (key: string) => void;
}

const ALL_DAYS = "__all__";

export function DaySelector({ days, value, onChange }: DaySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="day-select" className="sr-only">
        Escolher dia
      </label>
      <Select value={value || ALL_DAYS} onValueChange={(v) => onChange(v === ALL_DAYS ? "" : v)}>
        <SelectTrigger id="day-select" className="h-11 min-w-44 bg-card text-base">
          <SelectValue placeholder="Escolher dia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_DAYS} className="text-base">
            Todos os dias
          </SelectItem>
          {days.map((day) => (
            <SelectItem key={day.key} value={day.key} className="text-base">
              {capitalize(formatShortDate(day.date))}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
