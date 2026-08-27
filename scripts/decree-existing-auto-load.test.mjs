import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const generationEdge = fs.readFileSync("supabase/functions/generate-decree-image/index.ts", "utf8");
const deliveryEdge = fs.readFileSync("supabase/functions/view-decree-image/index.ts", "utf8");
const client = fs.readFileSync("src/lib/report/decree-image.ts", "utf8");
const resultView = fs.readFileSync("src/components/result-view.tsx", "utf8");

test("stored decree delivery is isolated from the image provider", () => {
  assert.ok(deliveryEdge.includes('const REPORT_BUCKET = "zhaowu-report-images"'));
  assert.ok(deliveryEdge.includes("authClient.auth.getUser(token)"));
  assert.ok(deliveryEdge.includes('service.from("profiles").select("is_owner")'));
  assert.ok(deliveryEdge.includes('service.from("report_requests").select("id,user_id,image_path")'));
  assert.ok(deliveryEdge.includes("createSignedUrl(imagePath, 3600)"));
  assert.ok(deliveryEdge.includes("imagePath: null, signedUrl: null, reused: false, missing: true"));
  assert.ok(!deliveryEdge.includes("api.openai.com"));
});

test("client asks the delivery-only signer before attempting regeneration", () => {
  assert.ok(client.includes("export async function loadExistingDecreeImage"));
  assert.ok(client.includes('requestFunction(session, "view-decree-image", reportId)'));
  assert.ok(client.includes("if (!force)"));
  assert.ok(client.includes("const existing = await loadExistingDecreeImage(session, reportId)"));
  assert.ok(client.includes("if (existing.signedUrl || !existing.missing) return existing"));
  assert.ok(client.includes('requestFunction(session, "generate-decree-image", reportId, { force })'));
});

test("generation endpoint still preserves an existing image on provider failure", () => {
  const reuseIndex = generationEdge.indexOf("if (report.image_path && !force)");
  const providerIndex = generationEdge.indexOf("https://api.openai.com/v1/images/edits");
  assert.ok(reuseIndex >= 0);
  assert.ok(providerIndex > reuseIndex);
  assert.ok(generationEdge.includes("A failed refresh must never make an already-generated personal image disappear"));
});

test("result view automatically restores a stored personal decree image", () => {
  assert.ok(resultView.includes('import { useEffect, useState } from "react"'));
  assert.ok(resultView.includes("generateDecreeImage, loadExistingDecreeImage"));
  assert.ok(resultView.includes("void loadExistingDecreeImage(session, result.id)"));
  assert.ok(resultView.includes("if (!cancelled && out.signedUrl) setImageUrl(out.signedUrl)"));
});
