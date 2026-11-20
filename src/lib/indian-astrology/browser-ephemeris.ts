/**
 * Browser astronomy bridge for the independent Parashari calculation core.
 *
 * Uses the existing self-hosted Astronomy Engine bundle, not a new SaaS/API.
 * Positions are geocentric apparent ecliptic coordinates. Mean Rahu/Ketu use
 * the standard Meeus mean lunar-node polynomial, not a true-node claim.
 * Lahiri follows the project's existing approximation and MUST be labelled
 * accordingly; an authoritative Swiss Ephemeris adapter is still needed for
 * professional boundary-sensitive certification.
 */
import { lahiriAyanamsa, tropicalAscendant, type AstronomyApi } from "./engine";
import type {
  Graha, JyotishEphemeris, EphemerisInstant, Ayanamsa,
} from "./parashari-engine";

type Astro = AstronomyApi & {
  GeoVector: (body: string, date: Date, aberration: boolean) => { x: number; y: number; z: number };
  Ecliptic: (vector: { x: number; y: number; z: number }) => { elon: number; elat: number };
};

const ASTRO_SCRIPT_ID = "zhaowu-astronomy-engine-d60";
const ASTRO_SCRIPT_URL = "/vendor/astronomy-engine-2.1.19.browser.min.js";
const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
const norm = (x: number) => ((x % 360) + 360) % 360;
const difference = (a: number, b: number) => ((a - b + 540) % 360) - 180;
let loading: Promise<Astro> | null = null;

export function loadIndianAstronomy(): Promise<Astro> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser astronomy unavailable"));
  const browser = window as typeof window & { Astronomy?: Astro };
  if (browser.Astronomy) return Promise.resolve(browser.Astronomy);
  if (loading) return loading;
  loading = new Promise<Astro>((resolve, reject) => {
    const existing = document.getElementById(ASTRO_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const success = () => browser.Astronomy ? resolve(browser.Astronomy) : reject(new Error("Astronomy Engine missing"));
    script.addEventListener("load", success, { once: true });
    script.addEventListener("error", () => reject(new Error("Self-hosted astronomical script unavailable")), { once: true });
    if (!existing) {
      script.id = ASTRO_SCRIPT_ID;
      script.src = ASTRO_SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    } else if (browser.Astronomy) {
      success();
    }
  }).catch((error: unknown) => { loading = null; throw error; });
  return loading;
}

function meanNodeTropical(date: Date): number {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5;
  const t = (jd - 2_451_545) / 36_525;
  return norm(125.04452 - 1934.136261 * t + 0.0020708 * t ** 2 + t ** 3 / 450_000);
}

function longitude(api: Astro, body: string, at: Date): number {
  return norm(api.Ecliptic(api.GeoVector(body, at, true)).elon);
}

function speed(api: Astro, body: string, at: Date): number {
  const day = 86_400_000;
  return difference(longitude(api, body, new Date(at.getTime() + day / 2)),
    longitude(api, body, new Date(at.getTime() - day / 2)));
}

/** This adapter intentionally supports Lahiri only until an audited Raman/KP backend is wired. */
export async function createBrowserJyotishEphemeris(): Promise<JyotishEphemeris> {
  const astronomy = await loadIndianAstronomy();
  return {
    async calculateInstant({ utc, latitude, longitude: eastLongitude, ayanamsa }: {
      utc: string; latitude: number; longitude: number; ayanamsa: Ayanamsa;
    }): Promise<EphemerisInstant> {
      if (ayanamsa !== "lahiri") {
        throw new Error("Raman/KP 尚未連接可信的 Ayanamsa 星曆，不提供猜測數字。");
      }
      const date = new Date(utc);
      if (!Number.isFinite(date.getTime())) throw new Error("Invalid UTC instant");
      const offset = lahiriAyanamsa(date);
      const bodies = {} as EphemerisInstant["bodies"];
      for (const graha of PLANETS) {
        bodies[graha] = {
          longitude: norm(longitude(astronomy, graha, date) - offset),
          speedLongitude: speed(astronomy, graha, date),
        };
      }
      const meanRahu = norm(meanNodeTropical(date) - offset);
      bodies.Rahu = { longitude: meanRahu, speedLongitude: -0.053 };
      bodies.Ketu = { longitude: norm(meanRahu + 180), speedLongitude: -0.053 };
      for (const graha of [...PLANETS, "Rahu", "Ketu"] as Graha[]) {
        if (!Number.isFinite(bodies[graha].longitude)) {
          throw new Error(`Invalid astronomical position for ${graha}`);
        }
      }
      return {
        ascendantLongitude: norm(tropicalAscendant(astronomy, date, latitude, eastLongitude) - offset),
        bodies,
        ayanamsaDegrees: offset,
        julianDayUt: date.getTime() / 86_400_000 + 2_440_587.5,
        provenance: "Astronomy Engine 2.1.19 · project Lahiri approximation · Meeus mean lunar node; not Swiss-certified",
      };
    },
  };
}
