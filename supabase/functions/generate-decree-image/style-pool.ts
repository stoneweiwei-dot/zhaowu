export type GuardianStyle = {
  id: string;
  label: string;
  weight: number;
  directive: string;
};

export const GUARDIAN_STYLE_POOL_VERSION = "guardian-style-pool-v2-20260911";

export const GUARDIAN_STYLE_POOL: GuardianStyle[] = [
  {
    id: "song_saturated_sacred_v2",
    label: "濃郁版宋氏聖相風",
    weight: 55,
    directive:
      "Primary Zhaowu sacred-image direction. Use a richer, deeper Song-inspired sacred portrait treatment than the old pale Song look: refined gongbi linework, silk/xuan-paper atmosphere, mineral celadon, jade green, turquoise, azurite blue, warm ochre-gold and restrained cinnabar. Keep the image luminous, elegant and museum-like, with stronger subject/background separation, clear garment detail and phone-readable contrast. Avoid washed-out cream fog, chalky pastel haze, childish styling, glossy CG and game-card rendering.",
  },
  {
    id: "concealed_sacred_icon_v2",
    label: "含藏聖相・濃郁宋彩遮面護法",
    weight: 30,
    directive:
      "Use the concealed-sacred-icon composition on the richer saturated Song-mineral base. Place the guardian or sacred figure within a thin antique-gold circular moon-disc or mandala frame, with a clean single mineral-color field and generous negative space. Let ONE deity-specific meaningful object naturally conceal about 30–55% of the face. Derive the object from that figure's own mythology, scripture, seal, implement, mount, plant or emblem rather than repeating a generic book: examples include a jade decree/tablet, celestial register, ritual fan, sword guard, round talisman or bi-disc, lotus, medicine vessel, cloud veil, water orb/mirror, phoenix-feather screen, or Xuanwu/dragon emblem. The pose must feel inward, calm, protective, dignified and sacred rather than shy-cute. Keep a neutral-to-masculine sacred presence unless the subject itself requires otherwise. Do not hide the entire face. Do not mechanically reuse the same concealing object. Maintain richer mineral saturation, slightly firmer gold linework and clear phone-readable contrast; never return to the washed-out pale version.",
  },
  {
    id: "song_mineral_guardian_v2",
    label: "宋氏岩彩護法風",
    weight: 15,
    directive:
      "Use a protective guardian-archetype treatment with deeper Song-inspired mineral colors, firmer antique-gold linework and a grounded protective posture. Keep it museum-like and painterly, not martial-game art. One symbolic implement may be tied to the guardian/report, but avoid weapon spectacle, aggressive combat staging, generic fantasy armor, neon or muddy full-black backgrounds.",
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
