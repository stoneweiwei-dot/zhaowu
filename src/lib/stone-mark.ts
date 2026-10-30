/** On-screen STONE credit. Burned-in image watermarks stay Traditional. */
export function stoneMark(locale: string) {
  if (locale === "en") return "STONE ORIGINAL";
  if (locale === "zh-Hans") return "STONE 原创";
  return "STONE 原創";
}
