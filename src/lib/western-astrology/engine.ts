export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];
export type ClassicalPlanetKey = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";
export type ModernPlanetKey = ClassicalPlanetKey | "Uranus" | "Neptune" | "Pluto";
export type PointKey = ModernPlanetKey | "NorthNode" | "SouthNode" | "Lilith" | "Ascendant" | "MC";
export type HouseSystem = "placidus" | "whole" | "equal";
export type ElementName = "fire" | "earth" | "air" | "water";
export type ModalityName = "cardinal" | "fixed" | "mutable";
export type Dignity = "domicile" | "exaltation" | "detriment" | "fall" | "peregrine";

export type ZodiacPosition = {
  key: PointKey;
  longitude: number;
  signIndex: number;
  sign: ZodiacSign;
  degreeInSign: number;
  retrograde?: boolean;
};

export type ChartAngles = {
  ascendant: number;
  descendant: number;
  mc: number;
  ic: number;
  ramc: number;
  obliquity: number;
};

export type HouseChart = {
  system: HouseSystem;
  requestedSystem: HouseSystem;
  cusps: number[];
  fallback?: string;
};

export type AspectName = "conjunction" | "sextile" | "square" | "trine" | "opposition";
export type Aspect = {
  a: PointKey;
  b: PointKey;
  type: AspectName;
  exactAngle: number;
  separation: number;
  orb: number;
};

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const DAY_MS = 86_400_000;

export function normalizeAngle(value: number) {
  return ((value % 360) + 360) % 360;
}

export function wrap180(value: number) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

export function julianDay(date: Date) {
  return date.getTime() / DAY_MS + 2_440_587.5;
}

export function signIndexFromLongitude(longitude: number) {
  return Math.floor(normalizeAngle(longitude) / 30);
}

export function decoratePosition(key: PointKey, longitude: number, retrograde?: boolean): ZodiacPosition {
  const lon = normalizeAngle(longitude);
  const signIndex = signIndexFromLongitude(lon);
  return {
    key,
    longitude: lon,
    signIndex,
    sign: ZODIAC_SIGNS[signIndex],
    degreeInSign: lon - signIndex * 30,
    retrograde,
  };
}

export function meanObliquity(date: Date) {
  const t = (julianDay(date) - 2_451_545.0) / 36_525;
  return 23 + 26 / 60 + 21.448 / 3600 - (46.815 * t + 0.00059 * t * t - 0.001813 * t * t * t) / 3600;
}

function eclipticLongitudeFromRA(raDegrees: number, obliquityDegrees: number) {
  const ra = raDegrees * D2R;
  const eps = obliquityDegrees * D2R;
  return normalizeAngle(Math.atan2(Math.sin(ra), Math.cos(ra) * Math.cos(eps)) * R2D);
}

function declinationOfEclipticPoint(longitude: number, obliquityDegrees: number) {
  return Math.asin(Math.sin(obliquityDegrees * D2R) * Math.sin(longitude * D2R)) * R2D;
}

export function computeAngles(params: { date: Date; gmstDegrees: number; latitude: number; longitude: number }): ChartAngles {
  const { date, gmstDegrees, latitude, longitude } = params;
  const eps = meanObliquity(date);
  const ramc = normalizeAngle(gmstDegrees + longitude);
  const ramcR = ramc * D2R;
  const epsR = eps * D2R;
  const phiR = latitude * D2R;

  const mc = normalizeAngle(Math.atan2(Math.sin(ramcR), Math.cos(ramcR) * Math.cos(epsR)) * R2D);
  let asc = normalizeAngle(
    Math.atan2(
      Math.cos(ramcR),
      -(Math.sin(ramcR) * Math.cos(epsR) + Math.tan(phiR) * Math.sin(epsR)),
    ) * R2D,
  );

  if (normalizeAngle(asc - mc) > 180) asc = normalizeAngle(asc + 180);

  return {
    ascendant: asc,
    descendant: normalizeAngle(asc + 180),
    mc,
    ic: normalizeAngle(mc + 180),
    ramc,
    obliquity: eps,
  };
}

// Placidus intermediate cusps adapted from the MIT-licensed free-human-design
// house solver (adamblvck/free-human-design, src/hd/houses.js). The method is
// the standard iterative semi-arc construction; polar latitudes fall back to
// Whole Sign rather than returning invented cusps.
function placidusIntermediate(ramc: number, eps: number, latitude: number, which: "11" | "12" | "2" | "3") {
  const phiR = latitude * D2R;
  const initialOffset = { "11": 30, "12": 60, "2": 120, "3": 150 }[which];
  let ra = ramc + initialOffset;

  const targetRA = (semiDiurnalArc: number) => {
    const nocturnalArc = 180 - semiDiurnalArc;
    if (which === "11") return ramc + semiDiurnalArc / 3;
    if (which === "12") return ramc + (2 * semiDiurnalArc) / 3;
    if (which === "2") return ramc + semiDiurnalArc + nocturnalArc / 3;
    return ramc + semiDiurnalArc + (2 * nocturnalArc) / 3;
  };

  for (let i = 0; i < 100; i += 1) {
    const lon = eclipticLongitudeFromRA(ra, eps);
    const decl = declinationOfEclipticPoint(lon, eps);
    const cosSemiArc = -Math.tan(phiR) * Math.tan(decl * D2R);
    if (cosSemiArc <= -1 || cosSemiArc >= 1) return null;
    const semiArc = Math.acos(cosSemiArc) * R2D;
    const next = targetRA(semiArc);
    if (Math.abs(wrap180(next - ra)) < 1e-9) {
      ra = next;
      break;
    }
    ra = next;
  }
  return eclipticLongitudeFromRA(ra, eps);
}

export function computeHouses(angles: ChartAngles, latitude: number, system: HouseSystem): HouseChart {
  const cusps = new Array<number>(12);
  if (system === "whole") {
    const base = Math.floor(normalizeAngle(angles.ascendant) / 30) * 30;
    for (let i = 0; i < 12; i += 1) cusps[i] = normalizeAngle(base + i * 30);
    return { system, requestedSystem: system, cusps };
  }
  if (system === "equal") {
    for (let i = 0; i < 12; i += 1) cusps[i] = normalizeAngle(angles.ascendant + i * 30);
    return { system, requestedSystem: system, cusps };
  }

  const c11 = placidusIntermediate(angles.ramc, angles.obliquity, latitude, "11");
  const c12 = placidusIntermediate(angles.ramc, angles.obliquity, latitude, "12");
  const c2 = placidusIntermediate(angles.ramc, angles.obliquity, latitude, "2");
  const c3 = placidusIntermediate(angles.ramc, angles.obliquity, latitude, "3");
  if ([c11, c12, c2, c3].some((value) => value == null)) {
    const whole = computeHouses(angles, latitude, "whole");
    return {
      ...whole,
      requestedSystem: "placidus",
      fallback: "Placidus is undefined at this latitude; Whole Sign was used instead.",
    };
  }

  cusps[0] = angles.ascendant;
  cusps[1] = c2!;
  cusps[2] = c3!;
  cusps[3] = angles.ic;
  cusps[4] = normalizeAngle(c11! + 180);
  cusps[5] = normalizeAngle(c12! + 180);
  cusps[6] = angles.descendant;
  cusps[7] = normalizeAngle(c2! + 180);
  cusps[8] = normalizeAngle(c3! + 180);
  cusps[9] = angles.mc;
  cusps[10] = c11!;
  cusps[11] = c12!;
  return { system: "placidus", requestedSystem: "placidus", cusps };
}

export function houseOf(longitude: number, houseChart: HouseChart) {
  const lon = normalizeAngle(longitude);
  for (let i = 0; i < 12; i += 1) {
    const start = normalizeAngle(houseChart.cusps[i]);
    const end = normalizeAngle(houseChart.cusps[(i + 1) % 12]);
    const width = normalizeAngle(end - start);
    const offset = normalizeAngle(lon - start);
    if (offset < width || (i === 11 && Math.abs(offset - width) < 1e-9)) return i + 1;
  }
  return 1;
}

export function meanNorthNode(date: Date) {
  const t = (julianDay(date) - 2_451_545.0) / 36_525;
  return normalizeAngle(
    125.0445479 - 1934.1362891 * t + 0.0020754 * t * t + (t * t * t) / 467_441 - (t ** 4) / 60_616_000,
  );
}

export function meanLilith(date: Date) {
  const t = (julianDay(date) - 2_451_545.0) / 36_525;
  const meanMoonLongitude =
    218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + (t ** 3) / 538_841 - (t ** 4) / 65_194_000;
  const meanMoonAnomaly =
    134.9633964 + 477198.8675055 * t + 0.0087414 * t * t + (t ** 3) / 69_699 - (t ** 4) / 14_712_000;
  return normalizeAngle(meanMoonLongitude - meanMoonAnomaly + 180);
}

const ELEMENT_BY_SIGN: ElementName[] = [
  "fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water",
];
const MODALITY_BY_SIGN: ModalityName[] = [
  "cardinal", "fixed", "mutable", "cardinal", "fixed", "mutable", "cardinal", "fixed", "mutable", "cardinal", "fixed", "mutable",
];

export function elementOfSign(signIndex: number) { return ELEMENT_BY_SIGN[signIndex]; }
export function modalityOfSign(signIndex: number) { return MODALITY_BY_SIGN[signIndex]; }

const TRADITIONAL_RULERS: ClassicalPlanetKey[] = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];
export function traditionalRuler(signIndex: number) { return TRADITIONAL_RULERS[signIndex]; }

const DOMICILES: Record<ClassicalPlanetKey, number[]> = {
  Sun: [4], Moon: [3], Mercury: [2, 5], Venus: [1, 6], Mars: [0, 7], Jupiter: [8, 11], Saturn: [9, 10],
};
const EXALTATIONS: Record<ClassicalPlanetKey, number> = {
  Sun: 0, Moon: 1, Mercury: 5, Venus: 11, Mars: 9, Jupiter: 3, Saturn: 6,
};

export function traditionalDignity(planet: ClassicalPlanetKey, signIndex: number): Dignity {
  if (DOMICILES[planet].includes(signIndex)) return "domicile";
  if (EXALTATIONS[planet] === signIndex) return "exaltation";
  const detriments = DOMICILES[planet].map((value) => (value + 6) % 12);
  if (detriments.includes(signIndex)) return "detriment";
  if ((EXALTATIONS[planet] + 6) % 12 === signIndex) return "fall";
  return "peregrine";
}

export function solarAltitude(params: { sunLongitude: number; localSiderealDegrees: number; latitude: number; obliquity: number }) {
  const lon = params.sunLongitude * D2R;
  const eps = params.obliquity * D2R;
  const phi = params.latitude * D2R;
  const ra = normalizeAngle(Math.atan2(Math.sin(lon) * Math.cos(eps), Math.cos(lon)) * R2D);
  const dec = Math.asin(Math.sin(lon) * Math.sin(eps));
  const hourAngle = wrap180(params.localSiderealDegrees - ra) * D2R;
  const altitude = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(hourAngle));
  return altitude * R2D;
}

const ASPECTS: Array<{ type: AspectName; angle: number; orb: number }> = [
  { type: "conjunction", angle: 0, orb: 8 },
  { type: "sextile", angle: 60, orb: 4 },
  { type: "square", angle: 90, orb: 6 },
  { type: "trine", angle: 120, orb: 6 },
  { type: "opposition", angle: 180, orb: 8 },
];

export function calculateMajorAspects(points: ZodiacPosition[]) {
  const result: Aspect[] = [];
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const separation = Math.abs(wrap180(points[i].longitude - points[j].longitude));
      let best: Aspect | null = null;
      for (const candidate of ASPECTS) {
        const orb = Math.abs(separation - candidate.angle);
        if (orb <= candidate.orb && (!best || orb < best.orb)) {
          best = {
            a: points[i].key,
            b: points[j].key,
            type: candidate.type,
            exactAngle: candidate.angle,
            separation,
            orb,
          };
        }
      }
      if (best) result.push(best);
    }
  }
  return result.sort((a, b) => a.orb - b.orb);
}

export function summarizeBalance(points: ZodiacPosition[]) {
  const elements: Record<ElementName, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalities: Record<ModalityName, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const point of points) {
    elements[elementOfSign(point.signIndex)] += 1;
    modalities[modalityOfSign(point.signIndex)] += 1;
  }
  const dominantElement = (Object.entries(elements) as Array<[ElementName, number]>).sort((a, b) => b[1] - a[1])[0][0];
  const dominantModality = (Object.entries(modalities) as Array<[ModalityName, number]>).sort((a, b) => b[1] - a[1])[0][0];
  return { elements, modalities, dominantElement, dominantModality };
}

export function formatDegree(position: ZodiacPosition) {
  const degrees = Math.floor(position.degreeInSign);
  const minutes = Math.floor((position.degreeInSign - degrees) * 60);
  return `${degrees}°${String(minutes).padStart(2, "0")}′`;
}
