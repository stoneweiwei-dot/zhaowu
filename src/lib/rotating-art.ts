/** Avoid an immediate repeat while keeping every remaining image equally likely. */
export function chooseDifferentArt<T extends { id: string }>(items: T[], previous: string | null, random = Math.random): T | null {
  const candidates = items.length > 1 ? items.filter((item) => item.id !== previous) : items;
  if (!candidates.length) return null;
  return candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))];
}

let lastSeen: string | null = null;
export function nextHomepageArt<T extends { id: string }>(items: T[]): T | null {
  try { lastSeen = sessionStorage.getItem("zhaowu-home-art") ?? lastSeen; } catch { /* Private browsing still rotates in memory. */ }
  const selected = chooseDifferentArt(items, lastSeen);
  if (selected) {
    lastSeen = selected.id;
    try { sessionStorage.setItem("zhaowu-home-art", selected.id); } catch { /* Optional persistence. */ }
  }
  return selected;
}
