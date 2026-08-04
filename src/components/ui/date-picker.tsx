"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseIsoDate, toIsoDate } from "@/lib/iso-date";
import { cn } from "@/lib/utils";

export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  /** Inclusive lower bound as YYYY-MM-DD */
  min?: string;
  /** Inclusive upper bound as YYYY-MM-DD */
  max?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
};

function formatDisplayDate(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  id,
  className,
  disabled = false,
  align = "start",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseIsoDate(value) ?? undefined;
  const minDate = min ? parseIsoDate(min) : undefined;
  const maxDate = max ? parseIsoDate(max) : undefined;

  const disabledMatchers = React.useMemo(() => {
    const matchers = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!selected}
          className={cn(
            "h-auto w-[9.75rem] justify-start gap-2 rounded-none border-primary-blue/15 bg-white px-2 py-1.5 font-sans text-sm font-normal text-primary-blue shadow-none hover:bg-blue-gray/30 data-[empty=true]:text-primary-blue/45",
            className,
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0 text-primary-blue/55" />
          <span className="truncate">
            {selected ? formatDisplayDate(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-primary-blue/15 bg-white p-0 shadow-lg"
        align={align}
      >
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          disabled={disabledMatchers}
          onSelect={(date) => {
            if (!date) return;
            onChange(toIsoDate(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
