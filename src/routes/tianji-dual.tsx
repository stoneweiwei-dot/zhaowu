import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { calculateDualDestiny, type DualDestinyResult, type DualDirection } from "@/lib/dual-destiny";
import { timezoneOffsetHours } from "@/lib/bazi/cities";
import { toTrueSolar } from "@/lib/bazi/solar-time";
import type { CityHit } from "@/lib/bazi/types";
import { presentPalmPalace } from "@/lib/palm/standalone-presentation";
import { calculateTianjiXinggong, TIANJI_MONTHS, type TianjiPalace } from "@/lib/tianji-xinggong";
import { useI18n, type Locale } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  formatSharedBirthRecord,
  readSharedBirthRecord,
  sharedBirthFromUnknown,
  writeSharedBirthRecord,
  type SharedBirthRecord,
} from "@/lib/shared-birth";
import "@/tianji-dual.css";

export const Route = createFileRoute("/tianji-dual")({ component: TianjiDualPage });

const COPY = {
  "zh-Hant": {
    kicker: "昭梧 · 兩面反應",
    title: "一個人，兩種自然反應",
    lead: "看你平時怎樣做事，也看壓力升高時最先出現的反應。出生資料直接沿用首頁四柱八字區，不再重填。",
    back: "返回昭梧",
    birth: "共享出生資料",
    ready: "已讀取首頁資料",
    missing: "尚未有共享出生資料，請先在首頁四柱八字分區填寫一次。",
    time: "這個功能需要精確出生時間；目前記錄為時辰未知，請回首頁補齊。",
    gender: "這個功能需要出生性別；請回首頁出生資料補齊。",
    edit: "修改出生資料",
    submit: "看兩面結果",
    result: "你的兩種反應",
    outer: "平時怎樣做事",
    inner: "壓力來時的反應",
    details: "查看傳統盤面",
    outerChart: "外在盤面",
    innerChart: "內在盤面",
    corrected: "已按出生地真太陽時校正",
    invalid: "這份出生資料暫時無法換算。請回首頁檢查。",
  },
  "zh-Hans": {
    kicker: "昭梧 · 两面反应",
    title: "一个人，两种自然反应",
    lead: "看你平时怎样做事，也看压力升高时最先出现的反应。出生资料直接沿用首页四柱八字区，不再重填。",
    back: "返回昭梧",
    birth: "共享出生资料",
    ready: "已读取首页资料",
    missing: "尚未有共享出生资料，请先在首页四柱八字分区填写一次。",
    time: "这个功能需要精确出生时间；目前记录为时辰未知，请回首页补齐。",
    gender: "这个功能需要出生性别；请回首页出生资料补齐。",
    edit: "修改出生资料",
    submit: "看两面结果",
    result: "你的两种反应",
    outer: "平时怎样做事",
    inner: "压力来时的反应",
    details: "查看传统盘面",
    outerChart: "外在盘面",
    innerChart: "内在盘面",
    corrected: "已按出生地真太阳时校正",
    invalid: "这份出生资料暂时无法换算。请回首页检查。",
  },
  en: {
    kicker: "ZHAOWU · TWO RESPONSES",
    title: "One person, two natural responses",
    lead: "See how you usually operate and what appears first under pressure. Birth details are reused from the Zi Ping BaZi section and are not entered again here.",
    back: "Back to Zhaowu",
    birth: "Shared birth record",
    ready: "Homepage birth record loaded",
    missing: "No shared birth record yet. Add it once in the Zi Ping BaZi section on the homepage.",
    time: "This method needs an exact birth time. Your shared record currently has time unknown; update it on the homepage.",
    gender: "This method needs sex at birth. Add it to the shared birth record on the homepage.",
    edit: "Edit birth record",
    submit: "See both responses",
    result: "Your two responses",
    outer: "How you usually operate",
    inner: "What comes out under pressure",
    details: "View the traditional chart",
    outerChart: "Outward chart",
    innerChart: "Inner chart",
    corrected: "True solar time applied for birthplace",
    invalid: "This birth record could not be converted. Check it on the homepage.",
  },
} as const;

const TIANJI_CHARACTER: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "待人溫和，很會留意別人的情緒。", "zh-Hans": "待人温和，很会留意别人的情绪。", en: "Warm with people and quick to notice how others are feeling." },
  丑: { "zh-Hant": "遇到難事先扛住，不輕易把壓力說出口。", "zh-Hans": "遇到难事先扛住，不轻易把压力说出口。", en: "Takes on hard things first and rarely shows the pressure early." },
  寅: { "zh-Hant": "習慣先定方向，事情一亂就會自然接手。", "zh-Hans": "习惯先定方向，事情一乱就会自然接手。", en: "Sets a direction quickly and naturally takes over when things become messy." },
  卯: { "zh-Hant": "爽快重情，對自己人通常很有義氣。", "zh-Hans": "爽快重情，对自己人通常很有义气。", en: "Open, loyal and generous with the people you consider your own." },
  辰: { "zh-Hant": "先看局勢再出手，想清楚才願意定案。", "zh-Hans": "先看局势再出手，想清楚才愿意定案。", en: "Reads the situation first and commits once the shape of it is clear." },
  巳: { "zh-Hant": "重細節和完成度，做事不喜歡馬虎。", "zh-Hans": "重细节和完成度，做事不喜欢马虎。", en: "Cares about detail and finish, and dislikes careless work." },
  午: { "zh-Hant": "親和好相處，也容易得到別人的照應。", "zh-Hans": "亲和好相处，也容易得到别人的照应。", en: "Easy to be around and often met with goodwill from others." },
  未: { "zh-Hant": "適應很快，換到新環境反而更容易打開局面。", "zh-Hans": "适应很快，换到新环境反而更容易打开局面。", en: "Adapts quickly and often does better when a new environment opens the field." },
  申: { "zh-Hant": "獨立有主見，重要的事更相信自己的判斷。", "zh-Hans": "独立有主见，重要的事更相信自己的判断。", en: "Independent and more likely to trust personal judgement on important matters." },
  酉: { "zh-Hant": "先觀察再表態，不會很快把心思全說出來。", "zh-Hans": "先观察再表态，不会很快把心思全说出来。", en: "Observes before speaking and does not reveal every thought at once." },
  戌: { "zh-Hant": "反應快、手上有本事，喜歡用結果說話。", "zh-Hans": "反应快、手上有本事，喜欢用结果说话。", en: "Quick and capable, preferring finished work over long explanations." },
  亥: { "zh-Hant": "感受很深，也很容易察覺別人的情緒。", "zh-Hans": "感受很深，也很容易察觉别人的情绪。", en: "Feels things deeply and easily picks up other people's moods." },
};

const INNER_CHARACTER: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "心軟，遇事會先想到別人的感受。", "zh-Hans": "心软，遇事会先想到别人的感受。", en: "You soften first and instinctively consider other people's feelings." },
  丑: { "zh-Hant": "先忍、先撐，通常到最後才說自己累。", "zh-Hans": "先忍、先撑，通常到最后才说自己累。", en: "You endure first and usually admit you are tired only much later." },
  寅: { "zh-Hant": "一有壓力就想把局面抓回手裡。", "zh-Hans": "一有压力就想把局面抓回手里。", en: "Pressure makes you want to take the situation back into your own hands." },
  卯: { "zh-Hant": "不服輸，跌倒後會很快重新站起來。", "zh-Hans": "不服输，跌倒后会很快重新站起来。", en: "You resist defeat and tend to get back up quickly after a setback." },
  辰: { "zh-Hant": "警覺高，碰到不合理的事會立刻反應。", "zh-Hans": "警觉高，碰到不合理的事会立刻反应。", en: "You become highly alert and react quickly when something feels wrong." },
  巳: { "zh-Hant": "需要自己想清楚，不喜歡被人催著決定。", "zh-Hans": "需要自己想清楚，不喜欢被人催着决定。", en: "You need to think it through yourself and dislike being pushed into a decision." },
  午: { "zh-Hant": "希望大家都好，容易把別人的需要也扛起來。", "zh-Hans": "希望大家都好，容易把别人的需要也扛起来。", en: "You want everyone to be all right and can end up carrying their needs too." },
  未: { "zh-Hant": "先適應再找出路，忙起來容易忘了照顧自己。", "zh-Hans": "先适应再找出路，忙起来容易忘了照顾自己。", en: "You adapt first and find a way through, sometimes forgetting your own needs." },
  申: { "zh-Hant": "會先退開一點，自己消化和判斷。", "zh-Hans": "会先退开一点，自己消化和判断。", en: "You step back, process privately and make your own judgement." },
  酉: { "zh-Hant": "判斷快、動作直接，最怕事情拖著不處理。", "zh-Hans": "判断快、动作直接，最怕事情拖着不处理。", en: "You decide quickly and would rather act than leave a problem hanging." },
  戌: { "zh-Hant": "不愛多解釋，會用做出來的結果證明自己。", "zh-Hans": "不爱多解释，会用做出来的结果证明自己。", en: "You explain little and prefer the finished result to make the point." },
  亥: { "zh-Hant": "需要時間和空間消化情緒，緩過來才會重新靠近。", "zh-Hans": "需要时间和空间消化情绪，缓过来才会重新靠近。", en: "You need time and space to settle your feelings before reconnecting." },
};

const TIANJI_STARS: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "天貴星", "zh-Hans": "天贵星", en: "Celestial Noble Star" }, 丑: { "zh-Hant": "天厄星", "zh-Hans": "天厄星", en: "Celestial Trial Star" },
  寅: { "zh-Hant": "天權星", "zh-Hans": "天权星", en: "Celestial Authority Star" }, 卯: { "zh-Hant": "天赦星", "zh-Hans": "天赦星", en: "Celestial Mercy Star" },
  辰: { "zh-Hant": "天如星", "zh-Hans": "天如星", en: "Celestial Adaptation Star" }, 巳: { "zh-Hant": "天文星", "zh-Hans": "天文星", en: "Celestial Scholar Star" },
  午: { "zh-Hant": "天福星", "zh-Hans": "天福星", en: "Celestial Fortune Star" }, 未: { "zh-Hant": "天驛星", "zh-Hans": "天驿星", en: "Celestial Journey Star" },
  申: { "zh-Hant": "天孤星", "zh-Hans": "天孤星", en: "Celestial Solitary Star" }, 酉: { "zh-Hant": "天秘星", "zh-Hans": "天秘星", en: "Celestial Mystery Star" },
  戌: { "zh-Hant": "天藝星", "zh-Hans": "天艺星", en: "Celestial Arts Star" }, 亥: { "zh-Hant": "天壽星", "zh-Hans": "天寿星", en: "Celestial Longevity Star" },
};

const EN_BRANCH: Record<TianjiPalace, string> = { 子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai" };

function zonedCivilInstant(city: CityHit, year: number, month: number, day: number, hour: number, minute: number) {
  const wall = Date.UTC(year, month - 1, day, hour, minute, 0);
  let instantMs = wall;
  let offset = timezoneOffsetHours(city.timezone, new Date(instantMs));
  for (let i = 0; i < 3; i += 1) {
    const next = wall - offset * 3_600_000;
    if (Math.abs(next - instantMs) < 1_000) { instantMs = next; break; }
    instantMs = next;
    offset = timezoneOffsetHours(city.timezone, new Date(instantMs));
  }
  offset = timezoneOffsetHours(city.timezone, new Date(instantMs));
  return { instant: new Date(instantMs), offsetHours: offset };
}

function TianjiDualPage() {
  const { locale } = useI18n();
  const { user } = useCurrentUserState();
  const copy = COPY[locale];
  const [birth, setBirth] = useState<SharedBirthRecord | null>(null);
  const [result, setResult] = useState<DualDestinyResult | null>(null);
  const [error, setError] = useState("");
  const [timeNote, setTimeNote] = useState("");
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const server = sharedBirthFromUnknown(user?.birthData);
    const next = server ?? readSharedBirthRecord();
    setBirth(next);
    if (server) writeSharedBirthRecord(server);
  }, [user?.id, user?.birthData]);

  const blocker = !birth ? copy.missing : birth.timeUnknown ? copy.time : birth.gender === "unspecified" ? copy.gender : "";

  function calculate() {
    if (!birth || blocker) return;
    try {
      const direction: DualDirection = birth.gender === "female" ? "female" : "male";
      const civilResult = calculateDualDestiny({ calendar: "solar", year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, isLeap: false, direction });
      const solarDate = civilResult.tianji.solar;
      const local = zonedCivilInstant(birth.city, solarDate.year, solarDate.month, solarDate.day, birth.hour, birth.minute);
      const trueSolar = toTrueSolar({ year: solarDate.year, month: solarDate.month, day: solarDate.day, hour: birth.hour, minute: birth.minute, longitude: birth.city.longitude, tzOffsetHours: local.offsetHours });
      const correctedBase = calculateDualDestiny({ calendar: "solar", year: trueSolar.year, month: trueSolar.month, day: trueSolar.day, hour: trueSolar.hour, isLeap: false, direction });
      const afterMiddleQi = Boolean(correctedBase.tianji.middleQi && local.instant.getTime() >= correctedBase.tianji.middleQi.at.getTime());
      const correctedMonth = TIANJI_MONTHS[correctedBase.tianji.lunar.month - 1]!;
      const correctedTianji = calculateTianjiXinggong(correctedMonth, correctedBase.tianji.hourBranch, afterMiddleQi);
      setResult({ ...correctedBase, tianji: { ...correctedBase.tianji, result: correctedTianji } });
      setTimeNote(`${copy.corrected} · ${String(trueSolar.hour).padStart(2, "0")}:${String(trueSolar.minute).padStart(2, "0")}`);
      setError("");
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    } catch {
      setResult(null);
      setError(copy.invalid);
    }
  }

  const latest = result?.palm.latest ? presentPalmPalace(result.palm.latest, locale) : null;

  return (
    <main className="dual-page" aria-labelledby="dual-title">
      <div className="dual-shell">
        <div className="dual-topbar"><p>{copy.kicker}</p><Link to="/">{copy.back}</Link></div>
        <header className="dual-hero">
          <span className="dual-seal" aria-hidden="true">{locale === "en" ? "II" : "兩面"}</span>
          <p className="dual-kicker">{copy.kicker}</p>
          <h1 id="dual-title">{copy.title}</h1>
          <p>{copy.lead}</p>
        </header>

        <section className="dual-input-card dual-shared-birth" aria-labelledby="dual-input-title">
          <div className="dual-section-title"><h2 id="dual-input-title">{copy.birth}</h2></div>
          {birth ? <div className="dual-shared-birth-record"><span>{copy.ready}</span><strong>{formatSharedBirthRecord(birth, locale)}</strong></div> : null}
          {blocker ? <p className="dual-error" role="alert">{blocker}</p> : null}
          <a className="dual-edit-birth" href="/#bazi">{copy.edit}</a>
          {!blocker ? <button className="dual-submit" type="button" onClick={calculate}>{copy.submit}</button> : null}
          {timeNote ? <p className="dual-time-note">{timeNote}</p> : null}
          {error ? <p className="dual-error" role="alert">{error}</p> : null}
        </section>

        {result && latest ? (
          <section ref={resultRef} className="dual-results" aria-labelledby="dual-result-title" aria-live="polite">
            <div className="dual-section-title"><h2 id="dual-result-title">{copy.result}</h2></div>
            <div className="dual-side-grid">
              <article className="dual-side-card"><span className="dual-side-number" aria-hidden="true">一</span><div><h3>{copy.outer}</h3><p>{TIANJI_CHARACTER[result.tianji.result.palace][locale]}</p></div></article>
              <article className="dual-side-card"><span className="dual-side-number" aria-hidden="true">二</span><div><h3>{copy.inner}</h3><p>{INNER_CHARACTER[result.palm.latest!.zhi as TianjiPalace][locale]}</p></div></article>
            </div>
            <details className="dual-details">
              <summary>{copy.details}</summary>
              <dl>
                <div><dt>{copy.outerChart}</dt><dd>{locale === "en" ? EN_BRANCH[result.tianji.result.palace] : result.tianji.result.palace} · {TIANJI_STARS[result.tianji.result.palace][locale]}</dd></div>
                <div><dt>{copy.innerChart}</dt><dd>{latest.zhi} · {latest.star}</dd></div>
              </dl>
            </details>
          </section>
        ) : null}
      </div>
    </main>
  );
}
