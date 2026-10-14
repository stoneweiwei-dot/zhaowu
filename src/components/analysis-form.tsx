import { BaziReadingUnlock, useBaziReadingAccess } from "@/components/bazi-reading-unlock";
import { JourneySteps } from "@/components/journey-steps";
import { currentJourneyStep, type JourneyStep } from "@/lib/site-journey";
import { CharacterPanel } from "@/components/character-panel";
import { BirthDataNotice } from "@/components/birth-data-notice";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { analyzeLife } from "@/lib/actions";
import type { AnalyzeInput, CityHit } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createEngineReportRecord, updateBirthData } from "@/lib/supabase-rest";
import { UNKNOWN_TIME_COPY } from "@/lib/bazi/presentation";
import {
  formatSharedBirthRecord,
  readSharedBirthRecord,
  sharedBirthFromUnknown,
  validDate,
  writeSharedBirthRecord,
  type SharedBirthRecord,
} from "@/lib/shared-birth";
import { CityPicker } from "@/components/city-picker";
import { BaziChart } from "@/components/bazi-chart";
import { buildChart } from "@/lib/bazi/chart";
import { analyzeStructure } from "@/lib/bazi/structure";
import { chartTerm } from "@/lib/bazi/presentation";
import { UnifiedBirthReport } from "@/components/unified-birth-report";
import { ChartTrustPanel } from "@/components/chart-trust-panel";
import { buildPlainChartSummary } from "@/lib/bazi/plain-summary";
import { standardTimeFallbackCity } from "@/lib/bazi/cities";

// TEMPORARY STUB - full restore in next commit if this is truncated
export function AnalysisForm() {
  return <div role="alert">Form temporarily unavailable. Restoring…</div>;
}
