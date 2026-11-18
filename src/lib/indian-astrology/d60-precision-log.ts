const STORAGE_KEY = "zhaowu:d60-minute-precision-log";
const MAX_ENTRIES = 50;

type Confirmation = {
  timestamp: string;
  confirmed: true;
  precision: "minute";
};

function isConfirmation(value: unknown): value is Confirmation {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.timestamp === "string"
    && Number.isFinite(Date.parse(entry.timestamp))
    && entry.confirmed === true && entry.precision === "minute";
}

/** Device-local confirmation events only; never receives birth or chart data. */
export function logD60MinutePrecisionConfirmation(precision: "minute"): void {
  try {
    if (typeof window === "undefined" || precision !== "minute") return;
    const storage = window.localStorage;
    const raw = storage.getItem(STORAGE_KEY);
    let entries: Confirmation[] = [];
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Reconstruct the allowlisted fields so old/corrupt entries cannot retain PII.
          entries = parsed.filter(isConfirmation).slice(-(MAX_ENTRIES - 1))
            .map(({ timestamp }) => ({ timestamp, confirmed: true, precision: "minute" }));
        }
      } catch { /* Replace malformed local history with this confirmation. */ }
    }
    entries.push({ timestamp: new Date().toISOString(), confirmed: true, precision });
    storage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch { /* Storage is optional; never interrupt the gate. */ }
}
