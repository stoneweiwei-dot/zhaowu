import { useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import "@/journey-navigation.css";

export function JourneyNavigation({ showHelp = true }: { showHelp?: boolean }) {
  const { locale } = useI18n();
  const path = useRouterState({ select: s => s.location.pathname });
  const en = locale === "en", hans = locale === "zh-Hans";
  const items = [
    { href: "/", label: en ? "Home" : hans ? "首页" : "首頁" },
    { href: "/#birth-form", label: en ? "Build my book" : hans ? "建立命书" : "建立命書" },
    { href: "/history", label: en ? "My reports" : hans ? "我的报告" : "我的報告" },
  ];
  return <nav className="zw-journey-nav" aria-label={en ? "Reports and navigation" : hans ? "报告与页面入口" : "報告與頁面入口"}>
    {items.map(item => <a key={item.href} href={item.href} aria-current={path !== "/" && path === item.href ? "page" : undefined}>{item.label}</a>)}

    {showHelp ? <button type="button" className="zw-journey-help" onClick={() => window.dispatchEvent(new Event("zhaowu:open-guide"))}>{en ? "How to use" : hans ? "怎么用" : "怎麼用"}</button> : null}
  </nav>;
}
