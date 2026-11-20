/** Approximate equation of time in minutes. */
export function equationOfTimeMinutes(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86_400_000;
  const b = (2 * Math.PI * (day - 81)) / 365;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

export function toTrueSolar(input: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  longitude: number;
  tzOffsetHours: number;
}): { year: number; month: number; day: number; hour: number; minute: number; shiftMinutes: number } {
  const civil = new Date(Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, 0));
  const eot = equationOfTimeMinutes(civil);
  const longitudeCorrection = 4 * (input.longitude - input.tzOffsetHours * 15);
  const shift = longitudeCorrection + eot;
  const trueMs = civil.getTime() + shift * 60_000;
  const t = new Date(trueMs);
  return {
    year: t.getUTCFullYear(),
    month: t.getUTCMonth() + 1,
    day: t.getUTCDate(),
    hour: t.getUTCHours(),
    minute: t.getUTCMinutes(),
    shiftMinutes: Math.round(shift),
  };
}

export function addDays(
  y: number,
  m: number,
  d: number,
  days: number,
): { year: number; month: number; day: number } {
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function stamp(y: number, m: number, d: number, h: number, min: number): string {
  return `${y}-${pad2(m)}-${pad2(d)} ${pad2(h)}:${pad2(min)}`;
}
