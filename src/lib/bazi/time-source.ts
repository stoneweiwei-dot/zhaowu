import type { AnalyzeInput, BirthTimeSource } from "./types";

const TIME_SOURCES: readonly BirthTimeSource[] = ["certificate", "family-memory", "estimate", "unknown"];

/** Sanitises an untrusted value. Missing/invalid -> undefined so callers fall back to the legacy default. */
export function normalizeTimeSource(value: unknown): BirthTimeSource | undefined {
  return typeof value === "string" && (TIME_SOURCES as readonly string[]).includes(value) ? (value as BirthTimeSource) : undefined;
}

/**
 * Records saved before the grade feature carry no source. A known time that nobody verified
 * against a record is, by definition, grade B; an unknown time is always C.
 */
export function effectiveTimeSource(input: Pick<AnalyzeInput, "timeUnknown" | "timeSource">): BirthTimeSource {
  if (input.timeUnknown) return "unknown";
  return normalizeTimeSource(input.timeSource) ?? "family-memory";
}
