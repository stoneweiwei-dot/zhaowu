import type { CityHit } from "@/lib/bazi/types";

const BODY_KEYS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
type BodyKey = (typeof BODY_KEYS)[number];

export type D60Key = "Ascendant" | BodyKey;

export type AstronomyApi = {
  GeoVector: (body: string, date: Date, aberration: boolean) => unknown;
  Ecliptic: (vector: unknown) => { elon: number };
  SiderealTime: (date: Date) => number;
};

export type D60Placement = {
  key: D60Key;
  d60Sign: number;
  siderealLongitude: number;
  segment: number;
};

export type D60Result = {
  utcIso: string;
  placements: D60Placement[];
  stableMinus2: boolean;
  stablePlus2: boolean;
};

export type ReportBirth = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: CityHit;
};

function normalize(value: number) {
  return ((value % 360) + 360) % 360;
}

function wrap180(value: number) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function toRad(value: number) {
  return value * Math.PI / 180;
}

export function lahiriAyanamsa(date: Date) {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5;
  const t = (jd - 2_451_545.0) / 36_525;
  const initial = 23 * 3600 + 51 * 60 + 25.532;
  return (initial + 5029.0966 * t + 1.11161 * t * t) / 3600;
}

function meanObliquity(date: Date) {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5;
  const t = (jd - 2_451_545.0) / 36_525;
  return 23 + 26 / 60 + 21.448 / 3600 - (46.815 * t + 0.00059 * t * t - 0.001813 * t * t * t) / 3600;
}

export function tropicalAscendant(api: AstronomyApi, date: Date, latitude: number, longitude: number) {
  const lst = normalize(api.SiderealTime(date) * 15 + longitude);
  const eps = toRad(meanObliquity(date));
  const phi = toRad(latitude);
  const altitudeTerm = (lambda: number) => {
    const lam = toRad(normalize(lambda));
    const ra = normalize(Math.atan2(Math.sin(lam) * Math.cos(eps), Math.cos(lam)) * 180 / Math.PI);
    const dec = Math.asin(Math.sin(lam) * Math.sin(eps));
    const hourAngle = wrap180(lst - ra);
    const h = toRad(hourAngle);
    const altitude = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(h);
    return { altitude, hourAngle };
  };

  const roots: number[] = [];
  let previousX = 0;
  let previous = altitudeTerm(previousX).altitude;

  for (let x = 0.5; x <= 360; x += 0.5) {
    const current = altitudeTerm(x % 360).altitude;
    if (previous === 0 || previous * current < 0) {
      let low = previousX;
      let high = x;
      for (let i = 0; i < 36; i += 1) {
        const mid = (low + high) / 2;
        const lowValue = altitudeTerm(low % 360).altitude;
        const midValue = altitudeTerm(mid % 360).altitude;
        if (lowValue * midValue <= 0) high = mid;
        else low = mid;
      }
      const root = normalize((low + high) / 2);
      if (altitudeTerm(root).hourAngle < 0) roots.push(root);
    }
    previousX = x;
    previous = current;
  }

  if (!roots.length) throw new Error("ascendant");
  return roots[0];
}

export function d60Placement(key: D60Key, siderealLongitude: number): D60Placement {
  const lon = normalize(siderealLongitude);
  const natalSign = Math.floor(lon / 30);
  const within = lon % 30;
  const part = Math.min(59, Math.floor(within / 0.5));
  return {
    key,
    siderealLongitude: lon,
    d60Sign: (natalSign + part) % 12,
    segment: part + 1,
  };
}

export function calculateD60(api: AstronomyApi, date: Date, city: CityHit): D60Result {
  const ayanamsa = lahiriAyanamsa(date);
  const ascTropical = tropicalAscendant(api, date, city.latitude, city.longitude);
  const asc = d60Placement("Ascendant", normalize(ascTropical - ayanamsa));

  // Chart positions are geocentric. EclipticLongitude is heliocentric and
  // rejects the Sun, so keep the existing GeoVector -> Ecliptic path.
  const planets = BODY_KEYS.map((key) =>
    d60Placement(key, normalize(api.Ecliptic(api.GeoVector(key, date, true)).elon - ayanamsa)),
  );

  const lagnaAt = (deltaMinutes: number) => {
    const shifted = new Date(date.getTime() + deltaMinutes * 60_000);
    const shiftedAyanamsa = lahiriAyanamsa(shifted);
    return d60Placement(
      "Ascendant",
      normalize(tropicalAscendant(api, shifted, city.latitude, city.longitude) - shiftedAyanamsa),
    ).d60Sign;
  };

  return {
    utcIso: date.toISOString(),
    placements: [asc, ...planets],
    stableMinus2: lagnaAt(-2) === asc.d60Sign,
    stablePlus2: lagnaAt(2) === asc.d60Sign,
  };
}
