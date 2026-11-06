import { searchBirthPlaces } from "../src/lib/geo/city-search.ts";

const cases = [
  ["台北", "Asia/Taipei"],
  ["臺北", "Asia/Taipei"],
  ["高雄", "Asia/Taipei"],
  ["新竹", "Asia/Taipei"],
  ["上海", "Asia/Shanghai"],
  ["廣州", "Asia/Shanghai"],
  ["香港", "Asia/Hong_Kong"],
  ["雪梨", "Australia/Sydney"],
  ["Sydney", "Australia/Sydney"],
  ["Tokyo", "Asia/Tokyo"],
  ["taipei", "Asia/Taipei"],
];

let failures = 0;
for (const [query, expectedTimezone] of cases) {
  const started = Date.now();
  const rows = await searchBirthPlaces(query);
  const result = rows[0];
  const elapsedMs = Date.now() - started;
  const passed = result?.timezone === expectedTimezone && elapsedMs <= 2000;
  if (!passed) failures += 1;
  console.log(
    `${passed ? "PASS" : "FAIL"}  ${query.padEnd(8)} → ${result?.display ?? "(none)"} | tz=${result?.timezone ?? "-"} | ${elapsedMs}ms`,
  );
}

console.log(failures ? `\n${failures} case(s) failed` : "\nall cases passed");
process.exit(failures ? 1 : 0);
