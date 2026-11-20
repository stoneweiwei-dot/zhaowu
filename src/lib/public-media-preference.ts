export type PublicMediaCandidate = {
  storage_path: string;
  cdn_url?: string | null;
  cdn_verified_at?: string | null;
  origin_storage_path?: string | null;
};

export function verifiedPublicMediaUrl(
  cdnUrl?: string | null,
  verifiedAt?: string | null,
): string | null {
  const value = cdnUrl?.trim();
  if (!value || !verifiedAt || !Number.isFinite(Date.parse(verifiedAt))) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function preferVerifiedPublicMedia<T extends PublicMediaCandidate>(
  row: T,
): T {
  const cdnUrl = verifiedPublicMediaUrl(row.cdn_url, row.cdn_verified_at);
  if (!cdnUrl) return row;
  return {
    ...row,
    origin_storage_path: row.storage_path,
    storage_path: cdnUrl,
  };
}
