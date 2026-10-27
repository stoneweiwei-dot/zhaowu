import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/sample-report")({ component: SampleReportPage });

type SampleSection = { title: string; body: string };
type SampleCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  fictional: string;
  profileTitle: string;
  profile: [string, string][];
  questionLabel: string;
  question: string;
  answerLabel: string;
  answer: string;
  summaryTitle: string;
  summary: string;
  bodyTitle: string;
  body: string;
  bodyBoundary: string;
  sectionsTitle: string;
  sections: SampleSection[];
  timingTitle: string;
  timing: string;
  methodTitle: string;
  methodIntro: string;
  certainty: [string, string][];
  disclaimer: string;
  ctaTitle: string;
  ctaBody: string;
  cta: string;
  back: string;
};

const COPY: Record<Locale, SampleCopy> = {
  "zh-Hant": {
    eyebrow: "昭梧命書 · 公開示例",
    title: "先看答案，再看命盤如何支持它。",
    lead: "這份示例保留正式命書的閱讀次序：直接回答、總體概括、身體提醒、六段深讀、行動與判斷依據。",
    fictional: "以下人物、生辰與情境均為虛構，只用來展示內容深度與表達邊界，不代表任何真實客戶。",
    profileTitle: "示例資料",
    profile: [["人物", "林澄（虛構）"], ["出生", "1994 年 6 月 18 日 10:30 · 臺北"], ["真太陽時", "10:35"], ["四柱", "甲戌 · 庚午 · 乙亥 · 辛巳"]],
    questionLabel: "這次想問",
    question: "我該留在目前的工作，還是開始準備轉職？",
    answerLabel: "直接答案",
    answer: "較適合開始準備轉職，但不宜在壓力最高時裸辭。先把現職能累積的作品、成果與人脈收好，再用清楚的職責、資源和退出條款篩選下一份工作。",
    summaryTitle: "總體概括",
    summary: "示意盤以乙木為日主，生於午月。判讀重點不是把人貼成「木型人格」，而是看木在盛夏是否有水潤、有金修整，以及輸出能否落成可衡量的成果。現況的優勢是觀察細、能整合資訊；代價是容易一邊承擔、一邊延後表態，最後在過載時一次切斷。轉職方向成立，但要靠準備完成度，而不是靠一時厭倦。",
    bodyTitle: "身體需要注意的地方",
    body: "盛夏火氣偏明顯時，生活上可先觀察睡眠被工作推遲、緊繃後仍停不下來、休息時腦中持續排演工作的情況。做法不是用顏色或物件「補命」，而是固定停止工作的時間、安排真正離線的恢復段，並記錄兩至四週後的精神與睡眠變化。",
    bodyBoundary: "這一段只作傳統象義與生活節奏提醒，不是醫療診斷；症狀持續或加重，應以合資格醫療專業意見為準。",
    sectionsTitle: "完整命書怎麼往下讀",
    sections: [
      { title: "核心底盤", body: "先定月令、寒暖與承載，再看根氣、透藏與流通。此例以「能不能把想法轉成穩定交付」作核心，不以五行數量平均作好壞判斷。" },
      { title: "性格節奏", body: "對環境與他人的細微變化敏感，通常會先觀察再表態。這能減少草率決定，也可能讓界線說得太晚；真正要練的是及早說明條件。" },
      { title: "關係互動", body: "不以單一配偶星套用所有關係。判斷放在聯繫是否持續、投入是否對等、界線是否清楚，以及雙方能否把下一步說明白。" },
      { title: "事業與資源", body: "適合知識、技術或內容能被整理成產品、服務與流程的工作。選擇下一職位時，優先問：責任清不清楚、成果看不看得見、資源夠不夠、離開是否有路。" },
      { title: "人生階段", body: "這份示例不以單柱或一年干支製造必然事件。階段判讀只說明何時適合擴張、收斂或整理，實際轉職仍需職缺、薪資與生活承擔共同成立。" },
      { title: "反覆課題與行動", body: "反覆課題是把承擔累積到過量才做決定。最高優先行動：列出下一份工作五項不可退讓條件，並在六至八週內完成作品與履歷，不在沒有退路時衝動離場。" },
    ],
    timingTitle: "時間與觸發",
    timing: "示例沒有足夠證據支持某一天必然出現邀約，因此不造作精細應期。可執行的窗口是：先用六至八週完成材料；當出現職責更清楚、資源可核對、退出成本可承受的機會，再進入面試與談判。",
    methodTitle: "判斷備註",
    methodIntro: "昭梧把可確認、條件推斷與無法確認分開，不用漂亮話掩蓋資料邊界。",
    certainty: [["盤面可確認", "示例輸入與四柱、乙木日主、午月，以及真太陽時校正結果。"], ["條件推斷", "工作選擇偏向準備轉職；成立條件是成果可攜、資源清楚與退出成本可承受。"], ["無法確認", "哪家公司一定錄取、確切薪資、某日必然發生的事件，以及任何醫療結果。"]],
    disclaimer: "命理用來整理結構、時機與選擇，不替代醫療、法律、財務或職涯專業意見。",
    ctaTitle: "這是示例；你的命書會從你的資料與問題開始。",
    ctaBody: "排盤與核心直答免登入。深入內容為單次解鎖，不自動續費。",
    cta: "開始我的命盤",
    back: "返回首頁",
  },
  "zh-Hans": {
    eyebrow: "昭梧命书 · 公开示例",
    title: "先看答案，再看命盘如何支持它。",
    lead: "这份示例保留正式命书的阅读次序：直接回答、总体概括、身体提醒、六段深读、行动与判断依据。",
    fictional: "以下人物、生辰与情境均为虚构，只用来展示内容深度与表达边界，不代表任何真实客户。",
    profileTitle: "示例资料",
    profile: [["人物", "林澄（虚构）"], ["出生", "1994 年 6 月 18 日 10:30 · 台北"], ["真太阳时", "10:35"], ["四柱", "甲戌 · 庚午 · 乙亥 · 辛巳"]],
    questionLabel: "这次想问",
    question: "我该留在目前的工作，还是开始准备转职？",
    answerLabel: "直接答案",
    answer: "较适合开始准备转职，但不宜在压力最高时裸辞。先把现职能积累的作品、成果与人脉收好，再用清楚的职责、资源和退出条款筛选下一份工作。",
    summaryTitle: "总体概括",
    summary: "示意盘以乙木为日主，生于午月。判断重点不是把人贴成“木型人格”，而是看木在盛夏是否有水润、有金修整，以及输出能否落成可衡量的成果。现况的优势是观察细、能整合信息；代价是容易一边承担、一边延后表态，最后在过载时一次切断。转职方向成立，但要靠准备完成度，而不是靠一时厌倦。",
    bodyTitle: "身体需要注意的地方",
    body: "盛夏火气偏明显时，生活上可先观察睡眠被工作推迟、紧绷后仍停不下来、休息时脑中持续排演工作的情况。做法不是用颜色或物件“补命”，而是固定停止工作的时间、安排真正离线的恢复段，并记录两至四周后的精神与睡眠变化。",
    bodyBoundary: "这一段只作传统象义与生活节奏提醒，不是医疗诊断；症状持续或加重，应以合资格医疗专业意见为准。",
    sectionsTitle: "完整命书怎么往下读",
    sections: [
      { title: "核心底盘", body: "先定月令、寒暖与承载，再看根气、透藏与流通。此例以“能不能把想法转成稳定交付”作核心，不以五行数量平均作好坏判断。" },
      { title: "性格节奏", body: "对环境与他人的细微变化敏感，通常会先观察再表态。这能减少草率决定，也可能让界线说得太晚；真正要练的是及早说明条件。" },
      { title: "关系互动", body: "不以单一配偶星套用所有关系。判断放在联系是否持续、投入是否对等、界线是否清楚，以及双方能否把下一步说明白。" },
      { title: "事业与资源", body: "适合知识、技术或内容能被整理成产品、服务与流程的工作。选择下一职位时，优先问：责任清不清楚、成果看不看得见、资源够不够、离开是否有路。" },
      { title: "人生阶段", body: "这份示例不以单柱或一年干支制造必然事件。阶段判断只说明何时适合扩张、收敛或整理，实际转职仍需职位、薪资与生活承担共同成立。" },
      { title: "反复课题与行动", body: "反复课题是把承担积累到过量才做决定。最高优先行动：列出下一份工作五项不可退让条件，并在六至八周内完成作品与履历，不在没有退路时冲动离场。" },
    ],
    timingTitle: "时间与触发",
    timing: "示例没有足够证据支持某一天必然出现邀约，因此不制造精细应期。可执行的窗口是：先用六至八周完成材料；当出现职责更清楚、资源可核对、退出成本可承受的机会，再进入面试与谈判。",
    methodTitle: "判断备注",
    methodIntro: "昭梧把可确认、条件推断与无法确认分开，不用漂亮话掩盖资料边界。",
    certainty: [["盘面可确认", "示例输入与四柱、乙木日主、午月，以及真太阳时校正结果。"], ["条件推断", "工作选择偏向准备转职；成立条件是成果可携、资源清楚与退出成本可承受。"], ["无法确认", "哪家公司一定录取、确切薪资、某日必然发生的事件，以及任何医疗结果。"]],
    disclaimer: "命理用来整理结构、时机与选择，不替代医疗、法律、财务或职业专业意见。",
    ctaTitle: "这是示例；你的命书会从你的资料与问题开始。",
    ctaBody: "排盘与核心直答免登录。深入内容为单次解锁，不自动续费。",
    cta: "开始我的命盘",
    back: "返回首页",
  },
  en: {
    eyebrow: "ZHAOWU DESTINY BOOK · PUBLIC SAMPLE",
    title: "Read the answer first, then see how the chart supports it.",
    lead: "This sample follows the real reading order: direct answer, whole-chart summary, wellbeing note, six deeper chapters, action and evidence boundaries.",
    fictional: "The person, birth details and situation below are entirely fictional. They show the depth and limits of the product and do not represent a real client.",
    profileTitle: "Sample details",
    profile: [["Person", "Lin Cheng (fictional)"], ["Birth", "18 June 1994, 10:30 · Taipei"], ["True solar time", "10:35"], ["Four Pillars", "Jia-Xu · Geng-Wu · Yi-Hai · Xin-Si"]],
    questionLabel: "Question",
    question: "Should I stay in my current job or start preparing to move?",
    answerLabel: "Direct answer",
    answer: "Start preparing for a move, but do not resign at the peak of frustration. First secure the portfolio, results and relationships your current role can still give you, then screen the next role by clear responsibilities, resources and exit terms.",
    summaryTitle: "Whole-chart summary",
    summary: "This illustrative chart has a Yi Wood day master in the Wu month. The point is not to label someone a “Wood personality”; it is to test whether Wood in high summer is watered, shaped and able to turn output into measurable results. The advantage is fine observation and synthesis. The cost is carrying too much while delaying a clear position, then cutting off abruptly when overloaded. A job move is supportable, but only through preparation—not momentary exhaustion.",
    bodyTitle: "What to watch in the body",
    body: "When the hot, outward-moving quality of summer is pronounced, first observe whether work pushes sleep later, tension stays high after the day ends, or the mind keeps rehearsing work during rest. The response is not to “fix fate” with colours or objects. Set a firm stop time, schedule genuinely offline recovery, and record changes in sleep and energy over two to four weeks.",
    bodyBoundary: "This is a traditional symbolic and lifestyle observation, not a medical diagnosis. Persistent or worsening symptoms should be assessed by a qualified health professional.",
    sectionsTitle: "How the full book continues",
    sections: [
      { title: "Structural foundation", body: "Start with season, climate and capacity, then inspect roots, visible stems and circulation. The core question here is whether ideas can become reliable delivery—not whether the five elements look numerically even." },
      { title: "Personal rhythm", body: "Fine changes in people and surroundings are noticed early, so observation often comes before speaking. That reduces rash choices, but boundaries can arrive too late. The practical skill is to state conditions sooner." },
      { title: "Relationships", body: "No single spouse-star formula is imposed on every relationship. The reading looks at continuity, equal investment, clear boundaries and whether both people can name the next step." },
      { title: "Work and resources", body: "Work suits situations where knowledge, technique or content becomes a product, service or repeatable process. Compare roles by clear ownership, visible outcomes, adequate resources and a workable exit." },
      { title: "Life phase", body: "This sample does not turn one pillar or one year into an inevitable event. Timing can describe periods for expansion, consolidation or repair; an actual move still requires a real role, pay and sustainable life conditions." },
      { title: "Recurring pattern and action", body: "The recurring risk is waiting until responsibility becomes excessive before deciding. The priority action is to define five non-negotiables for the next role and finish the portfolio and CV within six to eight weeks—without leaving before there is a viable path." },
    ],
    timingTitle: "Timing and triggers",
    timing: "There is not enough evidence to claim that an offer must arrive on a particular date. The useful window is operational: spend six to eight weeks preparing, then enter interviews and negotiation when a role has clearer ownership, verifiable resources and an acceptable exit cost.",
    methodTitle: "Reading notes",
    methodIntro: "ZHAOWU separates what the chart confirms, what remains conditional and what cannot be known. Boundaries are not hidden behind polished prose.",
    certainty: [["Chart-confirmed", "The fictional input, Four Pillars, Yi Wood day master, Wu month and true-solar-time correction."], ["Conditional inference", "Preparing to move is preferred if results are portable, resources are clear and the exit cost is bearable."], ["Not knowable", "Which company must hire the person, exact salary, a guaranteed event date or any medical outcome."]],
    disclaimer: "BaZi is used here to organise patterns, timing and choices. It does not replace medical, legal, financial or career advice.",
    ctaTitle: "This is a sample. Your Destiny Book begins with your details and your question.",
    ctaBody: "Charting and the core answer are free without sign-in. Deeper content is a one-time unlock, never a subscription.",
    cta: "Start my chart",
    back: "Back to home",
  },
};

function SampleReportPage() {
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <main className="mx-auto max-w-[760px] pb-16" data-sample-report-page>
      <header className="border-b border-earth/30 px-1 pb-8 pt-4 sm:px-5 sm:pt-8">
        <p className="text-xs tracking-[0.24em] text-cinnabar">{copy.eyebrow}</p>
        <h1 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-ink sm:text-5xl">{copy.title}</h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-8 text-ink-soft">{copy.lead}</p>
        <p className="mt-5 border-l-2 border-cinnabar/60 pl-4 text-sm leading-7 text-ink-soft" role="note">{copy.fictional}</p>
      </header>

      <aside className="my-6 border-y border-line py-4 text-sm leading-7" data-sample-access-note>
        <strong>{locale === "en" ? "What is free, and what is paid?" : locale === "zh-Hans" ? "免费与解锁内容" : "免費與解鎖內容"}</strong>
        <p>{locale === "en" ? "Your basic chart and two core preview paragraphs are free. This public sample demonstrates the full report’s structure, including deeper sections; it is not a promise that every section below is free in a personal report. Full readings and detailed timing require a separate one-time unlock, with the price shown before checkout." : locale === "zh-Hans" ? "基本命盘与两段核心试读免费。此公开示例展示完整报告的结构，包含深入章节，不代表个人报告中以下所有段落都免费。完整解读与详细时运需另行单次解锁，价格会在付款前显示。" : "基本命盤與兩段核心試讀免費。此公開示例展示完整報告的結構，包含深入章節，不代表個人報告中以下所有段落都免費。完整解讀與詳細時運需另行單次解鎖，價格會在付款前顯示。"}</p>
      </aside>
      <article className="mt-6 bg-paper px-5 py-7 text-ink shadow-[0_16px_50px_rgba(66,52,32,0.08)] sm:px-10 sm:py-10" aria-label={copy.eyebrow}>
        <section aria-labelledby="sample-profile-title">
          <p id="sample-profile-title" className="text-xs tracking-[0.2em] text-[#315e50]">{copy.profileTitle}</p>
          <dl className="mt-4 grid gap-x-8 border-y border-earth/20 py-4 sm:grid-cols-2">
            {copy.profile.map(([term, value]) => <div key={term} className="grid grid-cols-[7rem_1fr] gap-3 border-b border-earth/15 py-3 last:border-0 sm:grid-cols-1 sm:border-0">
              <dt className="text-xs text-ink-mute">{term}</dt><dd className="min-w-0 break-words text-sm font-medium leading-6 text-ink">{value}</dd>
            </div>)}
          </dl>
        </section>

        <section className="mt-8 border-b border-earth/20 pb-8">
          <p className="text-xs tracking-[0.2em] text-ink-mute">{copy.questionLabel}</p>
          <p className="mt-3 font-display text-xl leading-8 text-ink sm:text-2xl">{copy.question}</p>
        </section>

        <section className="-mx-5 bg-[#315e50] px-5 py-7 text-[#fffaf1] sm:-mx-10 sm:px-10" aria-labelledby="sample-answer-title">
          <p id="sample-answer-title" className="text-xs tracking-[0.2em] text-[#e1c98e]">{copy.answerLabel}</p>
          <p className="mt-4 font-display text-xl leading-9 sm:text-2xl">{copy.answer}</p>
        </section>

        <section className="border-b border-earth/20 py-8">
          <h2 className="font-display text-2xl text-ink">{copy.summaryTitle}</h2>
          <p className="mt-4 text-[15px] leading-8 text-ink-soft">{copy.summary}</p>
        </section>

        <section className="border-b border-earth/20 py-8">
          <h2 className="font-display text-2xl text-ink">{copy.bodyTitle}</h2>
          <p className="mt-4 text-[15px] leading-8 text-ink-soft">{copy.body}</p>
          <p className="mt-4 border-l-2 border-earth/35 pl-4 text-sm leading-7 text-ink-mute">{copy.bodyBoundary}</p>
        </section>

        <section className="py-8" aria-labelledby="sample-sections-title">
          <h2 id="sample-sections-title" className="font-display text-2xl text-ink">{copy.sectionsTitle}</h2>
          <ol className="mt-5 border-t border-earth/25">
            {copy.sections.map((section, index) => <li key={section.title} className="grid gap-2 border-b border-earth/20 py-5 sm:grid-cols-[3rem_1fr] sm:gap-4">
              <span className="text-xs tabular-nums tracking-[0.15em] text-cinnabar">{String(index + 1).padStart(2, "0")}</span>
              <div><h3 className="font-display text-lg text-ink">{section.title}</h3><p className="mt-2 text-[15px] leading-8 text-ink-soft">{section.body}</p></div>
            </li>)}
          </ol>
        </section>

        <section className="border-y border-earth/20 py-8">
          <h2 className="font-display text-2xl text-ink">{copy.timingTitle}</h2>
          <p className="mt-4 text-[15px] leading-8 text-ink-soft">{copy.timing}</p>
        </section>

        <details className="group border-b border-earth/20 py-6" data-sample-method>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-xl text-ink marker:content-none">
            <span>{copy.methodTitle}</span><span className="text-cinnabar group-open:rotate-45" aria-hidden>＋</span>
          </summary>
          <p className="mt-4 text-[15px] leading-8 text-ink-soft">{copy.methodIntro}</p>
          <dl className="mt-4 space-y-4">
            {copy.certainty.map(([term, value]) => <div key={term} className="border-l border-jade/50 pl-4"><dt className="text-sm font-semibold text-ink">{term}</dt><dd className="mt-1 text-sm leading-7 text-ink-soft">{value}</dd></div>)}
          </dl>
          <p className="mt-5 text-xs leading-6 text-ink-mute">{copy.disclaimer}</p>
        </details>
      </article>

      <footer className="px-1 pt-10 text-center sm:px-5">
        <h2 className="font-display text-2xl leading-9 text-ink">{copy.ctaTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-soft">{copy.ctaBody}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/#birth-form" className="inline-flex min-h-12 items-center justify-center bg-[#315e50] px-6 py-3 text-sm font-semibold text-[#fffaf1]">{copy.cta}<span className="ml-2" aria-hidden>→</span></a>
          <Link to="/" className="inline-flex min-h-12 items-center justify-center border border-earth/35 bg-paper px-6 py-3 text-sm text-ink">{copy.back}</Link>
        </div>
      </footer>
    </main>
  );
}
