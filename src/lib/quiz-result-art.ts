// Result-art picker for symbolic quizzes.
// Maps a quiz result to a real library portrait (same-origin static WebP under /quiz-art/)
// instead of a generic line-art SVG. Selection is deterministic: same answers -> same image.
// Only images that passed per-image visual review are listed (see docs/GALLERY.md).

export type DivineFamily = "buddha" | "bodhisattva" | "guardian" | "immortal";

export const DIVINE_ART_POOL: Record<DivineFamily, readonly string[]> = {
  buddha: [1, 2, 3].map((n) => `/quiz-art/divine/buddha-${n}.webp`),
  bodhisattva: [1, 2, 3, 4].map((n) => `/quiz-art/divine/bodhisattva-${n}.webp`),
  guardian: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `/quiz-art/divine/guardian-${n}.webp`),
  immortal: [1, 2, 3].map((n) => `/quiz-art/divine/immortal-${n}.webp`),
};

/** FNV-1a 32-bit hash; stable across sessions/devices. */
export function hashAnswers(parts: readonly string[]): number {
  let h = 0x811c9dc5;
  for (const ch of parts.join("|")) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Pick the library portrait closest to the customer's answers: the primary family decides the pool;
 * the full answer sequence (and the secondary lean) decides which portrait inside it.
 */
export function pickDivineArt(
  family: DivineFamily,
  answers: readonly string[],
  secondary?: DivineFamily | null,
): string | null {
  const pool = DIVINE_ART_POOL[family];
  if (!pool.length) return null;
  const index = hashAnswers([family, secondary ?? "", ...answers]) % pool.length;
  return pool[index];
}

export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";

/** Five-element quiz -> approved heavenly-stem paintings (qc-manifest faceHeadQc = pass). */
export const ELEMENT_ART_POOL: Record<ElementKey, readonly string[]> = {
  wood: ["/report-visuals/full/jia-wood.webp", "/report-visuals/full/yi-wood.webp"],
  fire: ["/report-visuals/full/bing-fire.webp", "/report-visuals/full/ding-fire.webp"],
  earth: ["/report-visuals/full/wu-earth.webp", "/report-visuals/full/ji-earth.webp"],
  metal: ["/report-visuals/full/geng-metal.webp", "/report-visuals/full/xin-metal.webp"],
  water: ["/report-visuals/full/ren-water.webp", "/report-visuals/full/gui-water.webp"],
};

export function pickElementArt(
  element: ElementKey,
  answers: readonly string[],
  secondary?: ElementKey | null,
): string {
  const pool = ELEMENT_ART_POOL[element];
  return pool[hashAnswers([element, secondary ?? "", ...answers]) % pool.length];
}
