// Temporary: dump DOM outline (classes, box, bg, color, border, radius) of homepage.
import { chromium, devices } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
const base = process.env.BASE || "http://127.0.0.1:4173";
mkdirSync("visual-audit-shots", { recursive: true });
for (const theme of ["day", "night"]) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices["iPhone 13"], viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.addInitScript((t) => { localStorage.setItem("zhaowu.display-language", "zh-Hant"); if (t === "night") localStorage.setItem("zhaowu.theme.v1", "night"); }, theme);
  await p.goto(base + "/", { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(2500);
  const out = await p.evaluate(() => {
    const lines = [];
    const walk = (el, depth) => {
      if (depth > 9) return;
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        const txt = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").slice(0, 30);
        const bg = cs.backgroundColor !== "rgba(0, 0, 0, 0)" ? " bg=" + cs.backgroundColor : "";
        const bi = cs.backgroundImage !== "none" ? " bgimg" : "";
        const bd = cs.borderTopWidth !== "0px" || cs.borderLeftWidth !== "0px" ? ` bd=${cs.borderTopWidth}/${cs.borderLeftWidth} ${cs.borderTopColor}` : "";
        const rad = cs.borderRadius !== "0px" ? " r=" + cs.borderRadius : "";
        const sh = cs.boxShadow !== "none" ? " sh" : "";
        lines.push(`${"  ".repeat(depth)}${el.tagName.toLowerCase()}.${[...el.classList].join(".")} [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}] c=${cs.color} fs=${cs.fontSize}${bg}${bi}${bd}${rad}${sh} ${txt ? '"' + txt + '"' : ""}`);
      }
      for (const c of el.children) walk(c, depth + 1);
    };
    const main = document.querySelector("main.zhaowu-home-layout");
    let a = main; const anc = [];
    while (a) { const cs = getComputedStyle(a); anc.push(`${a.tagName}.${[...a.classList].join(".")} bg=${cs.backgroundColor} bgimg=${cs.backgroundImage.slice(0,60)} w=${Math.round(a.getBoundingClientRect().width)}`); a = a.parentElement; }
    lines.unshift("ANCESTORS:\n" + anc.join("\n"));
    if (main) walk(main, 0);
    // pseudo elements of lead
    const lead = document.querySelector(".zhaowu-home-lead");
    if (lead) for (const ps of ["::before", "::after"]) { const cs = getComputedStyle(lead, ps); lines.push(`lead${ps} content=${cs.content} pos=${cs.position} w=${cs.width} h=${cs.height} top=${cs.top} bg=${cs.backgroundImage.slice(0,80)} ${cs.backgroundColor}`); }
    const fixed = [...document.querySelectorAll("body *")].filter((e) => getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().height > 0).map((e) => `FIXED ${e.tagName}.${[...e.classList].join(".")} ${Math.round(e.getBoundingClientRect().height)}h`);
    lines.push(...fixed);
    return lines.join("\n");
  });
  writeFileSync(`visual-audit-shots/dom-${theme}.txt`, out);
  await b.close();
}
