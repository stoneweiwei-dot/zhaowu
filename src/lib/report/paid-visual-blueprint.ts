import type { FunctionalTrainingResult, FunctionalElementState } from "@/lib/report/five-element-functional-training";
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
  paidVisualsEnabled: boolean;
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

function stateInstruction(state: FunctionalElementState): string {
  switch (state) {
    case "beneficial_but_insufficient":
      return "This is an active training theme: strengthen the real-life function in a moderate, sustainable way.";
    case "beneficial_but_blocked":
      return "This is a blocked training theme: show clearing the blockage first, then moderate practice; do not portray blind supplementation.";
    case "already_sufficient":
      return "This function is already sufficient: portray maintenance and steadiness, not adding more intensity.";
    case "overactive":
      return "This function is overactive: portray draining, balancing or redirecting it; explicitly avoid strengthening the same function.";
    case "apparently_missing_but_not_to_add":
      return "This function may look sparse but must not be supplemented: portray restraint and the reason not to chase surface deficiency.";
    case "needs_mother_qi_or_bridging":
      return "Support or bridging comes first: portray the supporting condition or circulation path before any direct strengthening.";
  }
}

export function buildElementImagePrompt(training: FunctionalTrainingResult): string | null {
  if (!training.selectedElement || !training.selectedState) return null;
  return [
    "Create one premium vertical 9:16 ZHAOWU five-element functional-training artwork.",
    `Selected functional element: ${training.selectedElement}.`,
    `Current functional theme: ${training.functionalTheme}.`,
    `Current state: ${training.selectedState}.`,
    stateInstruction(training.selectedState),
    `Why now: ${training.whySelected}.`,
    `Practical training or regulation: ${training.howToUse.join("; ")}.`,
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
  const hasBlueprint = Boolean(training.selectedElement && training.selectedState && aura);
  const paidVisualsEnabled = canGeneratePaidVisuals(payment) && hasBlueprint;
  const elementPrompt = hasBlueprint ? buildElementImagePrompt(training) : null;
  const auraPrompt = hasBlueprint && aura ? buildAuraImagePrompt(aura) : null;
  return {
    version: "ZW-PAID-VISUAL-1.0",
    enabled: paidVisualsEnabled,
    paidVisualsEnabled,
    tierRequired: "paid_basic",
    selectedElement: training.selectedElement,
    selectedState: training.selectedState,
    functionalTheme: training.functionalTheme,
    elementImage: {
      enabled: paidVisualsEnabled,
      prompt: elementPrompt,
      aspectRatio: "9:16",
      watermark: "STONE 原創",
    },
    auraImage: {
      enabled: paidVisualsEnabled,
      prompt: auraPrompt,
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
 * The executing backend must re-check payment state immediately before any provider request.
 */
export function preparePaidVisualJobs(payment: PaymentContext, blueprint: PaidVisualBlueprint): PaidVisualGenerationResult {
  if (!canGeneratePaidVisuals(payment)) return { generated: false, reason: "PAYMENT_REQUIRED", jobs: [] };
  if (!blueprint.enabled || !blueprint.paidVisualsEnabled) return { generated: false, reason: "VISUAL_BLUEPRINT_DISABLED", jobs: [] };
  const jobs: { type: "five_element" | "aura"; prompt: string; aspectRatio: "9:16" }[] = [];
  if (blueprint.elementImage.enabled && blueprint.elementImage.prompt) jobs.push({ type: "five_element", prompt: blueprint.elementImage.prompt, aspectRatio: "9:16" });
  if (blueprint.auraImage.enabled && blueprint.auraImage.prompt) jobs.push({ type: "aura", prompt: blueprint.auraImage.prompt, aspectRatio: "9:16" });
  return { generated: true, jobs };
}
