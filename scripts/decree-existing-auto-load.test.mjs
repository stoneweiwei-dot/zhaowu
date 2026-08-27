import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const edge = fs.readFileSync("supabase/functions/generate-decree-image/index.ts", "utf8");
const client = fs.readFileSync("src/lib/report/decree-image.ts", "utf8");
const resultView = fs.readFileSync("src/components/result-view.tsx", "utf8");

test("report open uses a delivery-only decree lookup before any provider generation", () => {
  const viewOnlyIndex = edge.indexOf("if (viewOnly)");
  const providerIndex = edge.indexOf("https://api.openai.com/v1/images/edits");
  assert.ok(edge.includes("const viewOnly = payload?.viewOnly === true"));
  assert.ok(viewOnlyIndex >= 0);
  assert.ok(providerIndex > viewOnlyIndex);
  assert.ok(edge.includes("imagePath: null, signedUrl: null, reused: false, missing: true"));
});

test("client exposes view-only retrieval without forcing regeneration", () => {
  assert.ok(client.includes("export async function loadExistingDecreeImage"));
  assert.ok(client.includes("requestDecreeImage(session, reportId, { viewOnly: true })"));
});

test("result view automatically restores a stored personal decree image", () => {
  assert.ok(resultView.includes('import { useEffect, useState } from "react"'));
  assert.ok(resultView.includes("generateDecreeImage, loadExistingDecreeImage"));
  assert.ok(resultView.includes("void loadExistingDecreeImage(session, result.id)"));
  assert.ok(resultView.includes("if (!cancelled && out.signedUrl) setImageUrl(out.signedUrl)"));
});
