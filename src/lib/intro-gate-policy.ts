export const INTRO_SEEN_KEY = "zhaowu.intro.seen.r148";
export const INTRO_FORCE_KEY = "zhaowu.intro.force";
export const INTRO_BROKEN_KEY = "zhaowu.intro.broken";
export const INTRO_GATE_MIN_VISIBLE_MS = 5000;
export const INTRO_GATE_NATIVE_MS = 5000;
export const INTRO_GATE_TARGET_MS = INTRO_GATE_NATIVE_MS;
export const INTRO_GATE_HARD_EXIT_MS = 8000;
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

export function shouldSkipIntroGate(storage?: Pick<Storage, "getItem"> | null, webdriver?: boolean) {
  try {
    if (storage?.getItem(INTRO_FORCE_KEY) === "1") return false;
  } catch {
    /* ignore */
  }
  // Human visitors always receive the opening animation on an app boot.
  // Automated browser runs may skip it unless explicitly forced.
  return Boolean(webdriver);
}

export function markIntroSeen(storage?: Pick<Storage, "setItem"> | null) {
  try {
    storage?.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* ignore */
  }
}
