import type { FunctionalTrainingResult } from "@/lib/report/five-element-functional-training";
import { mayActivelyTrainElement } from "@/lib/report/five-element-functional-training";
import type { AuraBlueprint } from "@/lib/report/aura-chakra-blueprint";

export type PaidReportTier = "free" | "full" | "paid_basic" | "paid_full";
export type PaymentStatus = "not_required" | "unpaid" | "pending" | "paid" | "refunded";

export type PaymentContext = {
  tier: PaidReportTier;
  paymentStatus: PaymentStatus;
};

export type PaidVisualBlueprint = {
  version: "ZW-PAID-VISUAL-1.0";
  enabled: boolean;
  tierRequired: "paid_basic" | "paid_full";
  selectedElement: FunctionalTrainingResult["selectedElement"];
  selectedState: FunctionalTrainingResult["selectedState"];
  functionalTheme: string;
  elementImage: { enabled: boolean; prompt: string | null; aspectRatio: "9:16"; watermark: "STONE 原創" };
  auraImage: { enabled: boolean; prompt: string | null; aspectRatio: "9:16"; watermark: "STONE 原創" };
};

export function canGeneratePaidVisuals(payment: PaymentContext): boolean {
  if (payment.paymentStatus !== "paid") return false;
  return payment.tier === "paid_basic" || payment.tier === "paid_full";
}

export function buildElementImagePrompt(training: FunctionalTrainingResult): string | null {
  if (!training.selectedElement || !training.selectedState || !mayActivelyTrainElement(training.selectedState)) return null;
  return [
    "Create one premium vertical 9:16 ZHAOWU five-element functional-training artwork.",
    `Selected functional element: ${training.selectedElement}.`,
    `Current functional theme: ${training.functionalTheme}.`,
    `Current state: ${training.selectedState}.`,
    `Why now: ${training.whySelected}.`,
    `Practical training: ${training.howToUse.join("; ")}.`,
    `Observation marker: ${training.observationMarker}.`,
    `Avoid overdoing: ${training.excessWarning}.`,
    "Visual language: old xuan-paper / Song-inspired atlas, refined East Asian mineral colour, modern premium mobile infographic composition, clear information hierarchy, no glossy CG, no game-card UI, no cheap children's-poster look.",
    "Do not claim that an element is missing or that adding colours/materials changes fate. Generate clean artwork without readable text or watermark; exact typography and STONE 原創 watermark are added by the product layer.",
  ].join("\n");
}

export function buildAuraImagePrompt(aura: AuraBlueprint, displayName = "Zhaowu user"): string {
  return [
    "Create one premium vertical 9:16 symbolic aura and chakra life-theme atlas for ZHAOWU.",
    `Subject label: ${displayName}.`,
    "This is symbolic visual storytelling only — not a medical test, energy measurement, religious ranking, reincarnation claim or objective chakra diagnosis.",
    `Primary colour: ${aura.primaryColor}.`,
    `Supporting colours: ${aura.secondaryColors.join(", ")}.`,
    `Accent colour: ${aura.accentColor ?? "none"}.`,
    `Protective base colour: ${aura.baseColor}.`,
    `Current development theme: ${aura.currentDevelopmentTheme}.`,
    `Mission line: ${aura.missionLine}.`,
    "Use the common seven-chakra colour language only as a visual metaphor. No percentages, no fake scans, no anatomical diagnosis, no starseed/high-dimensional identity, and no religious-system collage.",
    "Visual language: refined old silk/xuan paper merged with restrained mineral-colour light bands, moon-disc or landscape motifs; clear atlas structure; no modern game UI. Generate clean artwork without readable text or watermark; exact typography and STONE 原創 watermark are added by the product layer.",
  ].join("\n");
}

export function buildPaidVisualBlueprint(
  training: FunctionalTrainingResult,
  aura: AuraBlueprint | null,
  payment: PaymentContext,
): PaidVisualBlueprint {
  const paid = canGeneratePaidVisuals(payment);
  const actionable = Boolean(training.selectedState && mayActivelyTrainElement(training.selectedState));
  const enabled = paid && actionable && Boolean(training.selectedElement) && Boolean(aura);
  return {
    version: "ZW-PAID-VISUAL-1.0",
    enabled,
    tierRequired: "paid_basic",
    selectedElement: training.selectedElement,
    selectedState: training.selectedState,
    functionalTheme: training.functionalTheme,
    elementImage: {
      enabled,
      prompt: enabled ? buildElementImagePrompt(training) : null,
      aspectRatio: "9:16",
      watermark: "STONE 原創",
    },
    auraImage: {
      enabled,
      prompt: enabled && aura ? buildAuraImagePrompt(aura) : null,
      aspectRatio: "9:16",
      watermark: "STONE 原創",
    },
  };
}

export type PaidVisualGenerationResult =
  | { generated: false; reason: "PAYMENT_REQUIRED" | "VISUAL_BLUEPRINT_DISABLED"; jobs: [] }
  | { generated: true; jobs: { type: "five_element" | "aura"; prompt: string; aspectRatio: "9:16" }[] };

/**
 * This prepares server-side jobs only. It does not call an image provider.
 * A future paid backend must re-check payment state server-side before executing the jobs.
 */
export function preparePaidVisualJobs(payment: PaymentContext, blueprint: PaidVisualBlueprint): PaidVisualGenerationResult {
  if (!canGeneratePaidVisuals(payment)) return { generated: false, reason: "PAYMENT_REQUIRED", jobs: [] };
  if (!blueprint.enabled) return { generated: false, reason: "VISUAL_BLUEPRINT_DISABLED", jobs: [] };
  const jobs: { type: "five_element" | "aura"; prompt: string; aspectRatio: "9:16" }[] = [];
  if (blueprint.elementImage.enabled && blueprint.elementImage.prompt) jobs.push({ type: "five_element", prompt: blueprint.elementImage.prompt, aspectRatio: "9:16" });
  if (blueprint.auraImage.enabled && blueprint.auraImage.prompt) jobs.push({ type: "aura", prompt: blueprint.auraImage.prompt, aspectRatio: "9:16" });
  return { generated: true, jobs };
}
