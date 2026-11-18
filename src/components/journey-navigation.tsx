import { useRouterState } from "@tanstack/react-router";
import { useDisplayLanguage } from "@/lib/display-language";
import { SITE_LOCALIZATION } from "@/lib/site-localization";
import "@/journey-navigation.css";

export function JourneyNavigation({ showHelp = true }: { showHelp?: boolean }) {
  const language = useDisplayLanguage((state) => state.language);
  const labels = SITE_LOCALIZATION[language].navigation;
  const path = useRouterState({ select: (state) => state.location.pathname });
  const items = [
    { href: "/", label: labels.home },
    { href: "/#birth-form", label: labels.book },
    { href: "/history", label: labels.reports },
  ];
  return <nav className="zw-journey-nav" aria-label={labels.aria}>
    {items.map((item) => <a key={item.href} href={item.href} aria-current={path !== "/" && path === item.href ? "page" : undefined}>{item.label}</a>)}
    {showHelp ? <button type="button" className="zw-journey-help" onClick={() => window.dispatchEvent(new Event("zhaowu:open-guide"))}>{labels.help}</button> : null}
  </nav>;
}
