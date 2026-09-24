import { Component, type ErrorInfo, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

type Props = {
  id: "comic" | "analysis" | "install";
  locale: Locale;
  children: ReactNode;
  onRecover?: () => void;
};

type State = { failed: boolean };

const COPY = {
  "zh-Hant": {
    analysis: "出生資料暫時無法恢復；可重新載入本機生辰，其他頁面不受影響。",
    other: "此區暫時未能載入，已自動略過。",
    recover: "重新載入生辰",
  },
  "zh-Hans": {
    analysis: "出生资料暂时无法恢复；可重新载入本机生辰，其他页面不受影响。",
    other: "此区暂时未能载入，已自动略过。",
    recover: "重新载入生辰",
  },
  en: {
    analysis: "Your saved birth details could not be restored. Reload them to continue; the rest of the site is still available.",
    other: "This section could not load and has been skipped.",
    recover: "Reload birth details",
  },
} as const;

export class HomeSectionBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Zhaowu home fail-open]", this.props.id, error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const copy = COPY[this.props.locale] ?? COPY["zh-Hant"];
    const isAnalysis = this.props.id === "analysis";
    return (
      <section className="zhaowu-home-fail-open" data-home-fail-open={this.props.id} role={isAnalysis ? "alert" : undefined}>
        <p>{isAnalysis ? copy.analysis : copy.other}</p>
        {this.props.onRecover ? <button type="button" onClick={this.props.onRecover}>{copy.recover}</button> : null}
      </section>
    );
  }
}
