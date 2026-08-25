import { useEffect, useMemo, useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n";

type InstallChoice = { outcome: "accepted" | "dismissed" };

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

const DISMISSED_AT_KEY = "zhaowu.homeInstall.dismissedAt.v1";
const INSTALLED_ACK_KEY = "zhaowu.homeInstall.installedAck.v1";
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 15V3m0 0L8.5 6.5M12 3l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 9.5H6a2 2 0 0 0-2 2v7A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5v-7a2 2 0 0 0-2-2h-1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 12.5l4.2 4.2L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as NavigatorWithStandalone).standalone === true;
}

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent);
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function HomeScreenInstallPrompt() {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);

  const copy = useMemo(() => ({
    kicker: tr(locale, "快速入口", "快速入口", "QUICK ACCESS"),
    title: tr(locale, "把昭梧加入主畫面", "把昭梧加入主画面", "Add Zhaowu to your Home Screen"),
    lead: tr(locale, "下次直接從桌面開啟，不必再找網址。", "下次直接从桌面打开，不必再找网址。", "Open Zhaowu from your Home Screen next time, without hunting for the link."),
    showSteps: tr(locale, "查看加入步驟", "查看添加步骤", "Show steps"),
    hideSteps: tr(locale, "收起步驟", "收起步骤", "Hide steps"),
    safari1: tr(locale, "點 Safari 底部中間的「分享」按鈕", "点 Safari 底部中间的“分享”按钮", "Tap the Share button at the bottom of Safari"),
    safari2: tr(locale, "向下滑，選「加入主畫面」", "向下滑，选择“加入主画面”", "Scroll down and choose “Add to Home Screen”"),
    safari3: tr(locale, "右上角按「加入」", "右上角点“添加”", "Tap “Add” in the top-right corner"),
    android1: tr(locale, "點瀏覽器選單，再選「加入主畫面／安裝應用程式」", "点浏览器菜单，再选“添加到主屏幕／安装应用”", "Open the browser menu and choose “Add to Home screen” or “Install app”"),
    note: tr(locale, "從主畫面開啟後，這個提示會自動消失。", "从主画面打开后，这个提示会自动消失。", "Once opened from the Home Screen, this prompt disappears automatically."),
    installNow: tr(locale, "立即加入主畫面", "立即加入主画面", "Add to Home Screen"),
    gotIt: tr(locale, "知道了", "知道了", "Got it"),
    already: tr(locale, "已加入，不再提示", "已添加，不再提示", "Already added"),
  }), [locale]);

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone() || !isMobileBrowser()) return;
    setIos(isIOS());

    try {
      if (localStorage.getItem(INSTALLED_ACK_KEY) === "1") return;
      const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_MS) return;
    } catch {
      // Storage may be unavailable in private mode. The prompt can still work.
    }

    const timer = window.setTimeout(() => setOpen(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setOpen(false);
    setExpanded(false);
    try {
      localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    } catch {
      // no-op
    }
  }

  function markInstalled() {
    setOpen(false);
    setExpanded(false);
    try {
      localStorage.setItem(INSTALLED_ACK_KEY, "1");
    } catch {
      // no-op
    }
  }

  async function installNow() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") markInstalled();
    else dismiss();
    setDeferredPrompt(null);
  }

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
      <section
        className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-[1.55rem] border border-earth/30 bg-[#fffaf0]/[.98] shadow-[0_18px_52px_rgba(39,30,18,.2)] backdrop-blur-md"
        role="dialog"
        aria-labelledby="home-install-title"
        aria-describedby="home-install-lead"
      >
        <div className="relative px-4 py-4 pr-12 sm:px-5 sm:py-5 sm:pr-14">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-earth/20 bg-white/75 text-lg leading-none text-ink-soft"
            aria-label={copy.gotIt}
          >
            ×
          </button>

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-earth/25 bg-cream shadow-sm">
              <img src="/emblems/lotus-emblem.svg" alt="" className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold tracking-[0.22em] text-earth">{copy.kicker}</p>
              <h2 id="home-install-title" className="mt-0.5 font-display text-base font-semibold tracking-[0.04em] text-ink sm:text-lg">{copy.title}</h2>
            </div>
          </div>

          <p id="home-install-lead" className="mt-2 text-xs leading-5 text-ink-soft">{copy.lead}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {ios ? (
              <button type="button" onClick={() => setExpanded((value) => !value)} className="min-h-9 rounded-full border border-wood/25 bg-wood/5 px-4 text-xs font-medium text-wood" aria-expanded={expanded}>
                {expanded ? copy.hideSteps : copy.showSteps}
              </button>
            ) : deferredPrompt ? (
              <button type="button" onClick={installNow} className="min-h-9 rounded-full bg-wood px-4 text-xs font-medium text-cream">
                {copy.installNow}
              </button>
            ) : (
              <button type="button" onClick={() => setExpanded((value) => !value)} className="min-h-9 rounded-full border border-wood/25 bg-wood/5 px-4 text-xs font-medium text-wood" aria-expanded={expanded}>
                {expanded ? copy.hideSteps : copy.showSteps}
              </button>
            )}
            <button type="button" onClick={markInstalled} className="min-h-9 px-1 text-[11px] text-ink-mute underline decoration-earth/35 underline-offset-4">
              {copy.already}
            </button>
          </div>
        </div>

        {expanded ? (
          <div className="border-t border-earth/15 bg-white/45 px-4 py-4 sm:px-5">
            {ios ? (
              <ol className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-earth/20 bg-cream text-wood"><ShareIcon /></span>
                  <span className="text-xs leading-5 text-ink"><b className="mr-2 text-earth">1</b>{copy.safari1}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-earth/20 bg-cream text-wood"><PlusSquareIcon /></span>
                  <span className="text-xs leading-5 text-ink"><b className="mr-2 text-earth">2</b>{copy.safari2}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-earth/20 bg-cream text-wood"><AddIcon /></span>
                  <span className="text-xs leading-5 text-ink"><b className="mr-2 text-earth">3</b>{copy.safari3}</span>
                </li>
              </ol>
            ) : (
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-earth/20 bg-cream text-wood"><PlusSquareIcon /></span>
                <p className="text-xs leading-5 text-ink">{copy.android1}</p>
              </div>
            )}
            <p className="mt-3 text-[11px] leading-5 text-ink-mute">{copy.note}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}