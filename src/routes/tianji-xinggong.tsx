import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { resolveTianjiBirth, type TianjiBirthResolution, type TianjiPalace } from "@/lib/tianji-xinggong";
import { useI18n, type Locale } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  formatSharedBirthRecord,
  readSharedBirthRecord,
  sharedBirthFromUnknown,
  writeSharedBirthRecord,
  type SharedBirthRecord,
} from "@/lib/shared-birth";
import "@/tianji-xinggong.css";

export const Route = createFileRoute("/tianji-xinggong")({ component: TianjiXinggongPage });

const PALACE_ORDER: TianjiPalace[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const UI = {
  "zh-Hant": {
    kicker: "天機星宮 · V2.0",
    title: "十二宮照見你的天機星",
    lead: "出生年月日與時間直接沿用首頁四柱八字的共享記錄；農曆月份、出生時辰與中氣仍由系統自動換算。",
    back: "返回昭梧",
    birth: "共享出生資料",
    ready: "已讀取首頁資料",
    missing: "尚未有共享出生資料，請先在首頁四柱八字分區填寫一次。",
    time: "天機星宮需要出生時辰；目前記錄為時辰未知，請回首頁補齊。",
    edit: "修改出生資料",
    calculate: "排出我的天機星宮",
    resultTitle: "你的星宮結果",
    birthResolved: "出生資料換算",
    palace: "命宮",
    star: "天機星",
    personality: "星宿性格",
    invalid: "這份出生資料暫時無法換算，請回首頁檢查。",
    systemRule: "固定查表 · 不調用 AI",
  },
  "zh-Hans": {
    kicker: "天机星宫 · V2.0",
    title: "十二宫照见你的天机星",
    lead: "出生年月日与时间直接沿用首页四柱八字的共享记录；农历月份、出生时辰与中气仍由系统自动换算。",
    back: "返回昭梧",
    birth: "共享出生资料",
    ready: "已读取首页资料",
    missing: "尚未有共享出生资料，请先在首页四柱八字分区填写一次。",
    time: "天机星宫需要出生时辰；目前记录为时辰未知，请回首页补齐。",
    edit: "修改出生资料",
    calculate: "排出我的天机星宫",
    resultTitle: "你的星宫结果",
    birthResolved: "出生资料换算",
    palace: "命宫",
    star: "天机星",
    personality: "星宿性格",
    invalid: "这份出生资料暂时无法换算，请回首页检查。",
    systemRule: "固定查表 · 不调用 AI",
  },
  en: {
    kicker: "TIANJI STAR PALACE · V2.0",
    title: "Find the star that rules your Life Palace",
    lead: "Birth date and time are reused from the shared Zi Ping BaZi record. Lunar month, birth-hour branch and middle-qi correction remain automatic.",
    back: "Back to Zhaowu",
    birth: "Shared birth record",
    ready: "Homepage birth record loaded",
    missing: "No shared birth record yet. Add it once in the Zi Ping BaZi section on the homepage.",
    time: "Tianji Star Palace needs a birth hour. Your record currently has time unknown; update it on the homepage.",
    edit: "Edit birth record",
    calculate: "Calculate my Star Palace",
    resultTitle: "Your Star Palace",
    birthResolved: "Resolved birth data",
    palace: "Life Palace",
    star: "Tianji star",
    personality: "Star character",
    invalid: "This birth record could not be converted. Check it on the homepage.",
    systemRule: "Deterministic table · no AI",
  },
} as const;

const STAR: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "天貴星", "zh-Hans": "天贵星", en: "Celestial Noble Star" }, 丑: { "zh-Hant": "天厄星", "zh-Hans": "天厄星", en: "Celestial Trial Star" },
  寅: { "zh-Hant": "天權星", "zh-Hans": "天权星", en: "Celestial Authority Star" }, 卯: { "zh-Hant": "天赦星", "zh-Hans": "天赦星", en: "Celestial Mercy Star" },
  辰: { "zh-Hant": "天如星", "zh-Hans": "天如星", en: "Celestial Adaptation Star" }, 巳: { "zh-Hant": "天文星", "zh-Hans": "天文星", en: "Celestial Scholar Star" },
  午: { "zh-Hant": "天福星", "zh-Hans": "天福星", en: "Celestial Fortune Star" }, 未: { "zh-Hant": "天驛星", "zh-Hans": "天驿星", en: "Celestial Journey Star" },
  申: { "zh-Hant": "天孤星", "zh-Hans": "天孤星", en: "Celestial Solitary Star" }, 酉: { "zh-Hant": "天秘星", "zh-Hans": "天秘星", en: "Celestial Mystery Star" },
  戌: { "zh-Hant": "天藝星", "zh-Hans": "天艺星", en: "Celestial Arts Star" }, 亥: { "zh-Hant": "天壽星", "zh-Hans": "天寿星", en: "Celestial Longevity Star" },
};

const CHARACTER: Record<TianjiPalace, Record<Locale, string>> = {
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

function TianjiXinggongPage() {
  const { locale } = useI18n();
  const { user } = useCurrentUserState();
  const copy = UI[locale];
  const [birth, setBirth] = useState<SharedBirthRecord | null>(null);
  const [resolution, setResolution] = useState<TianjiBirthResolution | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const server = sharedBirthFromUnknown(user?.birthData);
    const next = server ?? readSharedBirthRecord();
    setBirth(next);
    if (server) writeSharedBirthRecord(server);
  }, [user?.id, user?.birthData]);

  const blocker = !birth ? copy.missing : birth.timeUnknown ? copy.time : "";

  function submit() {
    if (!birth || blocker) return;
    try {
      setResolution(resolveTianjiBirth({ calendar: "solar", year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, isLeap: false }));
      setError("");
    } catch {
      setResolution(null);
      setError(copy.invalid);
    }
  }

  const palace = resolution?.result.palace ?? null;

  return (
    <main className="tianji-page" aria-labelledby="tianji-title">
      <div className="tianji-shell">
        <div className="tianji-topbar"><p className="tianji-kicker">{copy.kicker}</p><Link to="/" className="tianji-back">{copy.back}</Link></div>
        <section className="tianji-hero">
          <div className="tianji-hero-copy"><p className="tianji-rule-chip">{copy.systemRule}</p><h1 id="tianji-title" className="tianji-title">{copy.title}</h1><p className="tianji-lead">{copy.lead}</p></div>
          <div className="tianji-sigil" aria-hidden="true"><span>天</span><i /><b>機</b></div>
        </section>

        <div className="tianji-grid tianji-grid-shared">
          <section className="tianji-panel tianji-input-panel tianji-shared-birth" aria-labelledby="tianji-input-title">
            <div className="tianji-panel-heading"><span>01</span><h2 id="tianji-input-title">{copy.birth}</h2></div>
            {birth ? <div className="tianji-shared-birth-record"><span>{copy.ready}</span><strong>{formatSharedBirthRecord(birth, locale)}</strong></div> : null}
            {blocker ? <p className="tianji-error" role="alert">{blocker}</p> : null}
            <a href="/#bazi" className="tianji-edit-birth">{copy.edit}</a>
            {!blocker ? <button type="button" className="tianji-button" onClick={submit}>{copy.calculate}</button> : null}
            {error ? <p className="tianji-error" role="alert">{error}</p> : null}
          </section>

          <section className="tianji-panel tianji-result-panel" aria-live="polite" aria-labelledby="tianji-result-title">
            <div className="tianji-panel-heading"><span>02</span><h2 id="tianji-result-title">{copy.resultTitle}</h2></div>
            <div className="tianji-orbit" aria-hidden="true">
              <div className="tianji-orbit-ring" />
              <div className="tianji-core"><div><b>{palace ? STAR[palace][locale] : "天機"}</b><span>{palace ?? "十二"}</span></div></div>
              {PALACE_ORDER.map((item, index) => {
                const angle = (index / PALACE_ORDER.length) * 360 - 90;
                const style = { transform: `rotate(${angle}deg) translate(136px) rotate(${-angle}deg)` } as CSSProperties;
                return <span key={item} className="tianji-node" style={style} data-active={Boolean(palace === item)}>{item}</span>;
              })}
            </div>

            {resolution && palace ? (
              <div className="tianji-result">
                <div className="tianji-resolved-strip"><small>{copy.birthResolved}</small><p>{birth ? formatSharedBirthRecord(birth, locale) : ""}</p></div>
                <div className="tianji-result-cards"><div><small>{copy.palace}</small><strong>{palace}{locale === "en" ? " Palace" : "宮"}</strong></div><div><small>{copy.star}</small><strong>{STAR[palace][locale]}</strong></div></div>
                <div className="tianji-reading"><small>{copy.personality}</small><p>{CHARACTER[palace][locale]}</p></div>
              </div>
            ) : <div className="tianji-empty-state"><span>十二</span><p>{copy.lead}</p></div>}
          </section>
        </div>
      </div>
    </main>
  );
}
