import type { DisplayLanguage } from "@/lib/display-language";
import { SITE_LOCALIZATION } from "@/lib/site-localization";

export type JourneyStep = 1 | 2 | 3;
export const JOURNEY_COPY = Object.fromEntries(
  Object.entries(SITE_LOCALIZATION).map(([language, copy]) => [language, copy.journey])
) as Record<DisplayLanguage, { title: string; steps: readonly [string, string, string]; hints: readonly [string, string, string] }>;

export function currentJourneyStep(hasBirth: boolean, editing: boolean, asking: boolean): JourneyStep {
  return !hasBirth || editing ? 1 : asking ? 3 : 2;
}
