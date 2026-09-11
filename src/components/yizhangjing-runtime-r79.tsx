import { useEffect } from "react";

function submitPalm(force = false) {
  const form = document.querySelector<HTMLFormElement>("form.palm-form");
  if (!form) return;
  if (!force && document.querySelector(".palm-result")) return;
  const checkedDirection = form.querySelector<HTMLInputElement>('input[name="palm-direction"]:checked');
  if (!checkedDirection) return;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  submit?.click();
}

export function YizhangjingRuntimeR79() {
  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      submitPalm(false);
    }, 280);

    const onDirectionChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.name !== "palm-direction") return;
      window.requestAnimationFrame(() => {
        submitPalm(true);
      });
    };

    document.addEventListener("change", onDirectionChange);
    return () => {
      window.clearTimeout(initialTimer);
      document.removeEventListener("change", onDirectionChange);
    };
  }, []);

  return null;
}
