import { useState } from "react";
import { clearPurchaseConsent, hasPurchaseConsent, recordPurchaseConsent } from "@/lib/purchase-consent";

type ConsentLocale = "zh-Hant" | "zh-Hans" | "en";

const COPY = {
  "zh-Hant": {
    before: "我已年滿 18 歲，已閱讀並同意",
    terms: "《服務條款》",
    and: "與",
    privacy: "《隱私權政策》",
    after: "，並了解報告為數位內容，付款成功後即時開通。",
    note: "你依澳洲消費者法等強制性法律享有的權利不受影響。",
    needed: "請先勾選同意條款與隱私權政策，才能前往付款。",
  },
  "zh-Hans": {
    before: "我已年满 18 岁，已阅读并同意",
    terms: "《服务条款》",
    and: "与",
    privacy: "《隐私权政策》",
    after: "，并了解报告为数字内容，付款成功后即时开通。",
    note: "你依澳大利亚消费者法等强制性法律享有的权利不受影响。",
    needed: "请先勾选同意条款与隐私权政策，才能前往付款。",
  },
  en: {
    before: "I am 18 or over and I have read and agree to the ",
    terms: "Terms of Service",
    and: " and ",
    privacy: "Privacy Policy",
    after: ". I understand the report is digital content, unlocked as soon as payment succeeds.",
    note: "Your rights under the Australian Consumer Law and other mandatory laws are not affected.",
    needed: "Please tick the box to agree to the Terms and Privacy Policy before paying.",
  },
} as const;

/** Unticked on every page load; ticking records the consent version, unticking withdraws it. */
export function usePurchaseConsent() {
  const [checked, setChecked] = useState(false);
  const [needed, setNeeded] = useState(false);
  return {
    checked,
    needed,
    toggle(next: boolean) {
      setChecked(next);
      setNeeded(false);
      if (next) recordPurchaseConsent(); else clearPurchaseConsent();
    },
    /** Call before starting checkout; shows the prompt and returns false when consent is missing. */
    require() {
      if (checked && hasPurchaseConsent()) return true;
      setNeeded(true);
      return false;
    },
  };
}

export function consentNeededText(locale: ConsentLocale) {
  return COPY[locale].needed;
}

export function PurchaseConsent({ locale, checked, needed, onChange }: {
  locale: ConsentLocale;
  checked: boolean;
  needed: boolean;
  onChange: (next: boolean) => void;
}) {
  const copy = COPY[locale];
  return (
    <div className="zhaowu-purchase-consent" data-purchase-consent data-needed={needed ? "true" : "false"}>
      <label>
        <input
          type="checkbox"
          checked={checked}
          aria-invalid={needed}
          aria-describedby={needed ? "purchase-consent-needed" : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>
          {copy.before}
          <a href="/terms" target="_blank" rel="noopener">{copy.terms}</a>
          {copy.and}
          <a href="/privacy" target="_blank" rel="noopener">{copy.privacy}</a>
          {copy.after}
        </span>
      </label>
      <small>{copy.note}</small>
      {needed ? <p id="purchase-consent-needed" role="alert">{copy.needed}</p> : null}
    </div>
  );
}
