/** On-screen STONE credit. English stays the main-branch mark; only zh-Hans uses 原创. */
export function stoneMark(locale: string) {
  if (locale === "zh-Hans") return "STONE 原创";
  return "STONE 原創";
}
