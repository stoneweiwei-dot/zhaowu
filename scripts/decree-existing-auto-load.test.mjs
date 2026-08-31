import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const generationEdge = fs.readFileSync("supabase/functions/generate-decree-image/index.ts", "utf8");
const deliveryEdge = fs.readFileSync("supabase/functions/view-decree-image/index.ts", "utf8");
const client = fs.readFileSync("src/lib/report/decree-image.ts", "utf8");
const resultView = fs.readFileSync("src/components/result-view.tsx", "utf8");

test("stored decree delivery is isolated from the image provider and returns its Gallery reference", () => {
  assert.ok(deliveryEdge.includes('const REPORT_BUCKET = "zhaowu-report-images"'));
  assert.ok(deliveryEdge.includes("authClient.auth.getUser(token)"));
  assert.ok(deliveryEdge.includes('service.from("profiles").select("is_owner")'));
  assert.ok(deliveryEdge.includes('select("id,user_id,image_path,visual_profile")'));
  assert.ok(deliveryEdge.includes("galleryReferenceAssetId"));
  assert.ok(deliveryEdge.includes("createSignedUrl(imagePath, 3600)"));
  assert.ok(deliveryEdge.includes("imagePath: null"));
  assert.ok(deliveryEdge.includes("signedUrl: null"));
  assert.ok(deliveryEdge.includes("missing: true"));
  assert.ok(!deliveryEdge.includes("api.openai.com"));
});

test("passive loading uses the delivery-only signer while explicit generation reselects Gallery", () => {
  assert.ok(client.includes("export async function loadExistingDecreeImage"));
  assert.ok(client.includes('requestFunction(session, "view-decree-image", reportId)'));
  assert.ok(client.includes("galleryReferenceAssetId?: string | null"));
  assert.ok(client.includes("export async function generateDecreeImage"));
  assert.ok(client.includes("reselectGallery: true"));
  const generateStart = client.indexOf("export async function generateDecreeImage");
  assert.ok(generateStart >= 0);
  const generateBody = client.slice(generateStart);
  assert.ok(!generateBody.includes("const existing = await loadExistingDecreeImage(session, reportId)"));
  assert.ok(generateBody.includes('requestFunction(session, "generate-decree-image", reportId'));
});

test("decree delivery refreshes an expired access token once before surfacing 401", () => {
  assert.ok(client.includes('import { refreshSession, type SupabaseSession } from "@/lib/supabase-rest"'));
  assert.ok(client.includes("if (res.status === 401)"));
  assert.ok(client.includes("const refreshed = await refreshSession(session)"));
  assert.ok(client.includes("res = await callFunction(refreshed, functionName, reportId, payload)"));
  const refreshBlock = client.slice(client.indexOf("if (res.status === 401)"), client.indexOf("let body:"));
  assert.equal((refreshBlock.match(/refreshSession\(/g) ?? []).length, 1);
});

test("generation endpoint preserves passive reuse and protects an existing image on provider failure", () => {
  const reuseIndex = generationEdge.indexOf("if (report.image_path && !force && !reselectGallery)");
  const providerIndex = generationEdge.indexOf("https://api.openai.com/v1/images/edits");
  assert.ok(reuseIndex >= 0);
  assert.ok(providerIndex > reuseIndex);
  assert.ok(generationEdge.includes("A failed refresh must never make an already-generated personal image disappear"));
});

test("result view automatically restores both the stored image and its Gallery reference", () => {
  assert.ok(resultView.includes('import { useEffect, useState } from "react"'));
  assert.ok(resultView.includes("generateDecreeImage, loadExistingDecreeImage"));
  assert.ok(resultView.includes("void loadExistingDecreeImage(session, result.id)"));
  assert.ok(resultView.includes("if (out.signedUrl) setImageUrl(out.signedUrl)"));
  assert.ok(resultView.includes("setImageReferenceAssetId(out.galleryReferenceAssetId ?? null)"));
  assert.ok(resultView.includes("selectedAssetId={imageReferenceAssetId}"));
});

test("result view customer generation requests the provider path while preserving backend fallback", () => {
  assert.ok(resultView.includes("generateDecreeImage(session, reportId, true)"));
  assert.ok(generationEdge.includes("deliverGalleryDirect"));
  assert.ok(generationEdge.includes("galleryDirect: true"));
  assert.ok(generationEdge.includes("degraded: true"));
});
