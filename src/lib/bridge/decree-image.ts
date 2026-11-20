import * as base from "../report/decree-image";
import type { SupabaseSession } from "@/lib/supabase-rest";
import { isOwnerCookieSession, ownerData } from "@/lib/owner-data-client";
import { assertSupabaseStorageWritesEnabled } from "@/lib/storage-write-policy";

export * from "../report/decree-image";

export async function loadExistingDecreeImage(
  session: SupabaseSession,
  reportId: string,
): Promise<base.DecreeImageResult> {
  if (!isOwnerCookieSession(session)) return base.loadExistingDecreeImage(session, reportId);
  return ownerData<base.DecreeImageResult>("report.viewImage", { reportId });
}

export async function generateDecreeImage(
  session: SupabaseSession,
  reportId: string,
  force = false,
): Promise<base.DecreeImageResult> {
  assertSupabaseStorageWritesEnabled();
  if (!isOwnerCookieSession(session)) return base.generateDecreeImage(session, reportId, force);
  return ownerData<base.DecreeImageResult>("report.generateImage", { reportId, force });
}
