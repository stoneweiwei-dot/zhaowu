import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const EMAIL_STORAGE_KEY = "zhaowu:free-summary-email.v1";
// Same shape check as the existing visitor-signup validation.
const EMAIL_SHAPE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

/**
 * Optional email capture under the free summary. No account, no password,
 * never blocks the flow: leaving it empty changes nothing.
 *
 * Honest limit, stated in the copy: the address is saved on this device
 * only. There is no mail-sending backend yet, so nothing is actually
 * emailed until one is built. The success copy says "saved", never "sent".
 */
export function FreeSummaryEmail({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(EMAIL_STORAGE_KEY);
      if (stored) {
        setEmail(stored);
        setSaved(true);
      }
    } catch {
      // Storage unavailable: the field still works for this visit.
    }
  }, []);
  const text = (hant: string, hans: string, en: string) =>
    locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
  function save() {
    const value = email.trim();
    if (!EMAIL_SHAPE.test(value)) {
      setError(true);
      setSaved(false);
      return;
    }
    try {
      localStorage.setItem(EMAIL_STORAGE_KEY, value);
    } catch {
      // Storage unavailable: treat the entry as saved for this visit.
    }
    setError(false);
    setSaved(true);
  }
  return (
    <section className="mb-4 mt-4 border-t border-line/60 pt-4" data-free-summary-email>
      <h3 className="font-display text-lg">{text("把這份概要寄到信箱（選填）", "把这份概要寄到邮箱（选填）", "Email me this summary (optional)")}</h3>
      <p className="mt-2 text-sm leading-6">
        {text(
          "只用來寄今天的時令與「免費概要還沒看大運流年」提醒。不設密碼、不建帳號。",
          "只用来寄今天的时令与「免费概要还没看大运流年」提醒。不设密码、不建账号。",
          "Only for today's seasonal note and a reminder that the free summary does not cover major-luck and annual timing yet. No password, no account.",
        )}
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-label={text("信箱地址", "邮箱地址", "Email address")}
          placeholder={text("你的信箱地址", "你的邮箱地址", "Your email address")}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSaved(false);
            setError(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              save();
            }
          }}
          className="h-11 min-w-0 flex-1 rounded-md border border-line bg-cream px-4 text-base outline-none focus:border-cinnabar"
        />
        <button
          type="button"
          onClick={save}
          className="h-11 shrink-0 rounded-lg bg-cinnabar px-5 text-sm text-cream"
        >
          {text("寄給我", "寄给我", "Send it to me")}
        </button>
      </div>
      {saved ? (
        <p role="status" className="mt-2 text-sm">
          {text("信箱已記在這台裝置上。", "邮箱已记在这台设备上。", "Saved on this device.")}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-sm text-cinnabar">
          {text("請輸入正確的信箱地址。", "请输入正确的邮箱地址。", "Please enter a valid email address.")}
        </p>
      ) : null}
    </section>
  );
}
