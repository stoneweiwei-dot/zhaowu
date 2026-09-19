import { useMemo, useState } from "react";
import type { Chart } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";
import { chartTerm, emptyBranches, ganzhiLabel, pillarName } from "@/lib/bazi/presentation";
import { SITE_RELEASE_FALLBACK } from "@/lib/site-stats";

async function copyPlainText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  textarea.remove();
  if (!ok) throw new Error("copy failed");
}

function aiReadablePackage(chart: Chart, locale: Locale) {
  const en = locale === "en";
  const hans = locale === "zh-Hans";
  const unknown = en ? "unknown" : hans ? "未知" : "未知";
  const lines = [
    en ? "[ZHAOWU AI-READABLE CHART PACKAGE]" : hans ? "[昭梧 AI 可读命盘资料包]" : "[昭梧 AI 可讀命盤資料包]",
    `Release: ${SITE_RELEASE_FALLBACK.version}`,
    `${en ? "Birth place" : hans ? "出生地" : "出生地"}: ${chart.cityLabel}`,
    `${en ? "Timezone" : hans ? "时区" : "時區"}: ${chart.timezone}`,
    `${en ? "Longitude" : hans ? "经度" : "經度"}: ${chart.longitude}`,
    `${en ? "Civil time" : hans ? "钟表时间" : "鐘錶時間"}: ${chart.civilStamp || unknown}`,
    `${en ? "True solar time" : hans ? "真太阳时" : "真太陽時"}: ${chart.trueSolarStamp || unknown}`,
    `${en ? "Calculation used true solar time" : hans ? "排盘是否采用真太阳时" : "排盤是否採用真太陽時"}: ${chart.usedTrueSolar ? (en ? "yes" : "是") : (en ? "no" : "否")}`,
    `${en ? "Birth-time status" : hans ? "出生时辰状态" : "出生時辰狀態"}: ${chart.timeUnknown ? unknown : chart.birthTimeReview.required ? (en ? "needs verification" : hans ? "需要校验" : "需要校驗") : (en ? "recorded" : hans ? "已记录" : "已記錄")}`,
    "",
    en ? "Four Pillars:" : hans ? "四柱：" : "四柱：",
  ];

  for (const pillar of chart.pillars) {
    const ready = pillar.ready && !(chart.timeUnknown && pillar.key === "time");
    if (!ready) {
      lines.push(`- ${pillarName(pillar.key, locale)}: ${unknown}`);
      continue;
    }
    const hidden = pillar.hide
      .map((item) => `${chartTerm(item.gan, locale)}·${chartTerm(item.shiShen, locale)}`)
      .join(" / ");
    lines.push(
      `- ${pillarName(pillar.key, locale)}: ${ganzhiLabel(pillar.ganZhi, locale)} | ${chartTerm(pillar.shiShenGan, locale)} | ${en ? "hidden" : hans ? "藏干" : "藏干"} ${hidden || "—"} | ${en ? "Na Yin" : hans ? "纳音" : "納音"} ${chartTerm(pillar.nayin, locale)} | ${en ? "stage" : hans ? "长生" : "長生"} ${chartTerm(pillar.diShi, locale)} | ${en ? "void" : "空亡"} ${emptyBranches(pillar.xunKong, locale)}`
    );
  }

  lines.push(
    "",
    `${en ? "Day master" : hans ? "日主" : "日主"}: ${chartTerm(chart.dayMaster, locale)} · ${chart.dayMasterElement}`,
    `${en ? "Month command" : hans ? "月令" : "月令"}: ${chartTerm(chart.monthBranch, locale)}`,
    `${en ? "Strength baseline" : hans ? "旺衰底盘" : "旺衰底盤"}: ${chart.strength.tendency} · ${chart.strength.summary}`,
    `${en ? "Life palace" : hans ? "命宫" : "命宮"}: ${chart.timeUnknown ? unknown : ganzhiLabel(chart.minggong, locale)}`,
    `${en ? "Current ten-year cycle" : hans ? "当前大运" : "目前大運"}: ${chart.currentDayun ? `${ganzhiLabel(chart.currentDayun.ganZhi, locale)} ${chart.currentDayun.startYear}–${chart.currentDayun.endYear}` : unknown}`,
    `${en ? "Engine provenance" : hans ? "排盘来源" : "排盤來源"}: ${chart.provenance || "ZHAOWU deterministic chart engine"}`,
    "",
    en
      ? "Use the calculated chart above as the source of truth. Interpret it; do not recalculate or silently replace the Four Pillars. If you use a different calendar, true-solar-time or Zi-hour rule, state the rule difference first."
      : hans
        ? "请把以上已计算命盘当作资料源：可以解读，但不要重新推算或静默改写四柱。若采用不同历法、真太阳时或子时换日规则，请先明确指出口径差异。"
        : "請把以上已計算命盤當作資料源：可以解讀，但不要重新推算或靜默改寫四柱。若採用不同曆法、真太陽時或子時換日規則，請先明確指出口徑差異。"
  );

  return lines.join("\n");
}

export function ChartTrustPanel({ chart, locale }: { chart: Chart; locale: Locale }) {
  const [copied, setCopied] = useState<"idle" | "ok" | "failed">("idle");
  const packageText = useMemo(() => aiReadablePackage(chart, locale), [chart, locale]);

  const copy = locale === "en"
    ? {
        kicker: "CHART DATA · VERIFIABLE",
        title: "Chart data you can audit and reuse",

        copyButton: "Copy chart",
        copied: "Copied",
        failed: "Copy failed",
        method: "Calculation method",
        verify: "How to verify",
        release: "Version and changes",
        civil: "Recorded clock time",
        solar: "True solar time",
        timezone: "Timezone",
        source: "Chart source",
        review: "Birth-hour review",
        reviewNeeded: "True-solar correction crossed a chart boundary, so both candidates must remain available for event-based verification.",
        reviewClear: "No true-solar boundary crossing is currently flagged for this chart.",

        compareBody: "For an independent check, enter the same birth record into another calculator and compare the Four Pillars first. If they differ, compare calendar, timezone, true-solar-time and Zi-hour rules before comparing interpretations.",

        updates: "View update record",
      }
    : locale === "zh-Hans"
      ? {
          kicker: "命盘资料 · 可核对",
          title: "命盘资料",

          copyButton: "复制命盘",
          copied: "已复制",
          failed: "复制失败",
          method: "计算口径",
          verify: "如何核对",
          release: "版本与变更",
          civil: "钟表时间",
          solar: "真太阳时",
          timezone: "时区",
          source: "排盘来源",
          review: "时柱校验",
          reviewNeeded: "真太阳时校正跨过命盘边界，两组候选都要保留，并用年份明确的事件反证。",
          reviewClear: "目前没有触发真太阳时跨时辰边界警示。",

          compareBody: "独立核对时，把同一份出生资料输入另一个排盘工具，先对四柱；若不同，再逐项比较历法、时区、真太阳时与子时换日口径，不要先比较解读文案。",

          updates: "查看更新记录",
        }
      : {
          kicker: "命盤資料 · 可核對",
          title: "命盤資料",

          copyButton: "複製命盤",
          copied: "已複製",
          failed: "複製失敗",
          method: "計算口徑",
          verify: "如何核對",
          release: "版本與變更",
          civil: "鐘錶時間",
          solar: "真太陽時",
          timezone: "時區",
          source: "排盤來源",
          review: "時柱校驗",
          reviewNeeded: "真太陽時校正跨過命盤邊界，兩組候選都要保留，並用年份明確的事件反證。",
          reviewClear: "目前沒有觸發真太陽時跨時辰邊界警示。",

          compareBody: "獨立核對時，把同一份出生資料輸入另一個排盤工具，先對四柱；若不同，再逐項比較曆法、時區、真太陽時與子時換日口徑，不要先比較解讀文案。",

          updates: "查看更新記錄",
        };

  async function onCopy() {
    try {
      await copyPlainText(packageText);
      setCopied("ok");
      window.setTimeout(() => setCopied("idle"), 1800);
    } catch {
      setCopied("failed");
      window.setTimeout(() => setCopied("idle"), 2200);
    }
  }

  return (
    <section className="zhaowu-chart-trust" data-chart-trust-panel aria-labelledby="zhaowu-chart-trust-title">
      <header>
        <p className="zhaowu-section-kicker">{copy.kicker}</p>
        <h3 id="zhaowu-chart-trust-title">{copy.title}</h3>
      </header>

      <button type="button" className="zhaowu-chart-copy" data-chart-ai-copy onClick={() => void onCopy()}>
        {copied === "ok" ? copy.copied : copied === "failed" ? copy.failed : copy.copyButton}
      </button>

      <div className="zhaowu-chart-trust-details">
        <details>
          <summary>{copy.method}</summary>
          <dl>
            <div><dt>{copy.civil}</dt><dd>{chart.civilStamp || "—"}</dd></div>
            <div><dt>{copy.solar}</dt><dd>{chart.trueSolarStamp || "—"}</dd></div>
            <div><dt>{copy.timezone}</dt><dd>{chart.timezone}</dd></div>
            <div><dt>{copy.source}</dt><dd>{chart.provenance || "ZHAOWU deterministic chart engine"}</dd></div>
            <div><dt>{copy.review}</dt><dd>{chart.birthTimeReview.required ? copy.reviewNeeded : copy.reviewClear}</dd></div>
          </dl>
        </details>

        <details>
          <summary>{copy.verify}</summary>
          <p>{copy.compareBody}</p>
        </details>

        <details>
          <summary>{copy.release}</summary>
          <p><strong>{SITE_RELEASE_FALLBACK.version}</strong></p>
          <a href="/updates">{copy.updates} ›</a>
        </details>
      </div>
    </section>
  );
}
