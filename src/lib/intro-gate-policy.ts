export const INTRO_GATE_MIN_VISIBLE_MS = 1200;
export const INTRO_GATE_HARD_EXIT_MS = 4800;
export const INTRO_GATE_FADE_MS = 180;

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
