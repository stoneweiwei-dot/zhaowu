import type { Locale } from "@/lib/i18n";
import { JOURNEY_COPY, type JourneyStep } from "@/lib/site-journey";

export function JourneySteps({ locale, current, hasBirth, onSelect }: { locale: Locale; current: JourneyStep; hasBirth: boolean; onSelect: (step: JourneyStep) => void }) {
  const copy = JOURNEY_COPY[locale];
  return <nav className="zw-flow-progress" aria-label={copy.title}>
    <ol data-home-steps>
      {copy.steps.map((label, index) => {
        const step = (index + 1) as JourneyStep;
        return <li key={step}><button type="button" aria-current={current === step ? "step" : undefined} disabled={step > 1 && !hasBirth} onClick={() => onSelect(step)}><span aria-hidden="true">{step}</span>{label}</button></li>;
      })}
    </ol>
  </nav>;
}
