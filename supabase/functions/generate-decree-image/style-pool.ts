export type GuardianStyle = {
  id: string;
  label: string;
  weight: number;
  directive: string;
};

export const GUARDIAN_STYLE_POOL_VERSION = "guardian-style-pool-v1-20260825";

export const GUARDIAN_STYLE_POOL: GuardianStyle[] = [
  {
    id: "song_saturated_sacred_v1",
    label: "濃郁版宋氏聖相風",
    weight: 55,
    directive:
      "Use a concentrated Song-inspired sacred portrait treatment: richer mineral pigments than the old pale version, especially celadon, jade green, turquoise, azurite blue, warm ochre-gold and restrained cinnabar. Keep the image luminous and elegant, but with clearer contour separation, more visible garment detail and stronger subject/background contrast. Avoid washed-out cream fog, chalky low saturation or overexposed pastel haze.",
  },
  {
    id: "concealed_sacred_icon_v1",
    label: "含藏聖相・遮面護法",
    weight: 30,
    directive:
      "Use the concealed-sacred-icon composition. If a celestial guardian or sacred figure appears, place it within a thin antique-gold circular moon-disc or mandala frame and let ONE meaningful object naturally conceal roughly 30–55% of the face. The concealing object must be semantically grounded in the report theme and the figure: for example a jade tablet, ritual book, fan, sword guard, round talisman, lotus, medicine vessel, cloud veil, moon-disc or other refined East Asian sacred implement. The pose should feel inward, calm, protective and dignified rather than shy-cute. Keep a neutral-to-masculine sacred presence unless the subject itself calls for a feminine archetype. Do not cover the entire face and do not repeat the same object mechanically across generations.",
  },
  {
    id: "song_mineral_guardian_v1",
    label: "宋氏岩彩護法風",
    weight: 15,
    directive:
      "Use a protective guardian-archetype treatment with slightly deeper Song-inspired mineral colors, firmer gold linework and a more grounded protective posture. Keep it museum-like and painterly, not martial-game art. The figure may hold one symbolic implement tied to the report, but avoid weapon spectacle, aggressive combat staging or generic fantasy armor.",
  },
];

function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function chooseGuardianStyle(seed: string): GuardianStyle {
  const total = GUARDIAN_STYLE_POOL.reduce((sum, style) => sum + style.weight, 0);
  if (total <= 0) return GUARDIAN_STYLE_POOL[0];
  let bucket = fnv1a32(seed) % total;
  for (const style of GUARDIAN_STYLE_POOL) {
    if (bucket < style.weight) return style;
    bucket -= style.weight;
  }
  return GUARDIAN_STYLE_POOL[GUARDIAN_STYLE_POOL.length - 1];
}
