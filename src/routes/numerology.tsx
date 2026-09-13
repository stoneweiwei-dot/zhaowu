import { ChartTable } from "@/components/specialist-chart";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import {
  MASTER_NUMBERS,
  NUMEROLOGY_PROFILES as P,
  calculateLifeNumber,
  sumDigits,
  tx,
  t,
} from "@/lib/numerology";
import { readSharedBirthRecord, SHARED_BIRTH_EVENT, type SharedBirthRecord } from "@/lib/shared-birth";

export const Route = createFileRoute("/numerology")({ component: NumerologyPage });

function NumerologyPage(){
  const {locale}=useI18n();
  const [birth,setBirth]=useState<SharedBirthRecord|null>(()=>readSharedBirthRecord());
  useEffect(()=>{ const sync=()=>setBirth(readSharedBirthRecord()); window.addEventListener(SHARED_BIRTH_EVENT,sync); window.addEventListener("storage",sync); return()=>{window.removeEventListener(SHARED_BIRTH_EVENT,sync);window.removeEventListener("storage",sync);}; },[]);
  const result=useMemo(()=>birth?calculateLifeNumber(birth.year,birth.month,birth.day):null,[birth]);
  const c={title:tx(locale,t("生命靈數報告","生命灵数报告","Numerology report")),noBirth:tx(locale,t("還沒有出生年月日資料。先回首頁填寫一次，這裡就會自動生成。","还没有出生年月日资料。先回首页填写一次，这里就会自动生成。","No birth date is available yet. Enter it once on the home page and this report will generate automatically.")),home:tx(locale,t("回首頁填寫","回首页填写","Enter birth date")),master:tx(locale,t("大師數／卓越數","大师数／卓越数","Master Number")),calc:tx(locale,t("計算","计算","Calculation")),who:tx(locale,t("你是怎樣的人","你是怎样的人","How this tends to show up")),talents:tx(locale,t("五項天賦","五项天赋","Five strengths")),challenge:tx(locale,t("容易卡在哪裡","容易卡在哪里","Where it can get stuck")),lesson:tx(locale,t("真正的人生課題","真正的人生课题","Core life lesson")),directions:tx(locale,t("適合發展方向","适合发展方向","Useful directions")),action:tx(locale,t("現實行動","现实行动","Practical action")),knowledge:tx(locale,t("看昭梧觀世錄","看昭梧观世录","Open Zhaowu Notes on Life")),soul:tx(locale,t("靈魂獨白","灵魂独白","Soul monologue")),role:tx(locale,t("人生角色","人生角色","Life role")),words:tx(locale,t("五個核心詞","五个核心词","Five core words")),center:tx(locale,t("中央命象","中央命象","Central pattern"))};
  if(!birth||!result) return <main className="mx-auto max-w-3xl pb-16"><section className="seal-border rounded-2xl bg-cream p-5 sm:p-8"><p className="text-xs tracking-[0.26em] text-cinnabar">ZHAOWU · NUMEROLOGY</p><h1 className="mt-2 font-display text-3xl text-ink">{c.title}</h1><p className="mt-4 text-[15px] leading-7 text-ink-soft">{c.noBirth}</p><Link to="/" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">{c.home}</Link></section></main>;
  const p=P[result.number], isMaster=MASTER_NUMBERS.has(result.number), base=isMaster?sumDigits(result.number):null;
  const calculation=`${result.digits.join("+")}=${result.steps.join(" → ")}`;
  return <main className="mx-auto max-w-4xl space-y-5 pb-16">
    <section className="zw-chart" data-natal-chart="numerology"><ChartTable title={locale === "en" ? "Numerology calculation chart" : "生命靈數 · 命盤計算表"} headers={[locale === "en" ? "Input / step" : "資料／步驟",locale === "en" ? "Value" : "數值"]} rows={[[locale === "en" ? "Birth date" : "出生日期", `${birth.year}-${birth.month}-${birth.day}`],[locale === "en" ? "Birth digits" : "生日數字",result.digits.join(" + ")],...result.steps.map((value,i)=>[`${locale === "en" ? "Reduction" : "加總"} ${i+1}`,value]),[locale === "en" ? "Life number" : "生命靈數",result.number]]}/></section>

    <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8"><p className="text-xs tracking-[0.26em] text-cinnabar">ZHAOWU · NUMEROLOGY</p><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-ink-mute">{tx(locale,t("你的生命靈數","你的生命灵数","Your life number"))}</p><h1 className="mt-1 font-display text-7xl leading-none text-ink sm:text-8xl">{result.number}</h1></div><div className="max-w-sm text-right">{isMaster?<span className="inline-flex rounded-full border border-cinnabar/30 bg-paper px-3 py-1 text-xs font-semibold text-cinnabar">{c.master}</span>:null}<h2 className="mt-2 font-display text-3xl text-ink">{tx(locale,p.name)}</h2>{base?<p className="mt-2 text-sm leading-6 text-ink-soft">{tx(locale,t(`${result.number} 同時要與基礎數 ${base} 一起理解；它不是較高等級，也不是另一個命格。`,`${result.number} 同时要与基础数 ${base} 一起理解；它不是较高等级，也不是另一个命格。`,`${result.number} is read together with its underlying ${base}. It is not a higher rank or a separate destiny.`))}</p>:null}</div></div><p className="mt-6 max-w-2xl text-[15px] leading-7 text-ink-soft">{tx(locale,p.core)}</p><div className="mt-5 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft"><b className="text-ink">{c.calc}：</b>{calculation}</div></section>

    <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8" data-numerology-soul>
      <p className="text-xs tracking-[0.22em] text-cinnabar">{c.soul}</p>
      <blockquote className="mt-4 font-display text-2xl leading-relaxed text-ink">{tx(locale,p.soul)}</blockquote>
    </section>

    <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
      <h3 className="font-display text-xl text-ink">{c.role}</h3>
      <p className="mt-3 text-[15px] leading-7 text-ink-soft">{tx(locale,p.role)}</p>
    </section>

    <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8"><h3 className="font-display text-xl text-ink">{c.words}</h3><div className="mt-4 flex flex-wrap gap-2">{p.words.map(w=><span key={tx(locale,w)} className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink-soft">{tx(locale,w)}</span>)}</div></section>
    <section className="seal-border rounded-2xl bg-cream p-5 text-center sm:p-8"><p className="text-xs tracking-[0.22em] text-ink-mute">{c.center}</p><div className="mx-auto mt-5 flex h-40 w-40 items-center justify-center rounded-full border border-line bg-paper sm:h-48 sm:w-48"><span className="font-display text-7xl text-cinnabar sm:text-8xl">{result.number}</span></div><h3 className="mt-5 font-display text-2xl text-ink">{tx(locale,p.name)}</h3></section>
    <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8"><h3 className="font-display text-xl text-ink">{c.who}</h3><p className="mt-3 text-[15px] leading-7 text-ink-soft">{tx(locale,p.core)}</p></section>
    <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8"><div className="flex items-end justify-between gap-4"><h3 className="font-display text-xl text-ink">{c.talents}</h3><span className="text-xs text-ink-mute sm:hidden">← swipe →</span></div><div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible">{p.gifts.map((gift,i)=><article key={tx(locale,gift.name)} className="min-w-[78%] snap-start rounded-xl border border-line bg-cream p-4 sm:min-w-0"><span className="text-xs text-cinnabar">0{i+1}</span><h4 className="mt-2 font-display text-lg text-ink">{tx(locale,gift.name)}</h4><p className="mt-2 text-sm leading-6 text-ink-soft">{tx(locale,gift.body)}</p></article>)}</div></section>
    <section className="grid gap-4 sm:grid-cols-2"><article className="seal-border rounded-2xl bg-paper p-5 sm:p-7"><h3 className="font-display text-xl text-ink">{c.challenge}</h3><p className="mt-3 text-[15px] leading-7 text-ink-soft">{tx(locale,p.challenge)}</p><ul className="mt-4 space-y-2 text-sm leading-6 text-ink-soft">{p.challenges.map((item)=><li key={tx(locale,item)}>· {tx(locale,item)}</li>)}</ul></article><article className="seal-border rounded-2xl bg-paper p-5 sm:p-7"><h3 className="font-display text-xl text-ink">{c.lesson}</h3><p className="mt-3 text-[15px] leading-7 text-ink-soft">{tx(locale,p.lesson)}</p></article></section>
    <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8"><h3 className="font-display text-xl text-ink">{c.directions}</h3><div className="mt-4 grid gap-3 sm:grid-cols-3">{p.directions.map(d=><div key={tx(locale,d)} className="rounded-xl border border-line bg-cream px-4 py-4 text-sm leading-6 text-ink-soft">{tx(locale,d)}</div>)}</div><p className="mt-3 text-xs leading-6 text-ink-mute">{tx(locale,t("這裡是能力傾向，不是職業命定。","这里是能力倾向，不是职业命定。","These are ability tendencies, not a fixed career prescription."))}</p></section>
    <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8"><h3 className="font-display text-xl text-ink">{c.action}</h3><p className="mt-3 text-[15px] leading-7 text-ink-soft">{tx(locale,p.action)}</p><div className="mt-5 border-t border-line pt-5"><p className="font-display text-xl leading-8 text-ink">{tx(locale,t("數字不是人生等級；真正重要的是你怎麼使用自己的特質。","数字不是人生等级；真正重要的是你怎么使用自己的特质。","A number is not a life rank. What matters is how you use the traits it describes."))}</p></div></section>
    <div className="flex flex-wrap items-center justify-between gap-3 px-1"><p className="max-w-2xl text-xs leading-6 text-ink-mute">{tx(locale,t("生命靈數是象徵性的自我探索工具，不是命運定論，也不取代昭梧的子平八字主判。","生命灵数是象征性的自我探索工具，不是命运定论，也不取代昭梧的子平八字主判。","Numerology is a symbolic self-reflection tool. It is not a fixed prediction and does not replace Zhaowu's BaZi judgement."))}</p><Link to="/knowledge" className="inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink-soft">{c.knowledge}</Link></div>
  </main>;
}
