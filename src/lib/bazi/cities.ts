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

const FEATURED_ALIASES: Record<string, string[]> = {
  "臺北，臺灣": ["台北", "台北市", "Taipei", "Taiwan"],
  "新北，臺灣": ["新北市", "New Taipei", "Taiwan"],
  "臺中，臺灣": ["台中", "Taichung", "Taiwan"],
  "臺南，臺灣": ["台南", "Tainan", "Taiwan"],
  "高雄，臺灣": ["Kaohsiung", "Taiwan"],
  "香港": ["Hong Kong", "HK"],
  "澳門": ["澳门", "Macau", "Macao"],
  "上海，中國": ["上海", "Shanghai", "China"],
  "北京，中國": ["北京", "Beijing", "China"],
  "廣州，中國": ["广州", "Guangzhou", "China"],
  "深圳，中國": ["深圳", "Shenzhen", "China"],
  "杭州，中國": ["杭州", "Hangzhou", "China"],
  "成都，中國": ["成都", "Chengdu", "China"],
  "新加坡": ["Singapore"],
  "吉隆坡，馬來西亞": ["吉隆坡", "Kuala Lumpur", "Malaysia"],
  "東京，日本": ["东京", "Tokyo", "Japan"],
  "首爾，韓國": ["首尔", "Seoul", "Korea"],
  "雪梨，澳洲": ["悉尼", "Sydney", "NSW", "Australia"],
  "墨爾本，澳洲": ["墨尔本", "Melbourne", "Victoria", "Australia"],
  "倫敦，英國": ["伦敦", "London", "United Kingdom", "UK"],
  "紐約，美國": ["纽约", "New York", "NYC", "United States", "USA"],
  "洛杉磯，美國": ["洛杉矶", "Los Angeles", "LA", "United States", "USA"],
  "溫哥華，加拿大": ["温哥华", "Vancouver", "Canada"],
};

type CityDisplayLocale = "zh-Hant" | "zh-Hans" | "en";

const FEATURED_DISPLAY: Record<string, Record<Exclude<CityDisplayLocale, "zh-Hant">, string>> = {
  "25.033,121.5654": { "zh-Hans": "台北，台湾", en: "Taipei, Taiwan" },
  "25.0169,121.4628": { "zh-Hans": "新北，台湾", en: "New Taipei, Taiwan" },
  "24.1477,120.6736": { "zh-Hans": "台中，台湾", en: "Taichung, Taiwan" },
  "22.9997,120.227": { "zh-Hans": "台南，台湾", en: "Tainan, Taiwan" },
  "22.6273,120.3014": { "zh-Hans": "高雄，台湾", en: "Kaohsiung, Taiwan" },
  "22.3193,114.1694": { "zh-Hans": "香港", en: "Hong Kong" },
  "22.1987,113.5439": { "zh-Hans": "澳门", en: "Macau" },
  "31.2304,121.4737": { "zh-Hans": "上海，中国", en: "Shanghai, China" },
  "39.9042,116.4074": { "zh-Hans": "北京，中国", en: "Beijing, China" },
  "23.1291,113.2644": { "zh-Hans": "广州，中国", en: "Guangzhou, China" },
  "22.5431,114.0579": { "zh-Hans": "深圳，中国", en: "Shenzhen, China" },
  "30.2741,120.1551": { "zh-Hans": "杭州，中国", en: "Hangzhou, China" },
  "30.5728,104.0668": { "zh-Hans": "成都，中国", en: "Chengdu, China" },
  "1.3521,103.8198": { "zh-Hans": "新加坡", en: "Singapore" },
  "3.139,101.6869": { "zh-Hans": "吉隆坡，马来西亚", en: "Kuala Lumpur, Malaysia" },
  "35.6762,139.6503": { "zh-Hans": "东京，日本", en: "Tokyo, Japan" },
  "37.5665,126.978": { "zh-Hans": "首尔，韩国", en: "Seoul, South Korea" },
  "-33.8688,151.2093": { "zh-Hans": "悉尼，澳大利亚", en: "Sydney, Australia" },
  "-37.8136,144.9631": { "zh-Hans": "墨尔本，澳大利亚", en: "Melbourne, Australia" },
  "51.5074,-0.1278": { "zh-Hans": "伦敦，英国", en: "London, United Kingdom" },
  "40.7128,-74.006": { "zh-Hans": "纽约，美国", en: "New York, United States" },
  "34.0522,-118.2437": { "zh-Hans": "洛杉矶，美国", en: "Los Angeles, United States" },
  "49.2827,-123.1207": { "zh-Hans": "温哥华，加拿大", en: "Vancouver, Canada" },
};

function coordinateKey(city: Pick<CityHit, "latitude" | "longitude">) {
  return `${city.latitude},${city.longitude}`;
}

export function localizeCityHit(city: CityHit, locale: CityDisplayLocale): CityHit {
  const canonical = FEATURED_CITIES.find((candidate) => coordinateKey(candidate) === coordinateKey(city));
  if (!canonical) return city;
  const display = locale === "zh-Hant" ? canonical.display : FEATURED_DISPLAY[coordinateKey(city)]?.[locale];
  return display ? { ...city, display } : city;
}

function normalizeCityQuery(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[\s,，。·/\\-]+/g, "");
}

export function filterFeatured(query: string): CityHit[] {
  const q = normalizeCityQuery(query.trim());
  if (!q) return FEATURED_CITIES.slice(0, 8);
  return FEATURED_CITIES.filter((c) =>
    normalizeCityQuery(`${c.name}${c.country}${c.display}${(FEATURED_ALIASES[c.display] ?? []).join("")}`).includes(q),
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
