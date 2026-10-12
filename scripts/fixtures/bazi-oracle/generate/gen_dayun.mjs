// Dayun / pillar oracle cases from lunar-javascript (6tail). Usage:
//   npm i --no-save lunar-javascript   (do NOT commit it)   then   node gen_dayun.mjs <out.json> [N]
// Clock is treated as Beijing time (UTC+8). 23:xx excluded (hour-stem convention is audited separately).
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(process.cwd() + "/");
const { Solar } = require("lunar-javascript");
const out = process.argv[2];
const N = Number(process.argv[3] ?? 400);
let seed = 99;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const cases = [];
for (let i = 0; i < N; i++) {
  const Y = ri(1930, 2010), M = ri(1, 12), D = ri(1, 28), h = ri(0, 22), mi = ri(0, 59);
  const gender = rnd() < 0.5 ? "male" : "female";
  const ec = Solar.fromYmdHms(Y, M, D, h, mi, 0).getLunar().getEightChar();
  ec.setSect(2);
  const yun = ec.getYun(gender === "male" ? 1 : 0);
  const da = yun.getDaYun().filter((d) => d.getGanZhi());
  cases.push({
    birthBJT: [Y, M, D, h, mi], gender,
    year: ec.getYear(), month: ec.getMonth(), day: ec.getDay(),
    forward: yun.isForward(), firstGz: da[0].getGanZhi(), startYear: da[0].getStartYear(),
    startYMD: [yun.getStartYear(), yun.getStartMonth(), yun.getStartDay()],
  });
}
fs.writeFileSync(out, JSON.stringify(cases));
console.log(cases.length, "dayun cases");
