import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { D60KarmaSection } from "@/components/d60-karma-section";
import { PalmStandalone } from "@/components/palm-standalone";

const D60_ASTRO_SCRIPT_ID = "zhaowu-astronomy-engine-d60";
const D60_ASTRO_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js";

type D60AstronomyApi = {
  EclipticLongitude: (body: string, date: Date) => number;
  GeoVector: (body: string, date: Date, aberration: boolean) => unknown;
  Ecliptic: (vector: unknown) => { elon: number };
  __zhaowuD60Geocentric?: boolean;
};

export const Route = createFileRoute("/yizhangjing")({ component: PastLifePage });

function D60AstronomyBootstrap() {
  useEffect(() => {
    const browser = window as typeof window & { Astronomy?: D60AstronomyApi };
    const patchGeocentricLongitude = () => {
      const astronomy = browser.Astronomy;
      if (!astronomy || astronomy.__zhaowuD60Geocentric) return;
      astronomy.EclipticLongitude = (body: string, date: Date) => astronomy.Ecliptic(astronomy.GeoVector(body, date, true)).elon;
      astronomy.__zhaowuD60Geocentric = true;
    };

    patchGeocentricLongitude();
    let script = document.getElementById(D60_ASTRO_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = D60_ASTRO_SCRIPT_ID;
      script.src = D60_ASTRO_SCRIPT_URL;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
    script.addEventListener("load", patchGeocentricLongitude);
    return () => script?.removeEventListener("load", patchGeocentricLongitude);
  }, []);
  return null;
}

function PastLifePage() {
  return (
    <>
      <D60AstronomyBootstrap />
      <PalmStandalone />
      <D60KarmaSection />
    </>
  );
}
