import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import { MobileReadingGuide } from "../src/components/mobile-reading-guide.tsx";

const css = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const model = {
  contract: { primaryQuestion: "Should I change jobs this year?" },
  directAnswer: "Compare the actual offers before deciding. Keep the role with a clear scope and a workload you can sustain.",
  reasons: ["A clear responsibility and visible outcome make the choice easier to test."],
  risks: ["Check the exit cost and weekly workload before committing."],
  nextAction: "Write the pay, hours, responsibilities and exit terms for both options on one page.",
  confidenceBasis: "The birth time is unconfirmed, so timing remains broad.",
  biggestVariable: "The terms of the real offer.",
};
const guide = renderToStaticMarkup(createElement(MobileReadingGuide, { model, locale: "en" }));
const before = `<section class="zhaowu-focused-report zhaowu-report-continuous-sheet"><header class="zhaowu-report-header"><h3 class="zhaowu-report-title">Full report</h3></header><nav class="zhaowu-focused-progress"><span><b>01</b>Overall summary</span><span><b>02</b>Illustrated reading</span><span><b>03</b>Body areas to watch</span><span><b>04</b>Notes</span></nav><section class="zhaowu-report-summary-block"><h4><span class="zhaowu-report-stage-no">01</span>Overall summary</h4><div class="zhaowu-report-copy"><p>${model.directAnswer}</p></div><details class="zhaowu-report-fold"><summary>Show the full summary</summary></details></section></section>`;
const after = `<section class="zhaowu-focused-report zhaowu-report-continuous-sheet">${guide}<details class="zhaowu-professional-report" data-professional-report><summary>Open the full professional report</summary><div class="zhaowu-professional-report__body">${before}</div></details></section>`;
const outputDir = new URL("../docs/ux/", import.meta.url);
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ executablePath: "/bin/chromium", headless: true, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  for (const [name, markup] of [["before", before], ["after", after]]) {
    await page.setContent(`<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style><style>html,body{margin:0;background:#F6F1E7}body{padding:16px;box-sizing:border-box}.zhaowu-focused-report{width:100%;max-width:100%}</style></head><body>${markup}</body></html>`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`${name}: horizontal overflow at 390px`);
    const file = new URL(`mobile-reading-guide-p1-${name}.png`, outputDir);
    await page.screenshot({ path: file.pathname, fullPage: true });
    console.log(`${name}: ${file.pathname}, no horizontal overflow`);
  }
} finally {
  await browser.close();
}
await writeFile(new URL("mobile-reading-guide-p1.md", outputDir), "# P1 390px comparison\n\nThese screenshots use an anonymous fixture and the actual report CSS. The after frame renders the new React guide; the before frame mirrors the prior report header, navigation and summary markup. They are local review evidence, not Production captures.\n\n![Before](mobile-reading-guide-p1-before.png)\n\n![After](mobile-reading-guide-p1-after.png)\n");
