import { useEffect, useMemo, useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n";

type InstallChoice = { outcome: "accepted" | "dismissed" };
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};
type NavigatorWithStandalone = Navigator & { standalone?: boolean };
type InstallStatus = "idle" | "accepted" | "installed";

const DISMISSED_AT_KEY = "zhaowu.homeInstall.dismissedAt.v2";
const DISMISS_MS = 24 * 60 * 60 * 1000;
const HOME_ICON = "/icons/zhaowu-green-lotus-r39-192.png";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function ShareIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M12 15V3m0 0L8.5 6.5M12 3l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 9.5H6a2 2 0 0 0-2 2v7A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5v-7a2 2 0 0 0-2-2h-1.5" strokeLinecap="round" /></svg>;
}
function PlusSquareIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M12 8v8M8 12h8" strokeLinecap="round" /></svg>;
}
function AddIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M5 12.5l4.2 4.2L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as NavigatorWithStandalone).standalone === true;
}
function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent) || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}
function isIOSSafari() {
  if (!isIOS()) return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA|Line|FBAN|FBAV|Instagram|MicroMessenger/i.test(ua);
}

export function HomeScreenInstallPrompt() {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [iosSafari, setIosSafari] = useState(false);
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<InstallStatus>("idle");

  const copy = useMemo(() => ({
    kicker: tr(locale, "快速入口", "快速入口", "QUICK ACCESS"),
    title: tr(locale, "把昭梧存到手機桌面", "把昭梧存到手机桌面", "Save Zhaowu to your Home Screen"),
    lead: tr(locale, "真正加入成功後，桌面會出現這個「昭梧」綠金蓮花圖示。", "真正添加成功后，桌面会出现这个“昭梧”绿金莲花图标。", "When installation is complete, this green-and-gold Zhaowu lotus icon will appear on your Home Screen."),
    installNow: tr(locale, "保存到手機桌面", "保存到手机桌面", "Save to Home Screen"),
    showSteps: tr(locale, "顯示 iPhone 保存步驟", "显示 iPhone 保存步骤", "Show iPhone steps"),
    retry: tr(locale, "存到桌面", "存到桌面", "Save to Home Screen"),
    later: tr(locale, "稍後再說", "稍后再说", "Maybe later"),
    safariOnly: tr(locale, "iPhone 請先用 Safari 打開這個頁面，再加入主畫面。LINE、微信、Instagram 等內置瀏覽器不能直接完成這一步。", "iPhone 请先用 Safari 打开这个页面，再添加到主屏幕。LINE、微信、Instagram 等内置浏览器不能直接完成这一步。", "On iPhone, open this page in Safari first. In-app browsers such as LINE, WeChat and Instagram cannot complete Home Screen installation directly."),
    safari1: tr(locale, "在 Safari 點「分享」；新版介面也可能要先點「更多」再找分享。", "在 Safari 点“分享”；新版界面也可能要先点“更多”再找分享。", "In Safari, tap Share. In newer layouts you may need to open More first."),
    safari2: tr(locale, "選「加入主畫面」。如果看不到，滑到底部進「編輯動作」把它加回來。", "选择“添加到主屏幕”。如果看不到，滑到底部进入“编辑操作”把它加回来。", "Choose Add to Home Screen. If it is missing, scroll to Edit Actions and add it back."),
    safari3: tr(locale, "最後按「加入／添加」。完成後回到手機桌面，應該會看到同一個綠金蓮花「昭梧」圖示。", "最后点“添加”。完成后回到手机桌面，应该会看到同一个绿金莲花“昭梧”图标。", "Tap Add. Then return to the Home Screen and look for the same green-and-gold Zhaowu lotus icon."),
    androidFallback: tr(locale, "如果沒有跳出系統安裝視窗，請打開瀏覽器選單，選「安裝應用程式」或「加入主畫面」。", "如果没有弹出系统安装窗口，请打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。", "If the system install dialog does not appear, open the browser menu and choose Install app or Add to Home screen."),
    accepted: tr(locale, "系統已接受安裝。請回手機桌面確認綠金蓮花「昭梧」圖示；網站不會在圖示真正建立前假裝已成功。", "系统已接受安装。请回手机桌面确认绿金莲花“昭梧”图标；网站不会在图标真正建立前假装已成功。", "The browser accepted the install. Check your Home Screen for the green-and-gold Zhaowu lotus icon; the site will not claim success before the app is actually installed."),
    note: tr(locale, "只有從桌面圖示開啟時，網站才會把你視為已安裝。", "只有从桌面图标打开时，网站才会把你视为已安装。", "The site only treats the app as installed when it is opened from the Home Screen."),
    close: tr(locale, "關閉", "关闭", "Close"),
  }), [locale]);

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone() || !isMobileBrowser()) return;
    setAvailable(true);
    setIos(isIOS());
    setIosSafari(isIOSSafari());
    let dismissed = false;
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) || 0);
      dismissed = Boolean(dismissedAt && Date.now() - dismissedAt < DISMISS_MS);
    } catch {}
    const timer = window.setTimeout(() => { if (!dismissed) setOpen(true); }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
      setAvailable(true);
    };
    const installed = () => {
      setStatus("installed");
      setDeferredPrompt(null);
      setOpen(false);
    };
    const recheck = () => {
      if (isStandalone()) {
        setStatus("installed");
        setOpen(false);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("pageshow", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
      window.removeEventListener("pageshow", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, []);

  function dismiss() {
    setOpen(false);
    setExpanded(false);
    try { localStorage.setItem(DISMISSED_AT_KEY, String(Date.now())); } catch {}
  }

  async function installNow() {
    if (ios) { setExpanded(true); return; }
    if (!deferredPrompt) { setExpanded(true); return; }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setStatus("accepted");
      setExpanded(true);
    }
    setDeferredPrompt(null);
  }

  if (isStandalone() || status === "installed") return null;
  if (!available && !deferredPrompt) return null;

  if (!open) {
    return <button type="button" onClick={() => { setOpen(true); setExpanded(ios); }} className="fixed bottom-[max(.75rem,env(safe-area-inset-bottom))] right-3 z-[89] min-h-10 rounded-full border border-earth/30 bg-[#fffaf0]/95 px-4 text-xs font-medium text-wood shadow-md">{copy.retry}</button>;
  }

  return <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
    <section className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-[1.55rem] border border-earth/30 bg-[#fffaf0]/[.98] shadow-[0_18px_52px_rgba(39,30,18,.2)] backdrop-blur-md" role="dialog" aria-labelledby="home-install-title" aria-describedby="home-install-lead">
      <div className="relative px-4 py-4 pr-12 sm:px-5 sm:py-5 sm:pr-14">
        <button type="button" onClick={dismiss} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-earth/20 bg-white/75 text-lg leading-none text-ink-soft" aria-label={copy.close}>×</button>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[0.9rem] border border-earth/25 bg-cream shadow-sm">
            <img src={HOME_ICON} alt="" className="h-full w-full object-cover" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold tracking-[0.22em] text-earth">{copy.kicker}</p>
            <h2 id="home-install-title" className="mt-0.5 font-display text-base font-semibold tracking-[0.04em] text-ink sm:text-lg">{copy.title}</h2>
          </div>
        </div>
        <p id="home-install-lead" className="mt-2 text-xs leading-5 text-ink-soft">{copy.lead}</p>
        {ios && !iosSafari ? <p className="mt-3 rounded-xl border border-cinnabar/20 bg-cinnabar/5 px-3 py-2 text-xs leading-5 text-ink">{copy.safariOnly}</p> : null}
        {status === "accepted" ? <p className="mt-3 rounded-xl border border-wood/25 bg-wood/5 px-3 py-2 text-xs leading-5 text-ink">{copy.accepted}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <button type="button" onClick={() => void installNow()} className="min-h-10 rounded-full bg-wood px-4 text-xs font-medium text-cream">{ios ? copy.showSteps : copy.installNow}</button>
          <button type="button" onClick={dismiss} className="min-h-10 px-2 text-[11px] text-ink-mute underline decoration-earth/35 underline-offset-4">{copy.later}</button>
        </div>
      </div>
      {expanded ? <div className="border-t border-earth/15 bg-white/45 px-4 py-4 sm:px-5">
        {ios ? (iosSafari ? <ol className="space-y-3">
          <li className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-earth/20 bg-cream text-wood"><ShareIcon /></span><span className="text-xs leading-5 text-ink"><b className="mr-2 text-earth">1</b>{copy.safari1}</span></li>
          <li className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-earth/20 bg-cream text-wood"><PlusSquareIcon /></span><span className="text-xs leading-5 text-ink"><b className="mr-2 text-earth">2</b>{copy.safari2}</span></li>
          <li className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-earth/20 bg-cream text-wood"><AddIcon /></span><span className="text-xs leading-5 text-ink"><b className="mr-2 text-earth">3</b>{copy.safari3}</span></li>
        </ol> : <p className="text-xs leading-5 text-ink">{copy.safariOnly}</p>) : <p className="text-xs leading-5 text-ink">{copy.androidFallback}</p>}
        <p className="mt-3 text-[11px] leading-5 text-ink-mute">{copy.note}</p>
      </div> : null}
    </section>
  </div>;
}
