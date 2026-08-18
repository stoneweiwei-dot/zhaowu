import type { CityHit } from "./types";

export const FEATURED_CITIES: CityHit[] = [
  { name: "臺北", country: "臺灣", display: "臺北，臺灣", latitude: 25.033, longitude: 121.5654, timezone: "Asia/Taipei" },
  { name: "新北", country: "臺灣", display: "新北，臺灣", latitude: 25.0169, longitude: 121.4628, timezone: "Asia/Taipei" },
  { name: "臺中", country: "臺灣", display: "臺中，臺灣", latitude: 24.1477, longitude: 120.6736, timezone: "Asia/Taipei" },
  { name: "臺南", country: "臺灣", display: "臺南，臺灣", latitude: 22.9997, longitude: 120.227, timezone: "Asia/Taipei" },
  { name: "高雄", country: "臺灣", display: "高雄，臺灣", latitude: 22.6273, longitude: 120.3014, timezone: "Asia/Taipei" },
  { name: "香港", country: "中國", display: "香港", latitude: 22.3193, longitude: 114.1694, timezone: "Asia/Hong_Kong" },
  { name: "澳門", country: "中國", display: "澳門", latitude: 22.1987, longitude: 113.5439, timezone: "Asia/Macau" },
  { name: "上海", country: "中國", display: "上海，中國", latitude: 31.2304, longitude: 121.4737, timezone: "Asia/Shanghai" },
  { name: "北京", country: "中國", display: "北京，中國", latitude: 39.9042, longitude: 116.4074, timezone: "Asia/Shanghai" },
  { name: "廣州", country: "中國", display: "廣州，中國", latitude: 23.1291, longitude: 113.2644, timezone: "Asia/Shanghai" },
  { name: "深圳", country: "中國", display: "深圳，中國", latitude: 22.5431, longitude: 114.0579, timezone: "Asia/Shanghai" },
  { name: "杭州", country: "中國", display: "杭州，中國", latitude: 30.2741, longitude: 120.1551, timezone: "Asia/Shanghai" },
  { name: "成都", country: "中國", display: "成都，中國", latitude: 30.5728, longitude: 104.0668, timezone: "Asia/Shanghai" },
  { name: "新加坡", country: "新加坡", display: "新加坡", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore" },
  { name: "吉隆坡", country: "馬來西亞", display: "吉隆坡，馬來西亞", latitude: 3.139, longitude: 101.6869, timezone: "Asia/Kuala_Lumpur" },
  { name: "東京", country: "日本", display: "東京，日本", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo" },
  { name: "首爾", country: "韓國", display: "首爾，韓國", latitude: 37.5665, longitude: 126.978, timezone: "Asia/Seoul" },
  { name: "雪梨", country: "澳洲", display: "雪梨，澳洲", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
  { name: "墨爾本", country: "澳洲", display: "墨爾本，澳洲", latitude: -37.8136, longitude: 144.9631, timezone: "Australia/Melbourne" },
  { name: "倫敦", country: "英國", display: "倫敦，英國", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },
  { name: "紐約", country: "美國", display: "紐約，美國", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
  { name: "洛杉磯", country: "美國", display: "洛杉磯，美國", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  { name: "溫哥華", country: "加拿大", display: "溫哥華，加拿大", latitude: 49.2827, longitude: -123.1207, timezone: "America/Vancouver" },
];

export function filterFeatured(query: string): CityHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return FEATURED_CITIES.slice(0, 8);
  return FEATURED_CITIES.filter((c) =>
    `${c.name}${c.country}${c.display}`.toLowerCase().includes(q),
  ).slice(0, 8);
}

export function timezoneOffsetHours(timeZone: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(at);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return (asUtc - at.getTime()) / 3_600_000;
}
