import { useRouterState } from "@tanstack/react-router";
import { useAuthState } from "@/lib/auth/provider";
import { useI18n } from "@/lib/i18n";
import "@/journey-navigation.css";

export function JourneyNavigation() {
  const { user } = useAuthState();
  const { locale } = useI18n();
  const path = useRouterState({ select: s => s.location.pathname });
  const en = locale === "en", hans = locale === "zh-Hans";
  const items = [
    { href: "/", label: en ? "Home" : hans ? "首页" : "首頁" },
    { href: "/#birth-form", label: en ? "Create report" : hans ? "开始排盘" : "開始排盤" },
    { href: "/history", label: en ? "My reports" : hans ? "我的报告" : "我的報告" },
    ...(user?.isOwner ? [{ href: "/account", label: en ? "All reports" : hans ? "所有人报告" : "所有人報告" }] : []),
  ];
  const systems = [
    ["/ziwei", "紫微斗數", "紫微斗数", "Zi Wei"],
    ["/qizheng", "七政四餘", "七政四余", "Qi Zheng"],
    ["/astrology", "西洋占星", "西洋占星", "Western astrology"],
    ["/indian-astrology", "印度占星", "印度占星", "Indian astrology"],
    ["/yizhangjing", "一掌經", "一掌经", "Palm scripture"],
    ["/numerology", "生命靈數", "生命灵数", "Numerology"],
    ["/#today", "今日黃曆", "今日黄历", "Today’s almanac"],
    ["/fun-tests", "趣味測驗", "趣味测验", "Fun tests"],
  ];
  return <nav className="zw-journey-nav" aria-label={en ? "Reports and navigation" : hans ? "报告与页面入口" : "報告與頁面入口"}>
    {items.map(item => <a key={item.href} href={item.href} aria-current={path !== "/" && path === item.href ? "page" : undefined}>{item.label}</a>)}
    <details className="zw-journey-directory"><summary>{en ? "Other charts and tools" : hans ? "其他命盘与工具" : "其他命盤與工具"}</summary><div>{systems.map(([href, hant, simplified, english]) => <a key={href} href={href}>{en ? english : hans ? simplified : hant}</a>)}</div></details>
  </nav>;
}
