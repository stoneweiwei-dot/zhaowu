import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { galleryPublicUrl, listPublicGalleryAssets, type GalleryAsset } from "@/lib/gallery-assets";
import { isPublicAtlasAsset } from "@/lib/gallery-groups";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const DAY_MS = 86_400_000;
const REFERENCE_UTC = Date.UTC(2024, 1, 10);

function ganzhiForDay(date: Date) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = Math.round((utc - REFERENCE_UTC) / DAY_MS);
  const index = ((40 + offset) % 60 + 60) % 60;
  return `${STEMS[index % 10]}${BRANCHES[index % 12]}`;
}

function weekdayLabel(date: Date, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (locale === "en") return new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(date);
  return ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][date.getDay()];
}

function monthDayLabel(date: Date, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (locale === "en") return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long" }).format(date);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function useLocalDay() {
  const [now, setNow] = useState(() => new Date());
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  useEffect(() => {
    const current = new Date();
    const next = new Date(current);
    next.setHours(24, 0, 0, 80);
    const timer = window.setTimeout(() => setNow(new Date()), Math.max(1_000, next.getTime() - current.getTime()));
    return () => window.clearTimeout(timer);
  }, [dayKey]);
  return now;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const SLIPS = {
  "zh-Hant": [
    ["靜心守中", "今日不必向外追太多答案。先把最重要的一件事守住，雜音自然會退。", "關係裡少猜一步，事情上慢半拍確認；你真正要保留的是自己的節奏。"],
    ["應緣而啟", "有些門不是硬推開的。今天適合看清哪一個回應是真正的邀請，再決定是否往前。", "先觀察、再靠近；有回聲的地方才值得投入更多心力。"],
    ["先定後行", "現在最重要的不是速度，而是把方向定清楚。方向一穩，後面的動作自然會快。", "涉及承諾、金錢或關係時，先確認核心條件，不要被一時情緒帶走。"],
    ["留白養氣", "今天的空白不是浪費，而是在替下一步保留判斷力。少安排一點，反而更容易抓到真正重要的訊號。", "把能量留給需要你親自決定的事，其餘能延後的就延後。"],
    ["順勢收心", "外面的事情可以很多，心裡只留一條主線。當你不再同時抓住所有答案，路會變清楚。", "今天宜完成、整理、回收；不宜為了證明自己而增加新的負擔。"],
  ],
  "zh-Hans": [
    ["静心守中", "今天不必向外追太多答案。先把最重要的一件事守住，杂音自然会退。", "关系里少猜一步，事情上慢半拍确认；你真正要保留的是自己的节奏。"],
    ["应缘而启", "有些门不是硬推开的。今天适合看清哪一个回应是真正的邀请，再决定是否往前。", "先观察、再靠近；有回声的地方才值得投入更多心力。"],
    ["先定后行", "现在最重要的不是速度，而是把方向定清楚。方向一稳，后面的动作自然会快。", "涉及承诺、金钱或关系时，先确认核心条件，不要被一时情绪带走。"],
    ["留白养气", "今天的空白不是浪费，而是在替下一步保留判断力。少安排一点，反而更容易抓到真正重要的讯号。", "把能量留给需要你亲自决定的事，其余能延后的就延后。"],
    ["顺势收心", "外面的事情可以很多，心里只留一条主线。当你不再同时抓住所有答案，路会变清楚。", "今天宜完成、整理、回收；不宜为了证明自己而增加新的负担。"],
  ],
  en: [
    ["Hold Your Centre", "You do not need more answers today. Protect the one thing that matters most and let the noise fall away.", "In relationships, guess less. In decisions, confirm first. Keep your own pace."],
    ["Open With Response", "Some doors are not meant to be forced. Notice what is genuinely responding to you before you invest more.", "Observe first, then move closer. Put energy where there is a real answer back."],
    ["Set Direction First", "Speed is not the priority today. Once the direction is clear, movement becomes much easier.", "For money, commitments or relationships, confirm the core conditions before acting on emotion."],
    ["Leave Some Space", "Empty space is useful today. Doing slightly less can preserve the judgement you need for the next move.", "Keep your capacity for decisions only you can make; postpone what does not need to happen now."],
    ["Gather Your Focus", "There can be many things outside you while you keep only one main line inside. Clarity comes from not gripping every answer at once.", "Finish, organise and close loops today. Do not add weight just to prove something."],
  ],
} as const;

export function DailyAlmanacWidget() {
  const { locale } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const now = useLocalDay();
  const [slipOpen, setSlipOpen] = useState(false);
  const [slipMessage, setSlipMessage] = useState<string | null>(null);
  const [asset, setAsset] = useState<GalleryAsset | null>(null);
  const [loadingSlip, setLoadingSlip] = useState(false);

  const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const data = useMemo(() => {
    const day = ganzhiForDay(now);
    const branch = day[1];
    const lowEnergy = ["子", "丑", "亥", "未"].includes(branch);
    const highMotion = ["寅", "巳", "申", "午"].includes(branch);
    const tone = lowEnergy ? "low" : highMotion ? "motion" : "steady";
    const copy = locale === "en" ? {
      eyebrow: "TODAY · ALMANAC", title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
      energy: lowEnergy ? "Lower" : highMotion ? "Active" : "Steady", energyLabel: "Today’s rhythm",
      headline: lowEnergy ? "Keep the day light and deliberate" : highMotion ? "Move, but do not scatter" : "Keep one clear centre",
      lead: lowEnergy ? "Protect your capacity first; fewer well-finished things are enough today." : highMotion ? "Momentum helps when it has a target. Finish before opening another front." : "A steady day works best when you keep priorities simple and leave some margin.",
      good: lowEnergy ? ["finish one important task", "eat on time", "tidy one small area"] : highMotion ? ["move one key task forward", "speak clearly", "finish before adding more"] : ["focus on the core task", "keep plans simple", "leave buffer time"],
      avoid: lowEnergy ? ["overcommitting", "late-night decisions", "absorbing other people’s urgency"] : highMotion ? ["starting too many things", "arguing from impulse", "rushing commitments"] : ["constant switching", "needless comparison", "overexplaining"],
      goodLabel: "Good for", avoidLabel: "Avoid", goodRoman: "YI", avoidRoman: "JI", foot: "Daily spirit slip",
      note: `Day marker ${day} · light daily guidance based on your local date.`, dayMark: `${day} day · daily reference`,
      needLogin: "Sign in first to draw your daily spirit slip.", needBirth: "Complete your birth details on Zhaowu first, then return here to draw your personalised daily slip.",
      slipTitle: "Today’s Spirit Slip", basis: "Based on your saved birth profile + today’s rhythm", close: "Close", goLogin: "Sign in", goBirth: "Add birth details",
    } : locale === "zh-Hans" ? {
      eyebrow: "今日黄历", title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
      energy: lowEnergy ? "偏低" : highMotion ? "偏动" : "平稳", energyLabel: "今日能量",
      headline: lowEnergy ? "把今天过得轻一点、稳一点" : highMotion ? "可以推进，但不要把自己打散" : "守住一个中心就够了",
      lead: lowEnergy ? "先保护自己的容量，今天少做一点、做完整一点就够。" : highMotion ? "今天有推进力，但要给它一个明确方向；做完一件，再开下一件。" : "平稳的日子最适合把优先级收窄，也给自己留一点余量。",
      good: lowEnergy ? ["完成一件重要的事", "按时吃饭", "整理一个小区域"] : highMotion ? ["推进一个关键任务", "把话说清楚", "做完再加下一件"] : ["专注核心任务", "计划简单一点", "给自己留余量"],
      avoid: lowEnergy ? ["过度答应别人", "深夜做重大决定", "替别人承接焦虑"] : highMotion ? ["同时开太多任务", "冲动争辩", "匆忙承诺"] : ["反复切换任务", "无谓比较", "过度解释"],
      goodLabel: "宜", avoidLabel: "忌", goodRoman: "yí", avoidRoman: "jì", foot: "今日灵签",
      note: `今日日柱提示 ${day} · 按你当地日期给轻量日节奏提示。`, dayMark: `${day}日 · 日常参考`,
      needLogin: "先登入，才可以领取你的今日灵签。", needBirth: "你还没有保存出生资料。先在昭梧输入并保存资料，再回来领取个人灵签。",
      slipTitle: "今日灵签", basis: "依据你已保存的命盘资料 × 今日节奏", close: "收起", goLogin: "去登入", goBirth: "去填写资料",
    } : {
      eyebrow: "今日黃曆", title: `${weekdayLabel(now, locale)} · ${monthDayLabel(now, locale)}`,
      energy: lowEnergy ? "偏低" : highMotion ? "偏動" : "平穩", energyLabel: "今日能量",
      headline: lowEnergy ? "把今天過得輕一點、穩一點" : highMotion ? "可以推進，但不要把自己打散" : "守住一個中心就夠了",
      lead: lowEnergy ? "先保護自己的容量，今天少做一點、做完整一點就夠。" : highMotion ? "今天有推進力，但要給它一個明確方向；做完一件，再開下一件。" : "平穩的日子最適合把優先級收窄，也給自己留一點餘量。",
      good: lowEnergy ? ["完成一件重要的事", "按時吃飯", "整理一個小區域"] : highMotion ? ["推進一個關鍵任務", "把話說清楚", "做完再加下一件"] : ["專注核心任務", "計畫簡單一點", "給自己留餘量"],
      avoid: lowEnergy ? ["過度答應別人", "深夜做重大決定", "替別人承接焦慮"] : highMotion ? ["同時開太多任務", "衝動爭辯", "匆忙承諾"] : ["反覆切換任務", "無謂比較", "過度解釋"],
      goodLabel: "宜", avoidLabel: "忌", goodRoman: "yí", avoidRoman: "jì", foot: "今日靈籤",
      note: `今日日柱提示 ${day} · 按你當地日期給輕量日節奏提示。`, dayMark: `${day}日 · 日常參考`,
      needLogin: "先登入，才可以領取你的今日靈籤。", needBirth: "你還沒有保存出生資料。先在昭梧輸入並保存資料，再回來領取個人靈籤。",
      slipTitle: "今日靈籤", basis: "依據你已保存的命盤資料 × 今日節奏", close: "收起", goLogin: "去登入", goBirth: "去填寫資料",
    };
    return { ...copy, tone, day };
  }, [locale, now]);

  const slip = useMemo(() => {
    const seed = stableHash(`${user?.id ?? "guest"}|${JSON.stringify(user?.birthData ?? {})}|${dayKey}`);
    return SLIPS[locale][seed % SLIPS[locale].length];
  }, [dayKey, locale, user?.birthData, user?.id]);

  async function drawSlip() {
    if (isPending) return;
    if (!user) {
      setSlipOpen(false);
      setSlipMessage(data.needLogin);
      return;
    }
    if (!user.birthData || Object.keys(user.birthData).length === 0) {
      setSlipOpen(false);
      setSlipMessage(data.needBirth);
      return;
    }
    setSlipMessage(null);
    setLoadingSlip(true);
    try {
      if (!asset) {
        const rows = (await listPublicGalleryAssets("visual-library")).filter(isPublicAtlasAsset);
        if (rows.length) {
          const seed = stableHash(`${user.id}|${JSON.stringify(user.birthData)}|${dayKey}|image`);
          setAsset(rows[seed % rows.length]);
        }
      }
      setSlipOpen(true);
    } finally {
      setLoadingSlip(false);
    }
  }

  return (
    <>
      <section id="daily-almanac" className="zhaowu-daily-almanac" data-tone={data.tone} aria-label={data.eyebrow}>
        <span className="zhaowu-daily-watermark" aria-hidden>{now.getDate()}</span>
        <div className="zhaowu-daily-top"><div><p className="zhaowu-daily-eyebrow">{data.eyebrow}</p><p className="zhaowu-daily-date">{data.title}</p></div><div className="zhaowu-daily-energy"><span>{data.energyLabel}</span><strong>{data.energy}</strong></div></div>
        <div className="zhaowu-daily-main"><p className="zhaowu-daily-daymark">{data.dayMark}</p><h2 className="zhaowu-daily-headline">{data.headline}</h2><p className="zhaowu-daily-lead">{data.lead}</p></div>
        <div className="zhaowu-daily-pairs"><section aria-label={data.goodLabel}><p className="zhaowu-daily-pair-title"><small>{data.goodRoman}</small><b>{data.goodLabel}</b></p><ul className="zhaowu-daily-list">{data.good.map((item) => <li key={item}>{item}</li>)}</ul></section><section aria-label={data.avoidLabel}><p className="zhaowu-daily-pair-title"><small>{data.avoidRoman}</small><b>{data.avoidLabel}</b></p><ul className="zhaowu-daily-list">{data.avoid.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
        <footer className="zhaowu-daily-footer"><p className="zhaowu-daily-note">{data.note}</p><button type="button" className="zhaowu-daily-cta" onClick={() => void drawSlip()} disabled={loadingSlip || isPending} aria-label={data.foot}><span>{loadingSlip ? "…" : data.foot}</span><b aria-hidden>→</b></button></footer>
        {slipMessage ? <div className="zhaowu-slip-gate"><p>{slipMessage}</p><a href={!user ? "/login" : "#analysisForm"}>{!user ? data.goLogin : data.goBirth} →</a></div> : null}
      </section>

      {slipOpen ? (
        <section className="zhaowu-spirit-slip" aria-label={data.slipTitle}>
          <button type="button" className="zhaowu-spirit-slip-close" onClick={() => setSlipOpen(false)} aria-label={data.close}>×</button>
          {asset ? <figure className="zhaowu-spirit-slip-art"><img src={galleryPublicUrl(asset.storage_path, asset.bucket_id)} alt={asset.title || data.slipTitle} /></figure> : <div className="zhaowu-spirit-slip-art is-empty" aria-hidden>昭梧</div>}
          <p className="zhaowu-spirit-slip-kicker">{data.slipTitle}</p>
          <h2>{slip[0]}</h2>
          <div className="zhaowu-spirit-slip-copy"><p><strong>{slip[1]}</strong></p><p>{slip[2]}</p></div>
          <div className="zhaowu-spirit-slip-rule" aria-hidden />
          <p className="zhaowu-spirit-slip-basis">{data.basis} · {data.day}</p>
          <p className="zhaowu-spirit-slip-mark">STONE 原創</p>
        </section>
      ) : null}
    </>
  );
}
