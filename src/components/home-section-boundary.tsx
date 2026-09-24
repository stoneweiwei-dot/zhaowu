import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  id: "comic" | "analysis" | "install";
  children: ReactNode;
  onRecover?: () => void;
};

type State = { failed: boolean };

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

    const isAnalysis = this.props.id === "analysis";
    return (
      <section
        className="zhaowu-home-fail-open"
        data-home-fail-open={this.props.id}
        role={isAnalysis ? "alert" : undefined}
      >
        <p>
          {isAnalysis
            ? "出生資料模組暫時無法恢復；可重新載入本機生辰，不影響其他頁面。"
            : "此區暫時未能載入，已自動略過。"}
        </p>
        {this.props.onRecover ? (
          <button type="button" onClick={this.props.onRecover}>重新載入生辰</button>
        ) : null}
      </section>
    );
  }
}
