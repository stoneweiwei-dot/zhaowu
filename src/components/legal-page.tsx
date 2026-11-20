import { Link } from "@tanstack/react-router";
import "@/legal-pages.css";
import { displayText, useDisplayLanguage } from "@/lib/display-language";
import { LEGAL_CONTACT_EMAIL, LEGAL_OPERATOR_NAME } from "@/lib/legal-config";
import { LEGAL_DOCS, LEGAL_LAST_UPDATED, type LegalDocKey, type LegalLocale } from "@/lib/legal-content";

const NAV: ReadonlyArray<{ key: LegalDocKey; to: "/privacy" | "/terms" | "/copyright"; hant: string; hans: string; en: string }> = [
  { key: "privacy", to: "/privacy", hant: "隱私權政策", hans: "隐私权政策", en: "Privacy Policy" },
  { key: "terms", to: "/terms", hant: "服務條款", hans: "服务条款", en: "Terms of Service" },
  { key: "copyright", to: "/copyright", hant: "版權聲明", hans: "版权声明", en: "Copyright Notice" },
];

export function LegalPage({ doc }: { doc: LegalDocKey }) {
  const { language } = useDisplayLanguage();
  const locale: LegalLocale = language === "en" ? "en" : language === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const content = LEGAL_DOCS[doc][locale];
  const t = (hant: string, hans: string, en: string) => displayText(locale, hant, hans, en, en, en);

  return (
    <main className="zhaowu-updates-page zhaowu-legal-page" data-legal-page={doc}>
      <section className="zhaowu-updates-hero seal-border">
        <p className="zhaowu-updates-kicker">{content.kicker}</p>
        <h1>{content.title}</h1>
        <p className="zhaowu-updates-lead">{content.lead}</p>
        <p className="zhaowu-legal-meta">{t("最後更新", "最后更新", "Last updated")}：<time dateTime={LEGAL_LAST_UPDATED}>{LEGAL_LAST_UPDATED}</time></p>
        <ul className="zhaowu-legal-nav" aria-label={t("法律文件", "法律文件", "Legal documents")}>
          {NAV.map((item) => (
            <li key={item.key}>
              <Link to={item.to} aria-current={item.key === doc ? "page" : undefined}>{t(item.hant, item.hans, item.en)}</Link>
            </li>
          ))}
        </ul>
      </section>

      {content.sections.map((section) => (
        <section className="zhaowu-updates-card" key={section.h}>
          <h2>{section.h}</h2>
          {section.p?.map((text) => <p key={text}>{text}</p>)}
          {section.ul ? <ul>{section.ul.map((item) => <li key={item}>{item}</li>)}</ul> : null}
          {section.p2?.map((text) => <p key={text}>{text}</p>)}
        </section>
      ))}

      <section className="zhaowu-updates-card" aria-labelledby="legal-contact-title">
        <h2 id="legal-contact-title">{t("聯絡我們", "联系我们", "Contact us")}</h2>
        <p>
          {t(
            "隱私請求、更正或刪除資料、版權授權與侵權通知，請聯絡：",
            "隐私请求、更正或删除资料、版权授权与侵权通知，请联系：",
            "For privacy requests, corrections or deletion, copyright permissions and infringement notices, contact:",
          )}
        </p>
        <p>
          <strong>{LEGAL_OPERATOR_NAME}</strong>
          {LEGAL_CONTACT_EMAIL ? <> · <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a></> : null}
        </p>
        {!LEGAL_CONTACT_EMAIL ? (
          <p>{t("請透過本站公布的官方社群帳號私訊我們。", "请通过本站公布的官方社群账号私信我们。", "Please message us through the official social accounts listed on this site.")}</p>
        ) : null}
      </section>

      <Link to="/" className="zhaowu-updates-back">{t("返回首頁", "返回首页", "Back to home")}</Link>
    </main>
  );
}
