export type QizhengInput = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timezone: string;
  timeUnknown?: boolean;
};

export type QizhengBodyKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "ji"
  | "luo"
  | "bei"
  | "ziqi";

export type QizhengBody = {
  key: QizhengBodyKey;
  longitude: number;
  palace: string;
  palaceDegree: number;
  retrograde: boolean;
  virtual: boolean;
  confidence: "astronomical" | "derived" | "traditional";
};

export type QizhengResult = {
  utcIso: string;
  profile: "ZW-QZ-TROPICAL-0.1";
  bodies: QizhengBody[];
};

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const DAY_MS = 86_400_000;
const BRANCHES = ["戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥"] as const;

function rev(value: number) {
  return ((value % 360) + 360) % 360;
}

function sinD(value: number) {
  return Math.sin(value * DEG);
}

function cosD(value: number) {
  return Math.cos(value * DEG);
}

function atan2D(y: number, x: number) {
  return Math.atan2(y, x) * RAD;
}

function angleDelta(a: number, b: number) {
  return ((a - b + 540) % 360) - 180;
}

function timezoneParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const out: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") out[part.type] = Number(part.value);
  }
  return out as Record<"year" | "month" | "day" | "hour" | "minute" | "second", number>;
}

function timezoneOffsetMs(date: Date, timezone: string) {
  const p = timezoneParts(date, timezone);
  const representedUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return representedUtc - date.getTime();
}

export function localBirthToUtc(input: QizhengInput) {
  const localAsUtc = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, 0);
  let guess = localAsUtc;
  for (let i = 0; i < 4; i += 1) {
    const offset = timezoneOffsetMs(new Date(guess), input.timezone);
    const next = localAsUtc - offset;
    if (Math.abs(next - guess) < 1) break;
    guess = next;
  }
  return new Date(guess);
}

function daysFromEpoch(instant: Date) {
  const jd = instant.getTime() / DAY_MS + 2_440_587.5;
  return jd - 2_451_543.5;
}

function solveEccentricAnomaly(meanAnomaly: number, eccentricity: number) {
  let e = meanAnomaly + RAD * eccentricity * sinD(meanAnomaly) * (1 + eccentricity * cosD(meanAnomaly));
  for (let i = 0; i < 8; i += 1) {
    const next = e - (e - RAD * eccentricity * Math.sin(e * DEG) - meanAnomaly) / (1 - eccentricity * Math.cos(e * DEG));
    if (Math.abs(next - e) < 1e-7) return next;
    e = next;
  }
  return e;
}

function sunPosition(d: number) {
  const w = 282.9404 + 4.70935e-5 * d;
  const e = 0.016709 - 1.151e-9 * d;
  const m = rev(356.047 + 0.9856002585 * d);
  const E = solveEccentricAnomaly(m, e);
  const x = cosD(E) - e;
  const y = Math.sqrt(1 - e * e) * sinD(E);
  const r = Math.hypot(x, y);
  const v = atan2D(y, x);
  const longitude = rev(v + w);
  return {
    longitude,
    r,
    x: r * cosD(longitude),
    y: r * sinD(longitude),
    meanAnomaly: m,
    perihelion: w,
  };
}

type PlanetName = "mercury" | "venus" | "mars" | "jupiter" | "saturn";

type Elements = { N: number; i: number; w: number; e: number; a: number; M: number };

function planetElements(name: PlanetName, d: number): Elements {
  switch (name) {
    case "mercury":
      return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5e-8 * d, w: 29.1241 + 1.01444e-5 * d, e: 0.205635 + 5.59e-10 * d, a: 0.387098, M: 168.6562 + 4.0923344368 * d };
    case "venus":
      return { N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, e: 0.006773 - 1.302e-9 * d, a: 0.72333, M: 48.0052 + 1.6021302244 * d };
    case "mars":
      return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, e: 0.093405 + 2.516e-9 * d, a: 1.523688, M: 18.6021 + 0.5240207766 * d };
    case "jupiter":
      return { N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, e: 0.048498 + 4.469e-9 * d, a: 5.20256, M: 19.895 + 0.0830853001 * d };
    case "saturn":
      return { N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, e: 0.055546 - 9.499e-9 * d, a: 9.55475, M: 316.967 + 0.0334442282 * d };
  }
}

function giantPlanetCorrection(name: PlanetName, d: number) {
  if (name !== "jupiter" && name !== "saturn") return 0;
  const mj = rev(planetElements("jupiter", d).M);
  const ms = rev(planetElements("saturn", d).M);
  if (name === "jupiter") {
    return (
      -0.332 * sinD(2 * mj - 5 * ms - 67.6) -
      0.056 * sinD(2 * mj - 2 * ms + 21) +
      0.042 * sinD(3 * mj - 5 * ms + 21) -
      0.036 * sinD(mj - 2 * ms) +
      0.022 * cosD(mj - ms) +
      0.023 * sinD(2 * mj - 3 * ms + 52) -
      0.016 * sinD(mj - 5 * ms - 69)
    );
  }
  return (
    0.812 * sinD(2 * mj - 5 * ms - 67.6) -
    0.229 * cosD(2 * mj - 4 * ms - 2) +
    0.119 * sinD(mj - 2 * ms - 3) +
    0.046 * sinD(2 * mj - 6 * ms - 69) +
    0.014 * sinD(mj - 3 * ms + 32)
  );
}

function planetLongitude(name: PlanetName, d: number) {
  const el = planetElements(name, d);
  const M = rev(el.M);
  const E = solveEccentricAnomaly(M, el.e);
  const x = el.a * (cosD(E) - el.e);
  const y = el.a * Math.sqrt(1 - el.e * el.e) * sinD(E);
  const r = Math.hypot(x, y);
  const v = atan2D(y, x);
  const lon = rev(v + el.w + giantPlanetCorrection(name, d));
  const xh = r * (cosD(el.N) * cosD(lon) - sinD(el.N) * sinD(lon) * cosD(el.i));
  const yh = r * (sinD(el.N) * cosD(lon) + cosD(el.N) * sinD(lon) * cosD(el.i));
  const zh = r * sinD(lon) * sinD(el.i);
  const sun = sunPosition(d);
  return rev(atan2D(yh + sun.y, xh + sun.x + zh * 0));
}

function moonPosition(d: number) {
  const N = rev(125.1228 - 0.0529538083 * d);
  const i = 5.1454;
  const w = rev(318.0634 + 0.1643573223 * d);
  const a = 60.2666;
  const e = 0.0549;
  const M = rev(115.3654 + 13.0649929509 * d);
  const E = solveEccentricAnomaly(M, e);
  const x = a * (cosD(E) - e);
  const y = a * Math.sqrt(1 - e * e) * sinD(E);
  const r = Math.hypot(x, y);
  const v = atan2D(y, x);
  const lonOrb = rev(v + w);
  const xh = r * (cosD(N) * cosD(lonOrb) - sinD(N) * sinD(lonOrb) * cosD(i));
  const yh = r * (sinD(N) * cosD(lonOrb) + cosD(N) * sinD(lonOrb) * cosD(i));
  let longitude = rev(atan2D(yh, xh));
  const sun = sunPosition(d);
  const ls = rev(sun.meanAnomaly + sun.perihelion);
  const lm = rev(M + w + N);
  const D = rev(lm - ls);
  const F = rev(lm - N);
  longitude = rev(
    longitude -
      1.274 * sinD(M - 2 * D) +
      0.658 * sinD(2 * D) -
      0.186 * sinD(sun.meanAnomaly) -
      0.059 * sinD(2 * M - 2 * D) -
      0.057 * sinD(M - 2 * D + sun.meanAnomaly) +
      0.053 * sinD(M + 2 * D) +
      0.046 * sinD(2 * D - sun.meanAnomaly) +
      0.041 * sinD(M - sun.meanAnomaly) -
      0.035 * sinD(D) -
      0.031 * sinD(M + sun.meanAnomaly) -
      0.015 * sinD(2 * F - 2 * D) +
      0.011 * sinD(M - 4 * D),
  );
  return { longitude, N, w, M, D, F, solarM: sun.meanAnomaly };
}

function trueNorthNode(d: number) {
  const moon = moonPosition(d);
  const correction =
    -1.4979 * sinD(2 * (moon.D - moon.F)) -
    0.15 * sinD(moon.solarM) -
    0.1226 * sinD(2 * moon.D) +
    0.1176 * sinD(2 * moon.F) -
    0.0801 * sinD(2 * (moon.M - moon.F));
  return rev(moon.N + correction);
}

function lunarApogee(d: number) {
  const N = 125.1228 - 0.0529538083 * d;
  const w = 318.0634 + 0.1643573223 * d;
  return rev(N + w + 180);
}

// Traditional Zi Qi is not a physical planet. This profile keeps it as a
// separate mean-motion layer (about one circuit in 28 years), calibrated at
// J2000 against the cross-software reference used for Zhaowu's truth-layer QA.
function traditionalZiQi(jd: number) {
  const j2000Longitude = 189.420630883135;
  const dailyMotion = 360 / (28 * 365.2422);
  return rev(j2000Longitude + (jd - 2_451_545.0) * dailyMotion);
}

function palaceOf(longitude: number) {
  const lon = rev(longitude);
  const index = Math.floor(lon / 30) % 12;
  return { palace: BRANCHES[index], degree: lon - index * 30 };
}

function body(key: QizhengBodyKey, longitude: number, retrograde: boolean, confidence: QizhengBody["confidence"]): QizhengBody {
  const p = palaceOf(longitude);
  return {
    key,
    longitude: rev(longitude),
    palace: p.palace,
    palaceDegree: p.degree,
    retrograde,
    virtual: confidence !== "astronomical",
    confidence,
  };
}

function isRetrograde(name: PlanetName, d: number) {
  const before = planetLongitude(name, d - 0.25);
  const after = planetLongitude(name, d + 0.25);
  return angleDelta(after, before) < 0;
}

export function calculateQizheng(input: QizhengInput): QizhengResult | null {
  if (input.timeUnknown) return null;
  const utc = localBirthToUtc(input);
  const jd = utc.getTime() / DAY_MS + 2_440_587.5;
  const d = daysFromEpoch(utc);
  const sun = sunPosition(d).longitude;
  const moon = moonPosition(d).longitude;
  const north = trueNorthNode(d);
  const apogee = lunarApogee(d);
  const planets: PlanetName[] = ["mercury", "venus", "mars", "jupiter", "saturn"];
  const planetBodies = planets.map((name) => body(name, planetLongitude(name, d), isRetrograde(name, d), "astronomical"));
  return {
    utcIso: utc.toISOString(),
    profile: "ZW-QZ-TROPICAL-0.1",
    bodies: [
      body("sun", sun, false, "astronomical"),
      body("moon", moon, false, "astronomical"),
      ...planetBodies,
      body("ji", north, true, "derived"),
      body("luo", rev(north + 180), true, "derived"),
      body("bei", apogee, false, "derived"),
      body("ziqi", traditionalZiQi(jd), false, "traditional"),
    ],
  };
}
