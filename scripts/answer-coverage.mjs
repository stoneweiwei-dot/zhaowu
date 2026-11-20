// Usage: npx tsx scripts/answer-coverage.mjs [--holdout] [--verbose]
const { measure, summarize, CORPUS, HOLDOUT, HOLDOUT2, HOLDOUT3 } = await import("./fixtures/answer-coverage-run.mjs");
const holdout = process.argv.includes("--holdout");
const holdout2 = process.argv.includes("--holdout2");
const holdout3 = process.argv.includes("--holdout3");
const rows = await measure({}, holdout3 ? HOLDOUT3 : holdout2 ? HOLDOUT2 : holdout ? HOLDOUT : CORPUS);
const s = summarize(rows);
if (process.argv.includes("--verbose")) {
  for (const r of rows) if (!r.ok) console.log(`✗ [${r.group}] ${r.question}\n    ${r.fails.join(",")} | ${r.answer.slice(0, 120)}`);
}
console.log(`${holdout3 ? "HOLDOUT3" : holdout2 ? "HOLDOUT2" : holdout ? "HOLDOUT" : "CORPUS"} ${s.ok}/${s.total} = ${s.pct}%`);
for (const [k, v] of s.by) console.log(`  ${k}: ${v.ok}/${v.total}`);
