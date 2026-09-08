import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";
import { readSharedBirthRecord, SHARED_BIRTH_EVENT, type SharedBirthRecord } from "@/lib/shared-birth";

export const Route = createFileRoute("/numerology")({ component: NumerologyPage });

type LifeNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

type Profile = {
  name: string;
  keywords: string;
  core: string;
  strength: string;
  challenge: string;
  action: string;
};

const MASTER_NUMBERS = new Set<LifeNumber>([11, 22, 33]);

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function sumDigits(value: number) {
  return String(Math.abs(value)).split("").reduce((sum, digit) => sum + Number(digit), 0);
}

function calculateLifeNumber(year: number, month: number, day: number) {
  const digits = `${String(year).padStart(4, "0")}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`.split("").map(Number);
  const steps: number[] = [digits.reduce((sum, digit) => sum + digit, 0)];
  let value = steps[0];
  while (value > 9 && value !== 11 && value !== 22 && value !== 33) {
    value = sumDigits(value);
    steps.push(value);
  }
  return { number: value as LifeNumber, digits, steps };
}

function profile(locale: Locale, number: LifeNumber): Profile {
  const p = (hant: Profile, hans: Profile, en: Profile) => locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
  const profiles: Record<LifeNumber, Profile> = {
    1: p(
      { name: "開創者", keywords: "自主・決斷・起步", core: "你的數字重點在「自己先動」。比起等待共識，你更容易在有主導權時進入狀態。", strength: "敢開始、能獨立判斷、遇到空白時能先走出第一步。", challenge: "過度時會變成什麼都自己扛，或把不同意見理解成阻礙。", action: "保留主導權，但把真正需要合作的部分說清楚。" },
      { name: "开创者", keywords: "自主・决断・起步", core: "你的数字重点在「自己先动」。比起等待共识，你更容易在有主导权时进入状态。", strength: "敢开始、能独立判断、遇到空白时能先走出第一步。", challenge: "过度时会变成什么都自己扛，或把不同意见理解成阻碍。", action: "保留主导权，但把真正需要合作的部分说清楚。" },
      { name: "Pioneer", keywords: "independence · initiative · decisions", core: "Your pattern is strongest when you can initiate rather than wait for consensus.", strength: "Starting, independent judgement and moving first when the path is unclear.", challenge: "Overuse can become carrying everything alone or treating disagreement as obstruction.", action: "Keep ownership of the direction, but make the parts that genuinely need collaboration explicit." },
    ),
    2: p(
      { name: "協調者", keywords: "感受・合作・平衡", core: "你很容易先讀到人與人之間的氣氛，再決定怎麼推進事情。", strength: "察覺細節、維持合作、理解雙方真正介意的地方。", challenge: "太在意和諧時，容易延後表態或把自己的需要放到最後。", action: "先說清楚自己的底線，再談配合。" },
      { name: "协调者", keywords: "感受・合作・平衡", core: "你很容易先读到人与人之间的气氛，再决定怎么推进事情。", strength: "察觉细节、维持合作、理解双方真正介意的地方。", challenge: "太在意和谐时，容易延后表态或把自己的需要放到最后。", action: "先说清楚自己的底线，再谈配合。" },
      { name: "Diplomat", keywords: "sensitivity · cooperation · balance", core: "You tend to read the atmosphere between people before deciding how to move.", strength: "Noticing nuance, maintaining cooperation and understanding what each side actually cares about.", challenge: "Protecting harmony can delay your own position or push your needs to the end.", action: "State your boundary first, then negotiate the compromise." },
    ),
    3: p(
      { name: "表達者", keywords: "創意・語言・感染力", core: "你的能量通常要透過表達才會真正流動，想法放在心裡太久反而容易失去力道。", strength: "創意、溝通、把複雜內容說得有感覺。", challenge: "容易分心，或因為想保持輕鬆而避開真正需要處理的沉重問題。", action: "把靈感變成固定輸出，而不是只等狀態來。" },
      { name: "表达者", keywords: "创意・语言・感染力", core: "你的能量通常要通过表达才会真正流动，想法放在心里太久反而容易失去力道。", strength: "创意、沟通、把复杂内容说得有感觉。", challenge: "容易分心，或因为想保持轻松而避开真正需要处理的沉重问题。", action: "把灵感变成固定输出，而不是只等状态来。" },
      { name: "Communicator", keywords: "creativity · expression · influence", core: "Your energy tends to move through expression. Ideas lose force when they stay internal for too long.", strength: "Creativity, communication and making complex things emotionally clear.", challenge: "Distraction or using lightness to avoid the heavier issue that still needs attention.", action: "Turn inspiration into a repeatable output habit instead of waiting for the mood." },
    ),
    4: p(
      { name: "建造者", keywords: "秩序・穩定・落地", core: "你重視可執行、可持續、能真正站得住的東西。", strength: "規劃、耐性、把混亂整理成可重複的流程。", challenge: "過度追求穩定時，容易卡在既定方法，不願意太早調整。", action: "保留結構，但替變化預留空間。" },
      { name: "建造者", keywords: "秩序・稳定・落地", core: "你重视可执行、可持续、能真正站得住的东西。", strength: "规划、耐性、把混乱整理成可重复的流程。", challenge: "过度追求稳定时，容易卡在既定方法，不愿意太早调整。", action: "保留结构，但替变化预留空间。" },
      { name: "Builder", keywords: "structure · stability · follow-through", core: "You value things that are workable, durable and able to stand up in real life.", strength: "Planning, patience and turning disorder into repeatable systems.", challenge: "A strong need for stability can keep you attached to a method after the situation has changed.", action: "Keep the structure, but deliberately leave room for revision." },
    ),
    5: p(
      { name: "探索者", keywords: "自由・變化・體驗", core: "你透過移動、變化與親身經驗理解世界，很難長期忍受完全沒有選擇的狀態。", strength: "適應快、敢試、能在變局裡找到新路。", challenge: "容易因為厭倦而過早離開，或同時打開太多方向。", action: "自由不是一直換路，而是知道哪條路值得你留下。" },
      { name: "探索者", keywords: "自由・变化・体验", core: "你通过移动、变化与亲身经验理解世界，很难长期忍受完全没有选择的状态。", strength: "适应快、敢试、能在变局里找到新路。", challenge: "容易因为厌倦而过早离开，或同时打开太多方向。", action: "自由不是一直换路，而是知道哪条路值得你留下。" },
      { name: "Explorer", keywords: "freedom · change · experience", core: "You understand the world through movement, change and direct experience, and dislike being trapped without options.", strength: "Fast adaptation, experimentation and finding new routes in changing conditions.", challenge: "Boredom can make you leave too early or open too many directions at once.", action: "Freedom is not constant switching. It is knowing which path is worth staying with." },
    ),
    6: p(
      { name: "守護者", keywords: "責任・照顧・美感", core: "你很容易把「讓事情與人變得更好」當成自己的責任。", strength: "照顧、審美、維持品質與關係中的可靠感。", challenge: "責任感過量時，會替別人收拾太多，最後自己累。", action: "幫助別人之前，先確認這件事是不是你的責任。" },
      { name: "守护者", keywords: "责任・照顾・美感", core: "你很容易把「让事情与人变得更好」当成自己的责任。", strength: "照顾、审美、维持品质与关系中的可靠感。", challenge: "责任感过量时，会替别人收拾太多，最后自己累。", action: "帮助别人之前，先确认这件事是不是你的责任。" },
      { name: "Guardian", keywords: "responsibility · care · aesthetics", core: "You easily take responsibility for making people, relationships or environments better.", strength: "Care, aesthetic judgement, quality and reliability in relationships.", challenge: "Too much responsibility turns into cleaning up problems that were never yours to carry.", action: "Before helping, check whether the responsibility is actually yours." },
    ),
    7: p(
      { name: "探究者", keywords: "分析・深度・內省", core: "你不太滿足於表面答案，通常要自己理解到底層邏輯才會真正相信。", strength: "研究、分析、獨立思考、在複雜資訊裡找本質。", challenge: "想得太深時容易抽離現實，或因為標準太高而一直不下判斷。", action: "給研究設定截止點，之後把理解轉成一次具體決定。" },
      { name: "探究者", keywords: "分析・深度・内省", core: "你不太满足于表面答案，通常要自己理解到底层逻辑才会真正相信。", strength: "研究、分析、独立思考、在复杂信息里找本质。", challenge: "想得太深时容易抽离现实，或因为标准太高而一直不下判断。", action: "给研究设置截止点，之后把理解转成一次具体决定。" },
      { name: "Seeker", keywords: "analysis · depth · reflection", core: "Surface answers rarely satisfy you. You usually need to understand the underlying logic before you trust it.", strength: "Research, analysis, independent thought and finding the core inside complex information.", challenge: "Depth can become detachment or endless analysis when the standard for certainty is too high.", action: "Give research a deadline, then convert what you know into one concrete decision." },
    ),
    8: p(
      { name: "掌舵者", keywords: "成果・資源・權責", core: "你對結果、效率、資源配置與控制感通常比一般人更敏感。", strength: "管理、決策、談判、把資源集中到真正有回報的地方。", challenge: "過度時會把價值只看成成果，或讓控制取代信任。", action: "用權責創造成果，但不要讓成果成為唯一的自我評價。" },
      { name: "掌舵者", keywords: "成果・资源・权责", core: "你对结果、效率、资源配置与控制感通常比一般人更敏感。", strength: "管理、决策、谈判、把资源集中到真正有回报的地方。", challenge: "过度时会把价值只看成成果，或让控制取代信任。", action: "用权责创造成果，但不要让成果成为唯一的自我评价。" },
      { name: "Executive", keywords: "results · resources · authority", core: "You are often highly aware of outcomes, efficiency, resource allocation and control.", strength: "Management, decisions, negotiation and concentrating resources where they matter.", challenge: "Overuse can reduce value to results alone or replace trust with control.", action: "Use authority to create outcomes without making outcomes your only measure of self-worth." },
    ),
    9: p(
      { name: "理想者", keywords: "同理・視野・完成", core: "你容易把個人經驗放進更大的背景裡看，對人性、意義與整體影響較敏感。", strength: "同理、整合、看大局、替一段歷程收尾。", challenge: "容易對人或理想投入過多，該結束時仍捨不得放。", action: "保留善意，但接受有些完成就是放手。" },
      { name: "理想者", keywords: "同理・视野・完成", core: "你容易把个人经验放进更大的背景里看，对人性、意义与整体影响较敏感。", strength: "同理、整合、看大局、替一段历程收尾。", challenge: "容易对人或理想投入过多，该结束时仍舍不得放。", action: "保留善意，但接受有些完成就是放手。" },
      { name: "Humanitarian", keywords: "empathy · perspective · completion", core: "You often place personal experience inside a bigger picture and notice meaning, humanity and wider impact.", strength: "Empathy, integration, broad perspective and bringing a chapter to completion.", challenge: "You can remain invested in a person or ideal after the cycle has already ended.", action: "Keep the goodwill, but accept that some forms of completion require letting go." },
    ),
    11: p(
      { name: "啟蒙者", keywords: "直覺・靈感・洞察・創造", core: "11 的重點是高敏銳度。你更容易捕捉氣氛、細微變化與尚未成形的可能。", strength: "直覺、創造力、洞察與啟發他人的能力。", challenge: "感受得越多，也越容易過度思考、緊張或懷疑自己。", action: "相信直覺，但建立情緒邊界，把敏銳轉成具體作品或決定。" },
      { name: "启蒙者", keywords: "直觉・灵感・洞察・创造", core: "11 的重点是高敏锐度。你更容易捕捉气氛、细微变化与尚未成形的可能。", strength: "直觉、创造力、洞察与启发他人的能力。", challenge: "感受得越多，也越容易过度思考、紧张或怀疑自己。", action: "相信直觉，但建立情绪边界，把敏锐转成具体作品或决定。" },
      { name: "The Inspirer", keywords: "intuition · inspiration · insight · creativity", core: "11 points to heightened sensitivity. You may notice atmosphere, subtle changes and possibilities before they are fully formed.", strength: "Intuition, creativity, insight and the ability to inspire others.", challenge: "Greater sensitivity can also mean overthinking, tension and self-doubt.", action: "Trust the signal, build emotional boundaries, then turn sensitivity into a concrete work or decision." },
    ),
    22: p(
      { name: "建造者", keywords: "願景・組織・執行・落地", core: "22 的核心不是只會做大夢，而是把大願景拆成能落地的結構。", strength: "長線視野、組織能力、執行力與把抽象概念變成現實。", challenge: "目標太大、標準太高時，反而會因怕失敗而拖延。", action: "不要只看終點。拆成階段，一步一步把夢想蓋成現實。" },
      { name: "建造者", keywords: "愿景・组织・执行・落地", core: "22 的核心不是只会做大梦，而是把大愿景拆成能落地的结构。", strength: "长线视野、组织能力、执行力与把抽象概念变成现实。", challenge: "目标太大、标准太高时，反而会因怕失败而拖延。", action: "不要只看终点。拆成阶段，一步一步把梦想盖成现实。" },
      { name: "The Builder", keywords: "vision · organisation · execution · building", core: "22 is less about dreaming big than about turning a large vision into a workable structure.", strength: "Long-range vision, organisation, execution and making abstract ideas real.", challenge: "When the plan feels enormous and standards are high, fear of failure can become delay.", action: "Stop staring only at the finish line. Break the vision into stages and build it step by step." },
    ),
    33: p(
      { name: "療癒者／導師", keywords: "愛・同理・奉獻・療癒", core: "33 的核心是高度關懷與影響力。你容易察覺別人的需要，也容易自然成為傾聽或引導的人。", strength: "同理、表達、照顧、教導與讓別人感到被理解。", challenge: "最容易出現的是替別人承擔太多，最後耗盡自己。", action: "愛別人不等於犧牲自己。先保留自己的能量，再去支持別人。" },
      { name: "疗愈者／导师", keywords: "爱・同理・奉献・疗愈", core: "33 的核心是高度关怀与影响力。你容易察觉别人的需要，也容易自然成为倾听或引导的人。", strength: "同理、表达、照顾、教导与让别人感到被理解。", challenge: "最容易出现的是替别人承担太多，最后耗尽自己。", action: "爱别人不等于牺牲自己。先保留自己的能量，再去支持别人。" },
      { name: "The Healer / Guide", keywords: "love · empathy · service · healing", core: "33 centres on care and influence. You may notice what others need and naturally become a listener, teacher or guide.", strength: "Empathy, expression, care, teaching and making people feel understood.", challenge: "The common shadow is carrying too much for other people until you are depleted.", action: "Caring does not require self-sacrifice. Protect your own energy before supporting everyone else." },
    ),
  };
  return profiles[number];
}

function NumerologyPage() {
  const { locale } = useI18n();
  const [birth, setBirth] = useState<SharedBirthRecord | null>(() => readSharedBirthRecord());

  useEffect(() => {
    const sync = () => setBirth(readSharedBirthRecord());
    window.addEventListener(SHARED_BIRTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHARED_BIRTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const result = useMemo(() => birth ? calculateLifeNumber(birth.year, birth.month, birth.day) : null, [birth]);
  const copy = useMemo(() => ({
    kicker: tr(locale, "生命靈數", "生命灵数", "NUMEROLOGY"),
    title: tr(locale, "生命靈數報告", "生命灵数报告", "Numerology report"),
    intro: tr(locale, "直接用你已填寫的出生年月日計算，不需要再輸入一次。", "直接用你已填写的出生年月日计算，不需要再输入一次。", "Calculated automatically from the birth date you already entered."),
    noBirth: tr(locale, "還沒有出生年月日資料。先回首頁填寫一次，這裡就會自動生成。", "还没有出生年月日资料。先回首页填写一次，这里就会自动生成。", "No birth date is available yet. Enter it once on the home page and this report will generate automatically."),
    home: tr(locale, "回首頁填寫", "回首页填写", "Enter birth date"),
    yourNumber: tr(locale, "你的生命靈數", "你的生命灵数", "Your life number"),
    master: tr(locale, "大師數／卓越數", "大师数／卓越数", "Master Number"),
    calculation: tr(locale, "計算", "计算", "Calculation"),
    strength: tr(locale, "強項", "强项", "Strength"),
    challenge: tr(locale, "課題", "课题", "Challenge"),
    action: tr(locale, "怎麼用這個數字", "怎么用这个数字", "How to use it"),
    note: tr(locale, "生命靈數屬於象徵性的自我探索工具，不是命運定論，也不取代昭梧的子平八字主判。", "生命灵数属于象征性的自我探索工具，不是命运定论，也不取代昭梧的子平八字主判。", "Numerology is a symbolic self-reflection tool. It is not a fixed prediction and does not replace Zhaowu’s BaZi reading."),
  }), [locale]);

  if (!birth || !result) {
    return (
      <main className="mx-auto max-w-3xl space-y-5 pb-16">
        <section className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
          <p className="text-xs tracking-[0.26em] text-cinnabar">ZHAOWU · {copy.kicker}</p>
          <h1 className="mt-2 font-display text-3xl text-ink">{copy.title}</h1>
          <p className="mt-4 text-[15px] leading-7 text-ink-soft">{copy.noBirth}</p>
          <Link to="/" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">{copy.home}</Link>
        </section>
      </main>
    );
  }

  const reading = profile(locale, result.number);
  const calculation = `${result.digits.join("+")}=${result.steps.join(" → ")}`;
  const isMaster = MASTER_NUMBERS.has(result.number);

  return (
    <main className="mx-auto max-w-3xl space-y-5 pb-16">
      <section className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
        <p className="text-xs tracking-[0.26em] text-cinnabar">ZHAOWU · {copy.kicker}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-ink-mute">{copy.yourNumber}</p>
            <h1 className="mt-1 font-display text-5xl leading-none text-ink">{result.number}</h1>
          </div>
          <div className="text-right">
            {isMaster ? <span className="inline-flex rounded-full border border-cinnabar/30 bg-paper px-3 py-1 text-xs font-semibold text-cinnabar">{copy.master}</span> : null}
            <h2 className="mt-2 font-display text-2xl text-ink">{reading.name}</h2>
            <p className="mt-1 text-xs tracking-[0.12em] text-ink-mute">{reading.keywords}</p>
          </div>
        </div>
        <p className="mt-5 text-[15px] leading-7 text-ink-soft">{reading.core}</p>
        <div className="mt-5 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft">
          <b className="text-ink">{copy.calculation}：</b>{calculation}
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h3 className="font-display text-xl text-ink">{copy.strength}</h3>
        <p className="mt-2 text-[15px] leading-7 text-ink-soft">{reading.strength}</p>
        <h3 className="mt-6 font-display text-xl text-ink">{copy.challenge}</h3>
        <p className="mt-2 text-[15px] leading-7 text-ink-soft">{reading.challenge}</p>
        <h3 className="mt-6 font-display text-xl text-ink">{copy.action}</h3>
        <p className="mt-2 text-[15px] leading-7 text-ink-soft">{reading.action}</p>
      </section>

      <p className="px-1 text-xs leading-6 text-ink-mute">{copy.note}</p>
    </main>
  );
}
