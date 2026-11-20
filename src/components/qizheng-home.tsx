import type { AnalysisResult, AppLocale } from "@/lib/bazi/types";
import { calculateQizheng, type QizhengBody } from "@/lib/qizheng/engine";
import "@/qizheng-home.css";

type Props = { result: AnalysisResult };

const BRANCHES = ["戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥"];

const BODY_META: Record<QizhengBody["key"], { symbol: string; zhHant: string; zhHans: string; en: string }> = {
  sun: { symbol: "日", zhHant: "太陽", zhHans: "太阳", en: "Sun" },
  moon: { symbol: "月", zhHant: "太陰", zhHans: "太阴", en: "Moon" },
  mercury: { symbol: "水", zhHant: "辰星", zhHans: "辰星", en: "Mercury" },
  venus: { symbol: "金", zhHant: "太白", zhHans: "太白", en: "Venus" },
  mars: { symbol: "火", zhHant: "熒惑", zhHans: "荧惑", en: "Mars" },
  jupiter: { symbol: "木", zhHant: "歲星", zhHans: "岁星", en: "Jupiter" },
  saturn: { symbol: "土", zhHant: "鎮星", zhHans: "镇星", en: "Saturn" },
  ji: { symbol: "計", zhHant: "計都", zhHans: "计都", en: "Ji · North node" },
  luo: { symbol: "羅", zhHant: "羅睺", zhHans: "罗睺", en: "Luo · South node" },
  bei: { symbol: "孛", zhHant: "月孛", zhHans: "月孛", en: "Bei · lunar apogee" },
  ziqi: { symbol: "炁", zhHant: "紫炁", zhHans: "紫炁", en: "Zi Qi · traditional point" },
};

function copy(locale: AppLocale) {
  if (locale === "en") {
    return {
      kicker: "ZHAOWU · SKY LAYER",
      title: "Seven Luminaries & Four Derived Points",
      lead: "The same birth details now calculate the real Sun, Moon and five planets first, then keep the traditional derived points in a separate layer.",
      truth: "Astronomical positions",
      derived: "Derived / traditional",
      retro: "retrograde",
      profile: "Calculation profile",
      policies: ["Tropical ecliptic", "Ji = north node", "Moon as body reference", "Midnight day boundary"],
      note: "Mansion degrees, houses and classical patterns depend on a selected historical system. They are not mixed into this first truth layer until the same convention is verified.",
      unknown: "A precise birth time is required for the sky layer. The main reading remains available without inventing a time.",
    };
  }
  if (locale === "zh-Hans") {
    return {
      kicker: "昭梧 · 真天象层",
      title: "七政四余",
      lead: "同一份出生资料，先计算日、月与五星的真实位置，再把罗计、月孛、紫炁作为独立的传统派生层处理。",
      truth: "七政真天象",
      derived: "四余派生层",
      retro: "逆",
      profile: "计算口径",
      policies: ["回归黄道", "计北罗南", "太阴为身参考", "午夜换日"],
      note: "二十八宿宿度、命身宫与古籍格局会随宿界和盘制变化；未统一口径前，不把它们伪装成唯一答案。",
      unknown: "出生时辰未定时不生成七政天象盘；主报告照常交付，不伪造一个时辰。",
    };
  }
  return {
    kicker: "昭梧 · 真天象層",
    title: "七政四餘",
    lead: "同一份出生資料，先計算日、月與五星的真實位置，再把羅計、月孛、紫炁作為獨立的傳統派生層處理。",
    truth: "七政真天象",
    derived: "四餘派生層",
    retro: "逆",
    profile: "計算口徑",
    policies: ["回歸黃道", "計北羅南", "太陰為身參考", "午夜換日"],
    note: "二十八宿宿度、命身宮與古籍格局會隨宿界和盤制變化；未統一口徑前，不把它們偽裝成唯一答案。",
    unknown: "出生時辰未定時不生成七政天象盤；主報告照常交付，不偽造一個時辰。",
  };
}

function parseCivilStamp(stamp: string) {
  const m = stamp.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]), hour: Number(m[4]), minute: Number(m[5]) };
}

function polar(longitude: number, radius: number) {
  const angle = (longitude - 90) * (Math.PI / 180);
  return { x: 130 + Math.cos(angle) * radius, y: 130 + Math.sin(angle) * radius };
}

function QizhengWheel({ bodies }: { bodies: QizhengBody[] }) {
  return (
    <svg className="qz-wheel" viewBox="0 0 260 260" role="img" aria-label="七政四餘星位圖">
      <circle cx="130" cy="130" r="112" className="qz-wheel-line" />
      <circle cx="130" cy="130" r="88" className="qz-wheel-line qz-wheel-line-soft" />
      <circle cx="130" cy="130" r="56" className="qz-wheel-line qz-wheel-line-soft" />
      {BRANCHES.map((branch, index) => {
        const edge = polar(index * 30, 112);
        const label = polar(index * 30 + 15, 101);
        return (
          <g key={branch}>
            <line x1="130" y1="130" x2={edge.x} y2={edge.y} className="qz-wheel-spoke" />
            <text x={label.x} y={label.y} className="qz-wheel-branch">{branch}</text>
          </g>
        );
      })}
      {bodies.map((body, index) => {
        const p = polar(body.longitude, 76 - (index % 3) * 9);
        return (
          <g key={body.key} className={`qz-point qz-point-${body.confidence}`}>
            <circle cx={p.x} cy={p.y} r="7.5" />
            <text x={p.x} y={p.y + 0.5}>{BODY_META[body.key].symbol}</text>
          </g>
        );
      })}
      <text x="130" y="123" className="qz-wheel-center">七政</text>
      <text x="130" y="141" className="qz-wheel-center qz-wheel-center-small">四餘</text>
    </svg>
  );
}

function degree(value: number) {
  return `${value.toFixed(2)}°`;
}

export function QizhengHomePanel({ result }: Props) {
  const locale = result.locale ?? "zh-Hant";
  const c = copy(locale);
  const birth = parseCivilStamp(result.chart.civilStamp);
  if (!birth || result.chart.timeUnknown) {
    return (
      <section id="qizheng" className="qz-sheet" aria-label={c.title}>
        <p className="qz-kicker">{c.kicker}</p>
        <h2>{c.title}</h2>
        <p className="qz-muted">{c.unknown}</p>
      </section>
    );
  }
  const chart = calculateQizheng({ ...birth, timezone: result.chart.timezone });
  if (!chart) return null;
  const truth = chart.bodies.filter((body) => body.confidence === "astronomical");
  const derived = chart.bodies.filter((body) => body.confidence !== "astronomical");
  const labelFor = (body: QizhengBody) => {
    const meta = BODY_META[body.key];
    return locale === "en" ? meta.en : locale === "zh-Hans" ? meta.zhHans : meta.zhHant;
  };
  const renderBodies = (items: QizhengBody[]) => (
    <div className="qz-grid">
      {items.map((body) => (
        <div className="qz-body" key={body.key}>
          <span className={`qz-glyph qz-glyph-${body.confidence}`}>{BODY_META[body.key].symbol}</span>
          <span className="qz-body-copy">
            <strong>{labelFor(body)}</strong>
            <small>{body.palace}{degree(body.palaceDegree)}{body.retrograde ? ` · ${c.retro}` : ""}</small>
          </span>
        </div>
      ))}
    </div>
  );
  return (
    <section id="qizheng" className="qz-sheet" aria-label={c.title}>
      <header className="qz-head">
        <div>
          <p className="qz-kicker">{c.kicker}</p>
          <h2>{c.title}</h2>
        </div>
        <span className="qz-profile">{chart.profile}</span>
      </header>
      <p className="qz-lead">{c.lead}</p>
      <div className="qz-visual">
        <QizhengWheel bodies={chart.bodies} />
        <div className="qz-policy">
          <span>{c.profile}</span>
          {c.policies.map((item) => <b key={item}>{item}</b>)}
        </div>
      </div>
      <div className="qz-group">
        <h3>{c.truth}</h3>
        {renderBodies(truth)}
      </div>
      <div className="qz-group">
        <h3>{c.derived}</h3>
        {renderBodies(derived)}
      </div>
      <p className="qz-note">{c.note}</p>
    </section>
  );
}
