"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatDateDisplay,
  parseDisplayToIso,
  toIsoDate,
  toLocalDate,
} from "@/lib/date-utils";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
};

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const getMonthLabel = (date: Date) =>
  date.toLocaleString("en-IN", { month: "long", year: "numeric" });

const getMonthDays = (viewDate: Date) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = (first.getDay() + 6) % 7;
  const totalDays = last.getDate();

  const days: Array<{ date: Date; currentMonth: boolean }> = [];

  for (let i = 0; i < startDay; i += 1) {
    const prev = new Date(year, month, -i);
    days.unshift({ date: prev, currentMonth: false });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    days.push({ date: new Date(year, month, day), currentMonth: true });
  }

  while (days.length % 7 !== 0) {
    const next = new Date(year, month + 1, days.length - totalDays - startDay + 1);
    days.push({ date: next, currentMonth: false });
  }

  return days;
};

export default function DatePicker({
  value,
  onChange,
  readOnly = false,
  required = false,
  className,
  placeholder = "DD/MM/YYYY",
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const parsedValue = useMemo(() => toLocalDate(value), [value]);
  const [displayValue, setDisplayValue] = useState(() =>
    value ? formatDateDisplay(value) : ""
  );
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => parsedValue ?? new Date());

  useEffect(() => {
    if (value) {
      setDisplayValue(formatDateDisplay(value));
      const nextView = toLocalDate(value);
      if (nextView) {
        setViewDate(nextView);
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !wrapperRef.current) {
        return;
      }
      if (!wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const formatInputValue = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 8);
    let day = digits.slice(0, 2);
    let month = digits.slice(2, 4);
    const year = digits.slice(4, 8);

    if (day.length === 2) {
      const dayNum = Number(day);
      if (dayNum > 31) {
        day = "31";
      }
    }

    if (month.length === 2) {
      const monthNum = Number(month);
      if (monthNum > 12) {
        month = "12";
      }
    }

    if (digits.length <= 2) {
      return day;
    }

    if (digits.length <= 4) {
      return `${day}/${month}`;
    }

    return `${day}/${month}/${year}`;
  };

  const handleInputChange = (nextValue: string) => {
    const formatted = formatInputValue(nextValue);
    setDisplayValue(formatted);
    if (formatted.length === 10) {
      const iso = parseDisplayToIso(formatted);
      if (iso) {
        onChange(iso);
      }
    }
  };

  const handleDaySelect = (date: Date) => {
    const iso = toIsoDate(date);
    onChange(iso);
    setOpen(false);
  };

  const days = useMemo(() => getMonthDays(viewDate), [viewDate]);
  const today = new Date();

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        className={className}
        value={displayValue}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => {
          if (!readOnly) {
            setOpen(true);
          }
        }}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
      />

      {open ? (
        <div className="glass-panel-strong absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
            >
              Prev
            </button>
            <p className="text-sm text-white">{getMonthLabel(viewDate)}</p>
            <button
              type="button"
              className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
            >
              Next
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2 text-center text-xs text-slate-400">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2 text-center text-xs">
            {days.map(({ date, currentMonth }) => {
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
              const isSelected =
                parsedValue &&
                date.getDate() === parsedValue.getDate() &&
                date.getMonth() === parsedValue.getMonth() &&
                date.getFullYear() === parsedValue.getFullYear();

              return (
                <button
                  key={`${date.toDateString()}-${currentMonth}`}
                  type="button"
                  onClick={() => handleDaySelect(date)}
                  className={`rounded-lg border px-2 py-1 transition ${
                    currentMonth
                      ? "border-white/10 text-white"
                      : "border-transparent text-slate-500"
                  } ${
                    isSelected
                      ? "bg-blue-500/30 text-white"
                      : isToday
                        ? "border-blue-400/40 text-blue-200"
                        : "hover:border-white/20"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300"
              onClick={() => handleDaySelect(today)}
            >
              Today
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
