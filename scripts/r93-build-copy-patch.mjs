import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../src/components/analysis-form.tsx", import.meta.url);
let source = await readFile(path, "utf8");
const replacements = new Map([
  ["SHARED RECORD", "ONE-TIME SETUP"],
  ["Client details", "Build your chart"],
  ["Enter the birth record once. Every personal reading can reuse it.", "Enter your birth data once. Each personal reading can reuse it."],
  ["Calculated from the client details above.", "Calculated from the birth data above."],
  ["Complete the client details to preview the Four Pillars chart.", "Complete your birth data to preview the Four Pillars chart."],
  ["Client record saved", "Birth data saved"],
  ["The other personal readings will reuse this record.", "Other personal readings will reuse this birth data."],
  ["The analysis will use the client record shown above.", "The analysis will use the birth data shown above."],
  ["共用资料", "一次填写"],
  ["客人资料", "建立你的命盘"],
  ["生辰只需填写一次，各命理专卷将共用这份资料。", "生辰只需填写一次，各命理专卷会共用这份资料。"],
  ["命盘依据上方客人资料自动排出。", "命盘依据上方出生资料自动排出。"],
  ["完成客人资料后，这里会显示四柱命盘。", "完成出生资料后，这里会显示四柱命盘。"],
  ["资料已保存", "出生资料已保存"],
  ["其他命理专卷将沿用这份资料。", "其他命理专卷会沿用这份出生资料。"],
  ["将使用上方客人资料进行分析。", "将使用上方出生资料进行分析。"],
  ["共用資料", "一次填寫"],
  ["客人資料", "建立你的命盤"],
  ["生辰只需填寫一次，各命理專卷將共用這份資料。", "生辰只需填寫一次，各命理專卷會共用這份資料。"],
  ["命盤依據上方客人資料自動排出。", "命盤依據上方出生資料自動排出。"],
  ["完成客人資料後，這裡會顯示四柱命盤。", "完成出生資料後，這裡會顯示四柱命盤。"],
  ["資料已保存", "出生資料已保存"],
  ["其他命理專卷將沿用這份資料。", "其他命理專卷會沿用這份出生資料。"],
  ["將使用上方客人資料進行分析。", "將使用上方出生資料進行分析。"],
]);
for (const [before, after] of replacements) {
  if (!source.includes(before)) throw new Error(`Missing expected copy: ${before}`);
  source = source.replaceAll(before, after);
}
await writeFile(path, source, "utf8");
