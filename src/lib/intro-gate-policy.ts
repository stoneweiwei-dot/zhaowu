export const INTRO_SEEN_KEY = "zhaowu.intro.seen-at.public.v2";
export const INTRO_FORCE_KEY = "zhaowu.intro.force";
export const INTRO_BROKEN_KEY = "zhaowu.intro.broken";
export const INTRO_RETURN_SKIP_MS = 7 * 24 * 60 * 60 * 1000;
export const INTRO_GATE_MIN_VISIBLE_MS = 5000;
export const INTRO_GATE_NATIVE_MS = 5000;
export const INTRO_GATE_TARGET_MS = INTRO_GATE_NATIVE_MS;
/** Owner 2026-09-30: opening clips may run 10-15 s with sound; hard exit = 15 s cap + 2 s slack, guests can skip at any time. */
export const INTRO_GATE_MAX_PLAY_S = 15;
export const INTRO_GATE_HARD_EXIT_MS = 17000;
export const INTRO_GATE_FADE_MS = 180;
/** Forced-missing test clip only. The poster still remains until the five-second minimum is satisfied. */
export const INTRO_GATE_ERROR_EXIT_MS = 1600;

type TimerId = number;
type Schedule = (callback: () => void, delayMs: number) => TimerId;
type Cancel = (timerId: TimerId) => void;

export function scheduleIntroGateHardExit(
  schedule: Schedule,
  cancel: Cancel,
  onHardExit: () => void,
) {
  const timerId = schedule(onHardExit, INTRO_GATE_HARD_EXIT_MS);
  return () => cancel(timerId);
}

export function shouldSkipIntroGate(
  storage?: Pick<Storage, "getItem"> | null,
  webdriver?: boolean,
  nowMs = Date.now(),
) {
  try {
    if (storage?.getItem(INTRO_FORCE_KEY) === "1") return false;
    const seenAt = Number(storage?.getItem(INTRO_SEEN_KEY) ?? "");
    if (Number.isFinite(seenAt) && seenAt > 0 && nowMs >= seenAt && nowMs - seenAt < INTRO_RETURN_SKIP_MS) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return Boolean(webdriver);
}

export function markIntroSeen(
  storage?: Pick<Storage, "setItem"> | null,
  nowMs = Date.now(),
) {
  try {
    storage?.setItem(INTRO_SEEN_KEY, String(nowMs));
  } catch {
    /* ignore */
  }
}
