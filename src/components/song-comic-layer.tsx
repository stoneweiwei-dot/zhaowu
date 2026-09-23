import { useMemo, useState } from "react";
import { dayGanzhi } from "@/lib/bazi/calendar";
import type { Locale } from "@/lib/i18n";

type ComicProfile = {
  element: "木" | "火" | "土" | "金" | "水";
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  move: Record<Locale, string>;
  genre: Record<Locale, string>;
};

const COMIC_PROFILES: Record<string, ComicProfile> = {
  甲: { element: "木", title: { "zh-Hant": "先長出方向", "zh-Hans": "先长出方向", en: "Grow toward a direction" }, body: { "zh-Hant": "甲木像向上伸展的樹幹。重點不是一次做到完美，而是先確定你正在往哪裡長。", "zh-Hans": "甲木像向上伸展的树干。重点不是一次做到完美，而是先确定你正在往哪里长。", en: "Jia Wood is like a trunk growing upward: choose a direction before chasing perfection." }, move: { "zh-Hant": "今天先做一件能讓局面往前長的事。", "zh-Hans": "今天先做一件能让局面往前长的事。", en: "Do one thing today that creates forward growth." }, genre: { "zh-Hant": "開拓成長片", "zh-Hans": "开拓成长片", en: "a growth story" } },
  乙: { element: "木", title: { "zh-Hant": "柔軟不是退讓", "zh-Hans": "柔软不是退让", en: "Flexibility is not surrender" }, body: { "zh-Hant": "乙木像藤蔓與花枝，會繞開硬牆，但仍然往光的方向去。", "zh-Hans": "乙木像藤蔓与花枝，会绕开硬墙，但仍然往光的方向去。", en: "Yi Wood bends around hard walls while still reaching for light." }, move: { "zh-Hant": "換一條路，不等於放棄目的地。", "zh-Hans": "换一条路，不等于放弃目的地。", en: "Changing route does not mean abandoning the destination." }, genre: { "zh-Hant": "曲線成長片", "zh-Hans": "曲线成长片", en: "a winding growth story" } },
  丙: { element: "火", title: { "zh-Hant": "把光放在重點上", "zh-Hans": "把光放在重点上", en: "Put the light on what matters" }, body: { "zh-Hant": "丙火像日光，適合照亮、推進與讓事情被看見；太分散時，熱度反而變成消耗。", "zh-Hans": "丙火像日光，适合照亮、推进与让事情被看见；太分散时，热度反而变成消耗。", en: "Bing Fire is daylight: it works best when its energy is focused on one visible priority." }, move: { "zh-Hant": "今天只點亮一個真正重要的焦點。", "zh-Hans": "今天只点亮一个真正重要的焦点。", en: "Light up one priority instead of ten." }, genre: { "zh-Hant": "熱烈行動片", "zh-Hans": "热烈行动片", en: "a vivid action story" } },
  丁: { element: "火", title: { "zh-Hant": "小火也能照很久", "zh-Hans": "小火也能照很久", en: "A small flame can last" }, body: { "zh-Hant": "丁火更像燈火與燭光，不靠聲量取勝，而靠持續、細緻與恰到好處的溫度。", "zh-Hans": "丁火更像灯火与烛光，不靠声量取胜，而靠持续、细致与恰到好处的温度。", en: "Ding Fire is lamplight: quiet, precise and sustained rather than loud." }, move: { "zh-Hant": "把注意力留給真正需要你照看的地方。", "zh-Hans": "把注意力留给真正需要你照看的地方。", en: "Keep your attention where steady care matters." }, genre: { "zh-Hant": "微光情感片", "zh-Hans": "微光情感片", en: "an intimate light-filled story" } },
  戊: { element: "土", title: { "zh-Hant": "先穩住承載面", "zh-Hans": "先稳住承载面", en: "Stabilise the ground first" }, body: { "zh-Hant": "戊土像山與高地，優勢在承擔與定局；但不是所有重量都需要你扛。", "zh-Hans": "戊土像山与高地，优势在承担与定局；但不是所有重量都需要你扛。", en: "Wu Earth is mountain ground: reliable and containing, but not every weight is yours to carry." }, move: { "zh-Hant": "先分清責任，再決定要不要接住。", "zh-Hans": "先分清责任，再决定要不要接住。", en: "Separate responsibility from obligation before carrying more." }, genre: { "zh-Hant": "守城史詩片", "zh-Hans": "守城史诗片", en: "a grounded epic" } },
  己: { element: "土", title: { "zh-Hant": "整理就是一種能力", "zh-Hans": "整理就是一种能力", en: "Cultivation is a skill" }, body: { "zh-Hant": "己土像田園與土壤，擅長把零散的東西慢慢養成可用、可持續的形狀。", "zh-Hans": "己土像田园与土壤，擅长把零散的东西慢慢养成可用、可持续的形状。", en: "Ji Earth is cultivated soil: it turns scattered material into something usable and sustainable." }, move: { "zh-Hant": "今天把一件凌亂的事整理成可繼續的狀態。", "zh-Hans": "今天把一件凌乱的事整理成可继续的状态。", en: "Turn one messy thing into a workable next state." }, genre: { "zh-Hant": "慢熱生活片", "zh-Hans": "慢热生活片", en: "a slow-burn life story" } },
  庚: { element: "金", title: { "zh-Hant": "該切開時就切開", "zh-Hans": "该切开时就切开", en: "Cut through what no longer works" }, body: { "zh-Hant": "庚金像未磨鈍的工具，力量在破局與斷捨離；真正的鋒利，是知道什麼值得留下。", "zh-Hans": "庚金像未磨钝的工具，力量在破局与断舍离；真正的锋利，是知道什么值得留下。", en: "Geng Metal cuts through dead weight; its real sharpness is knowing what deserves to remain." }, move: { "zh-Hant": "刪掉一個已經證明沒有用的選項。", "zh-Hans": "删掉一个已经证明没有用的选项。", en: "Remove one option that has already proved useless." }, genre: { "zh-Hant": "破局動作片", "zh-Hans": "破局动作片", en: "a decisive action story" } },
  辛: { element: "金", title: { "zh-Hant": "分辨、提純、落筆", "zh-Hans": "分辨、提纯、落笔", en: "Discern, refine, commit" }, body: { "zh-Hant": "辛金不是只會鋒利，而是把混雜的東西分清楚，再把真正有價值的部分留下來。", "zh-Hans": "辛金不是只会锋利，而是把混杂的东西分清楚，再把真正有价值的部分留下来。", en: "Xin Metal is not just sharpness: it separates noise from value, then commits with precision." }, move: { "zh-Hant": "先辨別，再決定；不要用速度代替判斷。", "zh-Hans": "先辨别，再决定；不要用速度代替判断。", en: "Discern first; do not use speed as a substitute for judgement." }, genre: { "zh-Hant": "細節偵探片", "zh-Hans": "细节侦探片", en: "a precision mystery" } },
  壬: { element: "水", title: { "zh-Hant": "流動，但不失方向", "zh-Hans": "流动，但不失方向", en: "Flow without losing direction" }, body: { "zh-Hant": "壬水像江海，能容納複雜資訊，也容易同時接住太多。流動的前提，是知道自己往哪裡去。", "zh-Hans": "壬水像江海，能容纳复杂信息，也容易同时接住太多。流动的前提，是知道自己往哪里去。", en: "Ren Water can hold complexity, but flow works best when it still has a direction." }, move: { "zh-Hant": "先讓資訊流過，再只留下真正要處理的一件事。", "zh-Hans": "先让信息流过，再只留下真正要处理的一件事。", en: "Let the noise pass, then keep the one thing that truly needs action." }, genre: { "zh-Hant": "流動公路片", "zh-Hans": "流动公路片", en: "a flowing road story" } },
  癸: { element: "水", title: { "zh-Hant": "細微處也有答案", "zh-Hans": "细微处也有答案", en: "The answer may be in the subtle details" }, body: { "zh-Hant": "癸水像雨露與霧氣，擅長感受細節與暗線；敏銳時更需要替自己保留清楚的邊界。", "zh-Hans": "癸水像雨露与雾气，擅长感受细节与暗线；敏锐时更需要替自己保留清楚的边界。", en: "Gui Water notices subtle signals and hidden threads; sensitivity works better with clear boundaries." }, move: { "zh-Hant": "把感受到的事寫下來，再區分事實與猜測。", "zh-Hans": "把感受到的事写下来，再区分事实与猜测。", en: "Write down what you sense, then separate fact from inference." }, genre: { "zh-Hant": "暗線詩意片", "zh-Hans": "暗线诗意片", en: "a subtle poetic story" } },
};

function profileForStem(stem: string) {
  return COMIC_PROFILES[stem] ?? COMIC_PROFILES.壬;
}

function ComicMascot({ stem, compact = false }: { stem: string; compact?: boolean }) {
  const profile = profileForStem(stem);
  const palette = {
    木: { fill: "#dfead7", accent: "#6f8f68" },
    火: { fill: "#f3ddd3", accent: "#b9624e" },
    土: { fill: "#eadfca", accent: "#9a7d54" },
    金: { fill: "#dfe9e8", accent: "#668987" },
    水: { fill: "#dce9ef", accent: "#6b8fa2" },
  }[profile.element];

  return (
    <svg className={compact ? "zhaowu-comic-mascot is-compact" : "zhaowu-comic-mascot"} viewBox="0 0 220 170" role="img" aria-label={stem}>
      <path d="M26 142c26-16 49-18 72-8 25 11 51 11 94-2" fill="none" stroke="rgba(58,52,44,.18)" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="112" cy="106" rx="48" ry="43" fill={palette.fill} stroke="#4d4a44" strokeWidth="2.4" />
      <path d="M74 81c8-30 67-35 78 0l-5 19c-15-11-54-11-69 0z" fill={palette.accent} stroke="#4d4a44" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M148 86c17 3 29 11 38 24" fill="none" stroke={palette.accent} strokeWidth="7" strokeLinecap="round" opacity=".75" />
      <circle cx="96" cy="105" r="2.6" fill="#4d4a44" />
      <circle cx="128" cy="105" r="2.6" fill="#4d4a44" />
      <path d="M105 116c5 4 10 4 15 0" fill="none" stroke="#4d4a44" strokeWidth="2" strokeLinecap="round" />
      <text x="112" y="75" textAnchor="middle" fontSize="24" fontFamily="serif" fill="#fffaf0">{stem}</text>
      {profile.element === "木" ? <>
        <path d="M38 61c8-10 22-9 26 0-7 7-17 9-26 0z" fill="#8ca87f" />
        <path d="M51 62v22" stroke="#6d7d65" strokeWidth="3" strokeLinecap="round" />
      </> : null}
      {profile.element === "火" ? <>
        <circle cx="39" cy="58" r="11" fill="#d9815d" />
        {[0,45,90,135].map((deg) => <line key={deg} x1="39" y1="40" x2="39" y2="32" stroke="#d9815d" strokeWidth="3" transform={`rotate(${deg} 39 58)`} />)}
      </> : null}
      {profile.element === "土" ? <path d="M24 76l18-18 18 18-8 16H32z" fill="#b59b76" stroke="#74634d" strokeWidth="2" /> : null}
      {profile.element === "金" ? <path d="M39 47l14 13-14 19-14-19z" fill="#b7d0cf" stroke="#668987" strokeWidth="2" /> : null}
      {profile.element === "水" ? <>
        <path d="M23 69c10-10 18 10 28 0 10-10 18 10 28 0" fill="none" stroke="#7fa7ba" strokeWidth="5" strokeLinecap="round" />
        <circle cx="41" cy="46" r="5" fill="#9ec2d0" />
      </> : null}
      <path d="M168 37c12 2 17 8 18 17-7-3-13-8-18-17z" fill="none" stroke="rgba(58,52,44,.32)" strokeWidth="2" />
      <circle cx="177" cy="28" r="3" fill={palette.accent} opacity=".65" />
    </svg>
  );
}

function copyFor(locale: Locale) {
  return locale === "en"
    ? { today: "TODAY · ONE COMIC", explain: "A softer way into the idea", report: "DESTINY BOOK INSERT", plain: "One concept, translated into ordinary language", share: "SHAREABLE FRAME", shareButton: "Share this frame", copied: "Copied", boundary: "Cultural imagery, not a deterministic verdict." }
    : locale === "zh-Hans"
      ? { today: "今日一格", explain: "先用一张小漫画，把抽象概念讲人话", report: "命书小插页", plain: "把一个术语，换成更贴近生活的说法", share: "可分享一格", shareButton: "分享这一格", copied: "已复制", boundary: "这是文化象意的白话翻译，不替代正式命盘判断。" }
      : { today: "今日一格", explain: "先用一張小漫畫，把抽象概念講人話", report: "命書小插頁", plain: "把一個術語，換成更貼近生活的說法", share: "可分享一格", shareButton: "分享這一格", copied: "已複製", boundary: "這是文化象意的白話翻譯，不替代正式命盤判斷。" };
}

export function SongComicToday({ locale }: { locale: Locale }) {
  const stem = useMemo(() => {
    const now = new Date();
    return dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate())[0] || "壬";
  }, []);
  const profile = profileForStem(stem);
  const copy = copyFor(locale);

  return (
    <section className="zhaowu-song-comic zhaowu-song-comic--today" data-song-comic-today aria-label={copy.today}>
      <div className="zhaowu-song-comic__copy">
        <p className="zhaowu-song-comic__kicker">{copy.today}</p>
        <h2><span>{stem}</span>{profile.title[locale]}</h2>
        <p>{profile.body[locale]}</p>
        <small>{copy.explain}</small>
      </div>
      <ComicMascot stem={stem} />
    </section>
  );
}

export function SongComicReportInsert({ dayMaster, locale }: { dayMaster: string; locale: Locale }) {
  const stem = dayMaster?.trim()?.[0] || "壬";
  const profile = profileForStem(stem);
  const copy = copyFor(locale);

  return (
    <aside className="zhaowu-song-comic zhaowu-song-comic--report" data-song-comic-report aria-label={copy.report}>
      <div className="zhaowu-song-comic__illustration"><ComicMascot stem={stem} compact /></div>
      <div className="zhaowu-song-comic__copy">
        <p className="zhaowu-song-comic__kicker">{copy.report}</p>
        <h5>{stem} · {profile.title[locale]}</h5>
        <p>{profile.body[locale]}</p>
        <strong>{profile.move[locale]}</strong>
        <small>{copy.boundary}</small>
      </div>
    </aside>
  );
}

export function SongComicShareCard({ dayMaster, locale }: { dayMaster: string; locale: Locale }) {
  const stem = dayMaster?.trim()?.[0] || "壬";
  const profile = profileForStem(stem);
  const copy = copyFor(locale);
  const [status, setStatus] = useState(copy.shareButton);

  const shareText = locale === "en"
    ? `${stem} · ${profile.genre.en}\n${profile.title.en}\n${profile.move.en}\nZHAOWU`
    : `${stem}｜${profile.genre[locale]}\n${profile.title[locale]}\n${profile.move[locale]}\n昭梧 ZHAOWU`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: locale === "en" ? "ZHAOWU · One Comic Frame" : "昭梧 · 命書一格", text: shareText, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        setStatus(copy.copied);
        window.setTimeout(() => setStatus(copy.shareButton), 1600);
      }
    } catch {
      // Cancelling the native share sheet is not an error state for the page.
    }
  }

  return (
    <footer className="zhaowu-song-comic-share" data-song-comic-share>
      <div className="zhaowu-song-comic-share__art"><ComicMascot stem={stem} compact /></div>
      <div>
        <p>{copy.share}</p>
        <strong>{stem} · {profile.genre[locale]}</strong>
        <span>{profile.move[locale]}</span>
      </div>
      <button type="button" onClick={() => void share()}>{status}</button>
    </footer>
  );
}
