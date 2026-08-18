import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { saveReport, writeFullReport } from "@/lib/actions";
import type { AnalysisResult } from "@/lib/bazi/types";
import type { MethodProtocol, PalmReading } from "@/lib/core/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Mark } from "@/components/marks";

export function ResultView({ result }: { result: AnalysisResult }) {
  const { t } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const { fullReport, setFullReport, savedId, setSavedId, reset } = useAppStore();
  const [busy, setBusy] = useState<"full" | "save" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { chart, reading, question } = result;

  async function onFull() {
    setBusy("full");
    setMsg(null);
    try {
      const out = await writeFullReport({
        data: { question, chart, reading, palm: result.palm ?? null },
      });
      setFullReport(out.text);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "完整報告暫時未能生成。");
    } finally {
      setBusy(null);
    }
  }

  async function onSave() {
    setBusy("save");
    setMsg(null);
    try {
      const out = await saveReport({ data: { result, fullReport } });
      setSavedId(out.id);
    } catch (err) {
      const text = err instanceof Error ? err.message : "";
      setMsg(text === "Unauthorized" ? t("needLogin") : text || t("needLogin"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section id="result" className="space-y-5">
      <article className="seal-border relative overflow-hidden rounded-xl bg-cream/95 p-5 sm:p-7">
        <Mark id="05" size={80} className="absolute -right-1 -top-2 w-16 opacity-25" />
        <p className="text-xs tracking-[0.28em] text-cinnabar">{t("resultQ")}</p>
        <h2 className="mt-2 font-display text-2xl">{question}</h2>
        <p className="mt-4 text-sm leading-7 text-ink-soft">{reading.directAnswer}</p>
      </article>

      {result.palm && reading.kind === "past" ? <PalmPanel palm={result.palm} /> : null}

      <article className="seal-border relative overflow-hidden rounded-xl bg-cream/95 p-5 sm:p-7">
        <Mark id="11" size={64} className="absolute right-2 top-2 w-12 opacity-25" />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.28em] text-cinnabar">{t("chart")}</p>
            <h3 className="mt-1 font-display text-xl">
              {t("dayMaster")} {chart.dayMaster}
              {chart.dayMasterElement} · {t("monthLing")} {chart.monthBranch}
            </h3>
          </div>
          <p className="text-sm text-ink-mute">{chart.lunarDate}</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {chart.pillars.map((p) => {
            const ready = p.ready !== false && p.ganZhi !== "未定" && Boolean(p.gan);
            return (
            <div key={p.key} className="rounded-md border border-line bg-paper/50 p-3 text-center">
              <p className="text-xs tracking-[0.2em] text-ink-mute">{p.label}</p>
              <p className="mt-1 font-display text-3xl tracking-[0.12em]">
                {ready ? `${p.gan}${p.zhi}` : "未定"}
              </p>
              {ready ? (
                <>
                  <p className="mt-2 text-xs text-cinnabar">{p.shiShenGan}</p>
                  <p className="text-xs text-ink-mute">{p.nayin}</p>
                  <p className="mt-2 text-[11px] text-ink-soft">
                    {t("hide")} {p.hide.map((h) => `${h.gan}${h.shiShen}`).join(" ")}
                  </p>
                  <p className="text-[11px] text-ink-mute">
                    {t("dishi")} {p.diShi} · {t("xunkong")} {p.xunKong}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs leading-6 text-ink-mute">時辰未定，不偽造午時。</p>
              )}
            </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs leading-6 text-ink-mute">{chart.provenance}</p>
      </article>

      <article className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.28em] text-cinnabar">{t("wuxing")}</p>
        <p className="mt-4 text-sm leading-7 text-ink-soft">{chart.strength.summary}</p>
        <p className="mt-3 text-sm text-ink-soft">
          {t("useful")}：{chart.useful.join("、")}　{t("drain")}：{chart.drain.join("、")}
        </p>
      </article>

      {chart.dayun.length > 0 ? (
        <article className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
          <p className="text-xs tracking-[0.28em] text-cinnabar">{t("dayun")}</p>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {chart.dayun.map((d) => (
              <div
                key={`${d.ganZhi}-${d.startYear}`}
                className={`min-w-28 rounded-md border px-3 py-3 ${d.current ? "border-cinnabar bg-cinnabar/10" : "border-line bg-paper/40"}`}
              >
                <p className="font-display text-lg">{d.ganZhi}</p>
                <p className="text-xs text-ink-mute">
                  {d.startYear}–{d.endYear}
                </p>
                <p className="text-xs text-ink-mute">
                  {d.startAge}–{d.endAge} 歲
                </p>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      <article className="seal-border relative overflow-hidden rounded-xl bg-cream/95 p-5 sm:p-7">
        <Mark id="07" size={68} className="absolute bottom-2 right-2 w-12 opacity-20" />
        <p className="text-xs tracking-[0.28em] text-cinnabar">流年 · 胎元 · 命宮</p>
        <p className="mt-3 text-sm leading-7 text-ink-soft">
          今年{chart.currentYear}。胎元 {chart.taiyuan}，命宮 {chart.minggong}。
          流年給引動，不代替你現在就能做的那一步。
        </p>
      </article>

      <article className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.28em] text-cinnabar">{t("rhythm")}</p>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{reading.rhythm}</p>
        <p className="mt-4 font-display text-lg">{reading.decree}</p>
      </article>

      <article className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.28em] text-cinnabar">{t("life")}</p>
        <dl className="mt-4 space-y-3 text-sm leading-7">
          <div>
            <dt className="text-cinnabar">{t("work")}</dt>
            <dd className="text-ink-soft">{reading.work}</dd>
          </div>
          <div>
            <dt className="text-cinnabar">{t("love")}</dt>
            <dd className="text-ink-soft">{reading.love}</dd>
          </div>
          <div>
            <dt className="text-cinnabar">{t("money")}</dt>
            <dd className="text-ink-soft">{reading.money}</dd>
          </div>
          <div>
            <dt className="text-cinnabar">{t("body")}</dt>
            <dd className="text-ink-soft">{reading.body}</dd>
          </div>
          <div>
            <dt className="text-cinnabar">{t("home")}</dt>
            <dd className="text-ink-soft">{reading.home}</dd>
          </div>
        </dl>
      </article>

      <article className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.28em] text-cinnabar">{t("guide")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm leading-7 text-ink-soft">
          <p>
            {t("favor")}：{reading.guide.colors.join("、")} · {reading.guide.directions.favor.join("、")} ·{" "}
            {reading.guide.hours.favor.join("、")}
          </p>
          <p>
            {t("rest")}：{reading.guide.avoidColors.join("、")} · {reading.guide.directions.rest.join("、")}
          </p>
          <p className="sm:col-span-2">
            {t("pet")}：{reading.guide.pet}
          </p>
        </div>
      </article>

      <article className="seal-border relative overflow-hidden rounded-xl bg-cream/95 p-5 sm:p-7">
        <Mark id="08" size={72} className="absolute -right-1 top-2 w-14 opacity-25" />
        <p className="text-xs tracking-[0.28em] text-cinnabar">{t("action")}</p>
        <p className="mt-3 font-display text-xl leading-8">{reading.action}</p>
        <p className="mt-4 text-sm text-ink-soft">{reading.lastLine}</p>
      </article>

      {fullReport ? (
        <article className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
          <p className="text-xs tracking-[0.28em] text-cinnabar">{t("full")}</p>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-8 text-ink-soft">{fullReport}</div>
        </article>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={busy === "full"}
          onClick={() => void onFull()}
          className="h-12 flex-1 rounded-full bg-cinnabar text-cream disabled:opacity-60"
        >
          {busy === "full" ? t("generating") : t("genFull")}
        </button>
        {isPending ? (
          <span className="h-12 flex-1 animate-pulse rounded-full bg-paper-deep" />
        ) : user ? (
          <button
            type="button"
            disabled={busy === "save" || Boolean(savedId)}
            onClick={() => void onSave()}
            className="h-12 flex-1 rounded-full border border-line bg-cream text-ink disabled:opacity-60"
          >
            {savedId ? t("saved") : t("save")}
          </button>
        ) : (
          <Link to="/login" className="grid h-12 flex-1 place-items-center rounded-full border border-line bg-cream">
            {t("needLogin")}
          </Link>
        )}
        <button type="button" onClick={() => reset()} className="h-12 rounded-full px-5 text-ink-soft">
          {t("reset")}
        </button>
      </div>
      {msg ? <p className="text-sm text-cinnabar">{msg}</p> : null}
      {result.methodProtocol ? <MethodPanel protocol={result.methodProtocol} /> : null}
      <p className="text-xs leading-6 text-ink-mute">{t("disclaimer")}</p>
    </section>
  );
}

const DAO_TONE: Record<string, string> = {
  佛道: "text-gold",
  仙道: "text-water",
  人道: "text-ink",
  修羅道: "text-cinnabar",
  鬼道: "text-ink-mute",
  畜生道: "text-earth",
};

function PalmPanel({ palm }: { palm: PalmReading }) {
  return (
    <article className="seal-border relative overflow-hidden rounded-xl bg-cream/95 p-5 sm:p-7">
      <p className="text-xs tracking-[0.28em] text-cinnabar">達摩一掌經 · 四宮</p>
      <p className="mt-2 text-sm text-ink-mute">{palm.lunarLabel}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {palm.palaces.map((col) => (
          <div key={col.key} className="rounded-md border border-line bg-paper/50 p-3 text-center">
            <p className="text-[11px] tracking-[0.18em] text-ink-mute">{col.lifeLabel}</p>
            <p className={`mt-1 font-display text-4xl ${DAO_TONE[col.dao] ?? ""}`}>{col.zhi}</p>
            <p className="mt-1 text-sm text-cinnabar">{col.star}</p>
            <p className={`text-xs ${DAO_TONE[col.dao] ?? ""}`}>{col.dao}</p>
            <p className="mt-2 text-[11px] leading-5 text-ink-soft">{col.meaning}</p>
          </div>
        ))}
      </div>
      {palm.ready ? (
        <div className="mt-5 space-y-2 text-sm leading-7 text-ink-soft">
          <p>{palm.cause}</p>
          <p>{palm.fruit}</p>
          <p>{palm.seed}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-mute">缺{palm.missing.join("、")}，時宮／最近一世留白。</p>
      )}
    </article>
  );
}

function MethodPanel({ protocol }: { protocol: MethodProtocol }) {
  return (
    <details className="seal-border rounded-xl bg-paper/40 p-5 text-sm">
      <summary className="cursor-pointer text-xs tracking-[0.24em] text-ink-mute">分析方法與資料邊界 · 零額外 AI</summary>
      <p className="mt-3 leading-7 text-ink-soft">{protocol.routingReason}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[protocol.primary, ...protocol.selected].map((item) => (
          <div key={item.name} className="rounded-md border border-line bg-cream/80 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-display">{item.name}</p>
              <span className={`text-[11px] ${item.status === "已執行" ? "text-cinnabar" : "text-ink-mute"}`}>{item.status}</span>
            </div>
            <p className="mt-2 text-xs leading-6 text-ink-soft">{item.strength}</p>
            <p className="mt-1 text-[11px] leading-5 text-ink-mute">{item.bound}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
