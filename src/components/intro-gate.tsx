import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Mark } from "@/components/marks";

const KEY = "zhaowu.intro.v1";

export function IntroGate() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<"off" | "in" | "out">("off");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    setPhase("in");
    const hold = window.setTimeout(() => setPhase("out"), 1600);
    const done = window.setTimeout(() => {
      setPhase("off");
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
    }, 2200);
    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(done);
    };
  }, []);

  if (phase === "off") return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-paper transition-opacity duration-500 ${
        phase === "out" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="presentation"
    >
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <Mark id="brand" size={88} eager className="h-20 w-20 intro-seal" />
        <p className="font-display text-4xl tracking-[0.36em]">{t("brand")}</p>
        <p className="text-sm tracking-[0.28em] text-cinnabar">{t("manifesto")}</p>
      </div>
    </div>
  );
}
