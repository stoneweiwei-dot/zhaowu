import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/knowledge/nine-heavens-lamps")({ component: LampsParable });
function t(l: Locale, hant: string, hans: string, en: string) { return l === "en" ? en : l === "zh-Hans" ? hans : hant; }
const scenes = [
  {img:"/articles/lamps-parable-01.svg",title:["青燈相續","青灯相续","The next flame"],text:["少年守著青燈七日，燈滅後看見另一盞新燈。他問原來的火去了哪裡；老人回答，新火依舊火留下的條件而生，卻不是那一團不變的火。","少年守着青灯七日，灯灭后看见另一盏新灯。他问原来的火去了哪里；老人回答，新火依旧火留下的条件而生，却不是那一团不变的火。","A novice watches a lamp go out. Another flame appears, shaped by earlier conditions but not identical to the old fire."]},
  {img:"/articles/lamps-parable-02.svg",title:["黑焰與白燈","黑焰与白灯","The dark and pale lamps"],text:["他發現曾經灼人的黑焰，與今日溫柔的白燈存在因緣關係。承接不等於重複，也不能據某人眼前的苦難，反推他必定有前世罪業。","他发现曾经灼人的黑焰，与今日温柔的白灯存在因缘关系。承接不等于重复，也不能据某人眼前的苦难，反推他必定有前世罪业。","The gentle white lamp has a causal history involving a destructive dark flame. Continuity is not sameness; suffering does not prove past wrongdoing."]},
  {img:"/articles/lamps-parable-03.svg",title:["風與燈芯","风与灯芯","The wind and the wick"],text:["老人讓少年觀察燈火：風、燈芯、燈油、燈罩與人的動作，共同決定它如何燃燒。人的經歷同樣不能縮減成單一業因。","老人让少年观察灯火：风、灯芯、灯油、灯罩与人的动作，共同决定它如何燃烧。人的经历同样不能缩减成单一业因。","Wind, oil, wick, shelter and human care all affect the flame. Human experience likewise has multiple conditions, not a single moral cause."]},
  {img:"/articles/lamps-parable-04.svg",title:["無人掌燈","无人掌灯","No eternal lamp-keeper"],text:["女子守著燈，恐懼它終將熄滅。當她開始照料而不再要求永遠佔有，焦慮才安靜下來。少年終於明白：不必先找到永恆不變的「我」，才能開始自由。","女子守着灯，恐惧它终将熄灭。当她开始照料而不再要求永远占有，焦虑才安静下来。少年终于明白：不必先找到永恒不变的“我”，才能开始自由。","A visitor tends the flame without demanding possession forever. The novice sees that freedom need not depend on an unchanging owner of experience."]}
] as const;
function LampsParable() {
 const {locale}=useI18n();
 const i=locale==="en"?2:locale==="zh-Hans"?1:0;
 return <main className="mx-auto max-w-4xl space-y-6 pb-16">
  <article className="seal-border rounded-2xl bg-paper px-5 py-7 sm:px-8">
   <p className="text-xs tracking-[.20em] text-cinnabar">ZHAOWU · STONE 原創</p>
   <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">{t(locale,"九重天外，無人掌燈","九重天外，无人掌灯","Beyond Nine Heavens, No Keeper of the Lamp")}</h1>
   <p className="mt-4 text-base leading-8 text-ink-soft">{t(locale,"四幅獨立圖境，從燈火故事理解緣起、業果、無我與放下執取。這是借佛教思想創作的寓言，不冒充佛經原文。","四幅独立图境，从灯火故事理解缘起、业果、无我与放下执取。这是借佛教思想创作的寓言，不冒充佛经原文。","Four original visual parables about dependent origination, ethical causality, non-self and the release of grasping. A literary interpretation, not a canonical Buddhist text.")}</p>
  </article>
  {scenes.map((s,index)=><section className="seal-border overflow-hidden rounded-2xl bg-paper" key={s.img}><img className="mx-auto block h-auto w-full max-w-[540px]" width={1080} height={1920} loading={index===0?"eager":"lazy"} decoding="async" src={s.img} alt={s.title[i]+" — "+s.text[i]}/><div className="p-5 sm:p-8"><h2 className="font-display text-2xl text-ink">{String(index+1).padStart(2,"0")} · {s.title[i]}</h2><p className="mt-3 text-base leading-8 text-ink-soft">{s.text[i]}</p></div></section>)}
  <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8"><h2 className="font-display text-2xl text-ink">{t(locale,"故事所指的哲學","故事所指的哲学","The philosophy behind the story")}</h2>
   <p className="mt-4 leading-8 text-ink-soft">{t(locale,"佛教緣起論描述依條件而生滅的現象；無我論拒絕一個獨立、永恆不變的自我。業是有意志的行為及其因果作用，但遭遇不宜一概視為前世的善惡報償。中觀學派進一步以緣起論證無自性；空不是虛無，而是條件性的存在。","佛教缘起论描述依条件而生灭的现象；无我论拒绝一个独立、永恒不变的自我。业是有意志的行为及其因果作用，但遭遇不宜一概视为前世的善恶报偿。中观学派进一步以缘起论证无自性；空不是虚无，而是条件性的存在。","Dependent origination explains how phenomena arise and cease through conditions; non-self denies an independent immutable ego. Karma concerns intentional action, but suffering cannot simply be read as punishment for past lives. Madhyamaka further links dependent origination to emptiness, which does not mean nothing exists.")}</p>
   <p className="mt-4 leading-8 text-ink-soft">{t(locale,"參考脈絡：巴利《相應部》SN 12.17、12.46 的緣起與因果討論；龍樹《中論》第二十四品。輪迴及跨世業果屬宗教哲學主張，不能寫成現代科學已證實的事實。","参考脉络：巴利《相应部》SN 12.17、12.46 的缘起与因果讨论；龙树《中论》第二十四品。轮回及跨世业果属宗教哲学主张，不能写成现代科学已证实的事实。","Background: Samyutta Nikaya SN 12.17 and 12.46 on causality, and Nagarjuna's Mulamadhyamakakarika chapter 24. Rebirth across lives remains a religious-philosophical claim, not an independently verified scientific finding.")}</p>
  </section>
  <Link to="/knowledge" className="block px-4 py-3 underline underline-offset-4">{t(locale,"返回昭梧知識庫","返回昭梧知识库","Back to ZHAOWU Knowledge")}</Link>
 </main>;
}