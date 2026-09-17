export type LoginSolarPhase = "day" | "night";

export type LoginSolarWindow = {
  phase: LoginSolarPhase;
  sunrise: Date | null;
  sunset: Date | null;
};

const RAD = Math.PI / 180;
const JULIAN_1970 = 2440588;
const JULIAN_2000 = 2451545;
const JULIAN_CYCLE_OFFSET = 0.0009;
const OBLIQUITY = 23.4397 * RAD;
const SUNRISE_ALTITUDE = -0.833 * RAD;

const toJulian = (date: Date) => date.valueOf() / 86400000 - 0.5 + JULIAN_1970;
const fromJulian = (julian: number) => new Date((julian + 0.5 - JULIAN_1970) * 86400000);
const toDays = (date: Date) => toJulian(date) - JULIAN_2000;
const solarMeanAnomaly = (days: number) => RAD * (357.5291 + 0.98560028 * days);
const eclipticLongitude = (meanAnomaly: number) => (
  meanAnomaly
  + RAD * (
    1.9148 * Math.sin(meanAnomaly)
    + 0.02 * Math.sin(2 * meanAnomaly)
    + 0.0003 * Math.sin(3 * meanAnomaly)
  )
  + RAD * 102.9372
  + Math.PI
);
const declination = (longitude: number) => Math.asin(Math.sin(longitude) * Math.sin(OBLIQUITY));
const julianCycle = (days: number, westLongitude: number) => (
  Math.round(days - JULIAN_CYCLE_OFFSET - westLongitude / (2 * Math.PI))
);
const approxTransit = (hourAngle: number, westLongitude: number, cycle: number) => (
  JULIAN_CYCLE_OFFSET + (hourAngle + westLongitude) / (2 * Math.PI) + cycle
);
const solarTransitJulian = (transit: number, meanAnomaly: number, longitude: number) => (
  JULIAN_2000
  + transit
  + 0.0053 * Math.sin(meanAnomaly)
  - 0.0069 * Math.sin(2 * longitude)
);

function normalizedLocalNoon(date: Date) {
  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);
  return noon;
}

export function clockFallbackPhase(date = new Date()): LoginSolarPhase {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? "day" : "night";
}

export function loginSolarWindowAt(date: Date, latitude: number, longitude: number): LoginSolarWindow {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { phase: clockFallbackPhase(date), sunrise: null, sunset: null };
  }

  const localNoon = normalizedLocalNoon(date);
  const westLongitude = -longitude * RAD;
  const latitudeRad = latitude * RAD;
  const days = toDays(localNoon);
  const cycle = julianCycle(days, westLongitude);
  const transit = approxTransit(0, westLongitude, cycle);
  const meanAnomaly = solarMeanAnomaly(transit);
  const longitudeRad = eclipticLongitude(meanAnomaly);
  const solarDeclination = declination(longitudeRad);
  const solarNoonJulian = solarTransitJulian(transit, meanAnomaly, longitudeRad);
  const hourAngleCosine = (
    Math.sin(SUNRISE_ALTITUDE) - Math.sin(latitudeRad) * Math.sin(solarDeclination)
  ) / (Math.cos(latitudeRad) * Math.cos(solarDeclination));

  // No crossing of the standard -0.833° sunrise altitude occurs in polar conditions.
  if (hourAngleCosine > 1) return { phase: "night", sunrise: null, sunset: null };
  if (hourAngleCosine < -1) return { phase: "day", sunrise: null, sunset: null };

  const hourAngle = Math.acos(hourAngleCosine);
  const setTransit = approxTransit(hourAngle, westLongitude, cycle);
  const sunsetJulian = solarTransitJulian(setTransit, meanAnomaly, longitudeRad);
  const sunriseJulian = solarNoonJulian - (sunsetJulian - solarNoonJulian);
  const sunrise = fromJulian(sunriseJulian);
  const sunset = fromJulian(sunsetJulian);
  const phase: LoginSolarPhase = date >= sunrise && date < sunset ? "day" : "night";

  return { phase, sunrise, sunset };
}

export function loginSolarPhaseAt(date: Date, latitude: number, longitude: number): LoginSolarPhase {
  return loginSolarWindowAt(date, latitude, longitude).phase;
}
