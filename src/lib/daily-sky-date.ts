/** Both inputs are ISO calendar dates in Sydney. UTC arithmetic avoids DST-short days. */
export function recentSkySnapshot<T extends { date: string }>(records: readonly T[], today: string): T | undefined {
  const latest = records.reduce<T | undefined>((best, record) =>
    record.date <= today && (!best || record.date > best.date) ? record : best, undefined);
  if (latest && Date.parse(today) - Date.parse(latest.date) <= 8 * 86_400_000) return latest;
}

export function sydneyDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
