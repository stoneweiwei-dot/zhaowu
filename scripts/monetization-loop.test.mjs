import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [telemetry, gate, result, completion, followUp, deepCard, specialist, access] = await Promise.all([
  read("src/lib/observability/conversion-telemetry.ts"),
  read("src/components/report-access-gate.tsx"),
  read("src/components/result-view.tsx"),
  read("src/components/report-completion-panel.tsx"),
  read("src/components/follow-up-box.tsx"),
  read("src/components/deep-reading-hero-card.tsx"),
  read("src/components/specialist-system-page.tsx"),
  read("src/lib/report-access.ts"),
]);

test("the single-system business funnel is observable from entry through the next reading", () => {
  for (const event of [
    "content_cta_clicked",
    "unlock_clicked",
    "zhaowu_checkout_clicked",
    "zhaowu_purchase_confirmed",
    "report_completion_viewed",
    "report_next_system_clicked",
    "follow_up_submitted",
    "follow_up_answer_shown",
  ]) assert.match(telemetry, new RegExp(`\\| "${event}"`));

  assert.match(gate, /trackConversion\("unlock_clicked", \{ system, product \}\)/);
  assert.match(followUp, /trackConversion\("follow_up_submitted"/);
  assert.match(completion, /trackConversion\("report_completion_viewed"/);
  assert.match(completion, /trackConversion\("report_next_system_clicked"/);
});

test("verified customers see one completion surface and owner access is never described as a purchase", () => {
  assert.match(gate, /!owner \? <ReportCompletionPanel system=\{system\} locale=\{locale\} \/>/);
  assert.match(result, /unlocked && !ownerAccess \? <ReportCompletionPanel system="bazi" locale=\{locale\} \/>/);
  assert.match(completion, /one-time unlock with no subscription or automatic renewal/);
  assert.match(completion, /不替代醫療、心理、法律、財務或投資專業意見/);
});

test("cross-reading links keep the active report state during in-app navigation", () => {
  assert.match(deepCard, /id="analysis-reports"/);
  assert.match(deepCard, /<Link key=\{href\} to=\{href\}/);
  assert.match(completion, /<Link\s+to=\{next\.route\}/);
  assert.match(specialist, /hash="analysis-reports"/);
});

test("the closure keeps the approved seven one-time single-system products", () => {
  assert.equal((access.match(/https:\/\/buy\.stripe\.com\//g) || []).length, 7);
  assert.match(access, /if \(product !== "system"\) throw new Error\("PAYMENT_LINK_MISSING"\)/);
  assert.doesNotMatch(access, /ReportAccessProduct = [^\n]*bundle/);
});
