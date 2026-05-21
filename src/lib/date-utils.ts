const pad = (value: number) => String(value).padStart(2, "0");

export const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export const toLocalDate = (isoDate: string) => {
  const parsed = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDateDisplay = (isoDate?: string | null) => {
  if (!isoDate) {
    return "--";
  }
  const date = toLocalDate(isoDate);
  if (!date) {
    return "--";
  }
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const formatDateTimeDisplay = (value?: string | null) => {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${time}`;
};

export const parseDisplayDate = (display: string) => {
  const cleaned = display.trim();
  if (!cleaned) {
    return null;
  }
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!day || !month || !year) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  if (date.getDate() !== day || date.getMonth() !== month - 1) {
    return null;
  }
  return date;
};

export const parseDisplayToIso = (display: string) => {
  const date = parseDisplayDate(display);
  return date ? toIsoDate(date) : null;
};

export const addDaysToIso = (isoDate: string, days: number) => {
  const date = toLocalDate(isoDate);
  if (!date) {
    return isoDate;
  }
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toIsoDate(next);
};

export const diffDays = (startIso: string, endIso: string) => {
  const start = toLocalDate(startIso);
  const end = toLocalDate(endIso);
  if (!start || !end) {
    return null;
  }
  const diffMs = end.getTime() - start.getTime();
  const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
  return days > 0 ? days : 0;
};
