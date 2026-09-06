import { useEffect } from "react";
import { readSharedBirthRecord, SHARED_BIRTH_EVENT } from "@/lib/shared-birth";

const D60_BIRTH_EVENT = "zhaowu:d60-birth";

function emitD60Birth() {
  const record = readSharedBirthRecord();
  const detail = record && !record.timeUnknown && record.city
    ? {
        year: record.year,
        month: record.month,
        day: record.day,
        hour: record.hour,
        minute: record.minute,
        city: record.city,
      }
    : null;
  window.dispatchEvent(new CustomEvent(D60_BIRTH_EVENT, { detail }));
}

function tryAutoGeneratePalm() {
  const form = document.querySelector<HTMLFormElement>("form.palm-form");
  if (!form || document.querySelector(".palm-result")) return;
  const checkedDirection = form.querySelector<HTMLInputElement>('input[name="palm-direction"]:checked');
  if (!checkedDirection) return;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  submit?.click();
  // PalmStandalone keeps its own explicit D60 confirmation switch and may emit null
  // during submit. Re-emit the shared minute-accurate birth on the next frame so the
  // already-mounted D60 section never gets cleared by sibling effect ordering.
  window.requestAnimationFrame(emitD60Birth);
}

export function YizhangjingRuntimeR79() {
  useEffect(() => {
    const refreshD60 = () => window.requestAnimationFrame(emitD60Birth);
    const initialTimer = window.setTimeout(() => {
      emitD60Birth();
      tryAutoGeneratePalm();
    }, 280);

    const onDirectionChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.name !== "palm-direction") return;
      window.requestAnimationFrame(() => {
        emitD60Birth();
        tryAutoGeneratePalm();
      });
    };

    window.addEventListener(SHARED_BIRTH_EVENT, refreshD60);
    document.addEventListener("change", onDirectionChange);
    return () => {
      window.clearTimeout(initialTimer);
      window.removeEventListener(SHARED_BIRTH_EVENT, refreshD60);
      document.removeEventListener("change", onDirectionChange);
    };
  }, []);

  return null;
}
