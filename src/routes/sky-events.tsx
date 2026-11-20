import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { SKY_EVENT_CATEGORIES, getArchivedSkyEvents, getFeaturedSkyEvent, getTodaySkyUpdatedDate } from "@/lib/sky-events";
import { TodaySkyCards } from "@/components/today-sky-cards";
import { DailySkyObservation } from "@/components/daily-sky-observation";
import { SkyUniverse } from "@/components/sky-universe";
import { SkyObservationBrief } from "@/components/sky-observation-brief";
import { isSkyReportArchived } from "@/lib/sky-week-presentation";
import "@/sky-events.css";
import { toSimplifiedCustomerText } from "@/lib/report/reading-locale";

export const Route = createFileRoute("/sky-events")({ component: SkyEventsPage });

type Lang = "zh-Hant" | "zh-Hans" | "en";

type EssaySection = { title: string; paragraphs: string[]; quote?: string };

function SaturnEssay({ lang }: { lang: Lang }) {
  const copy: Record<Lang, { intro: string; sections: EssaySection[] }> = {
    "zh-Hant": {
      intro: "土星衝不會替任何人做決定，天文學也沒有告訴我們人生應該怎麼活。以下內容是把 2026 年土星逆行白羊當作占星象徵語言，用來檢查人生結構，而不是把天文現象當成命運因果。",
      sections: [
        {
          title: "一｜重新辨認「繼承來的人生」",
          paragraphs: [
            "有些東西我們從未真正選過，只是活得夠久，就以為那是自己的選擇。穩定工作才是安全、關係維持越久就越有價值、成熟就是不要給別人添麻煩、既然已經投入這麼多年就不能重新開始——這些都可能只是繼承而來的生活規則。",
            "真正值得檢查的不是「這個選擇好不好」，而是：如果今天沒有任何人期待我這樣活，我還會做同樣的選擇嗎？"
          ],
          quote: "你一直在替一張並不是自己畫的藍圖施工。"
        },
        {
          title: "二｜真正危險的，不是問題，而是「假性解決」",
          paragraphs: [
            "換了一份工作，但選工作的底層動機仍然是害怕失敗；重新談判了一段關係，但真正的權力、依附與界線模式沒有改；說了很多次「我要設立界線」，可真正需要拒絕時又重新退讓。",
            "這些都是表面完成、結構未變的典型情況。你處理了症狀，卻沒有處理產生症狀的系統。"
          ]
        },
        {
          title: "三｜為什麼同一種問題總是換一張臉回來？",
          paragraphs: [
            "第一次可能是主管，第二次變成伴侶，第三次變成自己的公司。表面上三件事毫無關係，底層卻可能都是同一件事：你不敢把決定權真正拿回來。",
            "留下的理由也會變：害怕孤獨、責任感、沉沒成本。理由不同，但如果核心選擇沒有改，故事仍可能重演。"
          ],
          quote: "不要只問「為什麼又發生？」更要問：哪一個我從來沒有真正改變的選擇，讓它可以再次發生？"
        },
        {
          title: "四｜界線不是說出來的，而是行為",
          paragraphs: [
            "如果你說不能再接受某種合作方式，對方再次越線時你卻照舊合作，那還不是完整的界線。若你說不再承擔所有人的情緒，卻在對方不高興時立刻回去安撫，也一樣。",
            "真正的界線不是懲罰別人，而是當界線被跨過時，你真的改變自己的行為，不再用自己的行動維持一套你已經說過不能接受的結構。"
          ]
        },
        {
          title: "五｜土星不是懲罰，它更像結構壓力測試",
          paragraphs: [
            "一個建立在討好上的關係、一個依靠壓抑自己才能運作的職業、一個完全靠意志力撐住的生活、一個只靠逃避衝突維持和平的家庭，都可以問同一件事：這個結構能承受時間嗎？",
            "時間會顯示韌性，也會暴露那些必須不斷追加代價才能維持的結構。"
          ],
          quote: "如果一個東西必須靠你持續犧牲自己才能存在，它可能並沒有你想像中那麼穩定。"
        },
        {
          title: "六｜2026 年土星白羊真正值得問的三個問題",
          paragraphs: [
            "第一：這是我的人生，還是我繼承的人生？把家庭期待、社會標準、職業身份與自己的真實選擇分開。",
            "第二：我改變的是問題本身，還是只換了一個版本？工作、公司、伴侶、城市都可以換；如果選擇機制沒變，故事仍可能重演。",
            "第三：我的界線已經進入行動了嗎？不要只問「我知道應該怎樣」，而要問：我現在已經停止什麼、開始什麼、拒絕什麼？"
          ]
        },
        {
          title: "觀世錄｜有些東西真正需要的，是不再繼承",
          paragraphs: [
            "有些人生階段的真正轉折，不是得到一個新的答案，而是終於承認：舊答案已經不能再用了。成熟也不一定意味著承受更多；有時真正的成熟，是願意拆掉一座自己花了很多年建造、但從來不適合自己居住的房子。",
            "如果借用占星的象徵語言，2026 年這段土星白羊的逆行週期可以成為一個提醒：不要只修補人生，檢查那個一直產生問題的結構。",
            "有些東西需要修，有些東西需要重建，而有些東西真正需要的是——不再繼承。"
          ],
          quote: "如果這一次，不按照任何人交給我的圖紙，我到底想怎麼建造自己的生活？"
        }
      ]
    },
    "zh-Hans": {
      intro: "土星冲不会替任何人做决定，天文学也没有告诉我们人生应该怎么活。以下内容是把 2026 年土星逆行白羊当作占星象征语言，用来检查人生结构，而不是把天文现象当成命运因果。",
      sections: [
        { title: "一｜重新辨认“继承来的人生”", paragraphs: ["有些东西我们从未真正选过，只是活得够久，就以为那是自己的选择。稳定工作才是安全、关系维持越久就越有价值、成熟就是不要给别人添麻烦、既然已经投入这么多年就不能重新开始——这些都可能只是继承而来的生活规则。", "真正值得检查的不是“这个选择好不好”，而是：如果今天没有任何人期待我这样活，我还会做同样的选择吗？"], quote: "你一直在替一张并不是自己画的蓝图施工。" },
        { title: "二｜真正危险的，不是问题，而是“假性解决”", paragraphs: ["换了一份工作，但选工作的底层动机仍然是害怕失败；重新谈判了一段关系，但真正的权力、依附与界线模式没有改；说了很多次“我要设立界线”，可真正需要拒绝时又重新退让。", "这些都是表面完成、结构未变的典型情况。你处理了症状，却没有处理产生症状的系统。"] },
        { title: "三｜为什么同一种问题总是换一张脸回来？", paragraphs: ["第一次可能是主管，第二次变成伴侣，第三次变成自己的公司。表面上三件事毫无关系，底层却可能都是同一件事：你不敢把决定权真正拿回来。", "留下的理由也会变：害怕孤独、责任感、沉没成本。理由不同，但如果核心选择没有改，故事仍可能重演。"], quote: "不要只问“为什么又发生？”更要问：哪一个我从来没有真正改变的选择，让它可以再次发生？" },
        { title: "四｜界线不是说出来的，而是行为", paragraphs: ["如果你说不能再接受某种合作方式，对方再次越线时你却照旧合作，那还不是完整的界线。若你说不再承担所有人的情绪，却在对方不高兴时立刻回去安抚，也一样。", "真正的界线不是惩罚别人，而是当界线被跨过时，你真的改变自己的行为，不再用自己的行动维持一套你已经说过不能接受的结构。"] },
        { title: "五｜土星不是惩罚，它更像结构压力测试", paragraphs: ["一个建立在讨好上的关系、一个依靠压抑自己才能运作的职业、一个完全靠意志力撑住的生活、一个只靠逃避冲突维持和平的家庭，都可以问同一件事：这个结构能承受时间吗？", "时间会显示韧性，也会暴露那些必须不断追加代价才能维持的结构。"], quote: "如果一个东西必须靠你持续牺牲自己才能存在，它可能并没有你想象中那么稳定。" },
        { title: "六｜2026 年土星白羊真正值得问的三个问题", paragraphs: ["第一：这是我的人生，还是我继承的人生？把家庭期待、社会标准、职业身份与自己的真实选择分开。", "第二：我改变的是问题本身，还是只换了一个版本？工作、公司、伴侣、城市都可以换；如果选择机制没变，故事仍可能重演。", "第三：我的界线已经进入行动了吗？不要只问“我知道应该怎样”，而要问：我现在已经停止什么、开始什么、拒绝什么？"] },
        { title: "观世录｜有些东西真正需要的，是不再继承", paragraphs: ["有些人生阶段的真正转折，不是得到一个新的答案，而是终于承认：旧答案已经不能再用了。成熟也不一定意味着承受更多；有时真正的成熟，是愿意拆掉一座自己花了很多年建造、但从来不适合自己居住的房子。", "如果借用占星的象征语言，2026 年这段土星白羊的逆行周期可以成为一个提醒：不要只修补人生，检查那个一直产生问题的结构。", "有些东西需要修，有些东西需要重建，而有些东西真正需要的是——不再继承。"], quote: "如果这一次，不按照任何人交给我的图纸，我到底想怎么建造自己的生活？" }
      ]
    },
    en: {
      intro: "Saturn at opposition makes no decisions for us, and astronomy does not tell us how to live. The essay below uses the 2026 Saturn-in-Aries retrograde cycle as symbolic astrological language for examining life structures, not as a scientific claim of fate or causation.",
      sections: [
        { title: "1 | Recognising an inherited life", paragraphs: ["Some rules were never consciously chosen. We simply lived with them long enough to mistake them for our own: a stable job is always safer, a longer relationship is automatically more valuable, maturity means never burdening others, or years already invested mean we cannot begin again.", "The more useful question is not whether a choice looks good, but: if nobody expected me to live this way, would I still make the same choice?"], quote: "You may have been building from a blueprint you never drew." },
        { title: "2 | The real danger is a false solution", paragraphs: ["You can change jobs while still choosing from fear of failure; renegotiate a relationship while leaving power, dependency and boundaries untouched; or declare a boundary and retreat as soon as it carries a cost.", "These are surface changes without structural change. The symptom is treated while the system producing it remains intact."] },
        { title: "3 | Why does the same problem return with a different face?", paragraphs: ["The first version may be a boss, the second a partner, the third your own company. They look unrelated, yet the underlying issue may be the same: not fully reclaiming the right to decide.", "The reason for staying can change too—fear of loneliness, duty, sunk cost. Different reasons do not prevent an unchanged choice pattern from repeating."], quote: "Do not ask only ‘why did this happen again?’ Ask which unchanged choice made the repetition possible." },
        { title: "4 | A boundary is behaviour, not a sentence", paragraphs: ["If you say a form of collaboration is no longer acceptable but continue unchanged when it happens again, the boundary is incomplete. The same applies if you say you will stop carrying everyone’s emotions, then immediately resume doing so when someone is unhappy.", "A real boundary is not punishment. It is changing your own behaviour when the line is crossed, and no longer using your actions to sustain a structure you have already said you cannot accept."] },
        { title: "5 | Saturn as a structural stress test", paragraphs: ["A relationship built on pleasing, a career that works only through self-suppression, a life held together by willpower, or a family peace maintained by avoiding conflict can all be tested with the same question: can this structure survive time?", "Time reveals resilience, but it also exposes structures that require ever-increasing personal cost merely to remain unchanged."], quote: "If something can exist only through your continuous self-sacrifice, it may be less stable than it appears." },
        { title: "6 | Three questions worth asking during Saturn in Aries", paragraphs: ["First: is this my life, or an inherited life? Separate family expectations, social templates and professional identity from choices that are actually yours.", "Second: did I change the problem, or only its version? Jobs, companies, partners and cities can change; an unchanged choice mechanism can reproduce the same story.", "Third: has my boundary become action? Ask what you have actually stopped, started and refused."] },
        { title: "Observations | Some things need to stop being inherited", paragraphs: ["Some turning points do not arrive as new answers. They begin when an old answer is finally recognised as unusable. Maturity does not always mean carrying more; sometimes it means dismantling a house you spent years building because it was never a place you could truly live.", "Used as symbolic language, the 2026 Saturn-in-Aries retrograde cycle can be a prompt: do not only patch your life; inspect the structure that keeps producing the problem.", "Some things need repair. Some need rebuilding. And some need to stop being inherited."], quote: "If I stopped building from everyone else’s plans, how would I actually want to construct my life?" }
      ]
    }
  };

  const selected = copy[lang];
  return (
    <section className="sky-event-essay" aria-label={lang === "en" ? "Feature essay" : lang === "zh-Hans" ? "专题文章" : "專題文章"}>
      <p className="sky-event-essay-intro">{selected.intro}</p>
      {selected.sections.map((section) => (
        <section className="sky-event-essay-section" key={section.title}>
          <h3>{section.title}</h3>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.quote ? <blockquote>{section.quote}</blockquote> : null}
        </section>
      ))}
    </section>
  );
}

function SkyEventsPage() {
  const { locale } = useI18n();
  const lang: Lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const event = getFeaturedSkyEvent();
  const archive = getArchivedSkyEvents();
  const showCurrentWeek = !isSkyReportArchived(getTodaySkyUpdatedDate());
  const isSaturn = event.id === "saturn-opposition-2026";
  const ui = locale === "en"
    ? { title: "The Sky Now", lead: "Astronomical reality × symbolic astrology", back: "Home", science: "Astronomy layer · verifiable", symbolic: "Astrology layer · symbolic", houses: "Where this sign falls in your natal chart", sources: "Sources & verification", watch: "What this desk will publish first", archive: "Earlier sky events", note: "Astronomy and astrology are not presented as the same kind of knowledge. Measurable celestial motion is factual; personal meaning is a symbolic interpretive tradition." }
    : locale === "zh-Hans"
      ? { title: "此时天象", lead: "天文实况 × 星象解读", back: "返回首页", science: "天文层｜可验证事实", symbolic: "占星层｜象征性解读", houses: "本次星座落入本命不同宫位", sources: "资料来源与核验", watch: "本专栏第一时间发布", archive: "早前天象", note: "本站不会把天文学与占星解释混成同一种证据。可测量的天体运动属于事实层；个人意义属于传统占星的象征解释层。" }
      : { title: "此時天象", lead: "天文實況 × 星象解讀", back: "返回首頁", science: "天文層｜可驗證事實", symbolic: "占星層｜象徵性解讀", houses: "本次星座落入本命不同宮位", sources: "資料來源與核驗", watch: "本專欄第一時間發布", archive: "早前天象", note: "本站不會把天文學與占星解讀混成同一種證據。可測量的天體運動屬於事實層；個人意義屬於傳統占星的象徵解讀層。" };

  const labels = locale === "en"
    ? { navigation: "On this page", feature: "Featured event", week: "This week", archive: "Earlier events", expand: "Open section", eventDetails: "What is fact, and what is interpretation?", longRead: "Read the full interpretation", sourceDetails: "Sources and verification", featureKinds: ["Astronomy facts", "Astrological symbolism"] }
    : locale === "zh-Hans"
      ? { navigation: "本页导览", feature: "本期焦点", week: "本周速览", archive: "过往天象", expand: "展开内容", eventDetails: "天文事实与占星解读", longRead: "阅读完整解读", sourceDetails: "资料来源与核验", featureKinds: ["天文事实", "占星象征"] }
      : { navigation: "本頁導覽", feature: "本期焦點", week: "本週速覽", archive: "過往天象", expand: "展開內容", eventDetails: "天文事實與占星解讀", longRead: "閱讀完整解讀", sourceDetails: "資料來源與核驗", featureKinds: ["天文事實", "占星象徵"] };

  const guide = lang === "en"
    ? {
        impactTitle: "What could happen in daily life",
        impactIntro: "The themes most worth noticing in the coming weeks, interpreted through traditional astrology — not guaranteed events.",
        headlines: [
          "Late October–13 November: Messages, arrangements and money terms may need repeated checks. Revisit what was agreed before making a new commitment.",
          "14–29 November: Paused conversations and negotiations may move again. Confirm what has actually changed rather than assuming all delays have cleared.",
          "Late November–early December: Work and group dynamics may move more quickly. Keep room in plans for unexpected changes.",
          "December–early January: Longer-term responsibilities, budgets and priorities may need reordering. Check the practical details of year-end decisions."
        ],
        more: "Read the full astrological interpretation",
        timeline: "Explore the dated sky-event timeline",
        observation: "View Sydney observations and historical records",
        method: "Open astronomical facts and calculations",
        context: "Interpretive tradition · Not a personal forecast"
      }
    : lang === "zh-Hans"
      ? {
          impactTitle: "这段时间，生活中最值得注意什么",
          impactIntro: "先看生活层面的重点；以下属于传统占星象征，并非必然发生的事件。",
          headlines: [
            "10月下旬至11月13日：消息、安排、付款与合作条件可能反复修改。重要约定先核对，避免凭印象做决定。",
            "11月14日至29日：停滞的沟通与协商可能重新推进。重谈条件时，先确认变化，再决定是否执行。",
            "11月底至12月初：工作与人际节奏可能加快。行程和项目预留调整空间，不把临时变化直接当成危机。",
            "12月至明年1月初：长期责任、预算与优先顺序可能需要重排。年末文件、承诺和支出尤其值得复核。"
          ],
          more: "展开完整占星解读",
          timeline: "展开天象日期与重要事件",
          observation: "展开悉尼观测与历史记录",
          method: "查看天文数据与计算依据",
          context: "传统占星象征｜非个人预测"
        }
      : {
          impactTitle: "這段時間，生活中最值得注意什麼",
          impactIntro: "先看生活層面的重點；以下屬於傳統占星象徵，並非必然發生的事件。",
          headlines: [
            "10月下旬至11月13日：消息、安排、付款與合作條件可能反覆修改。重要約定先核對，避免憑印象做決定。",
            "11月14日至29日：停滯的溝通與協商可能重新推進。重談條件時，先確認變化，再決定是否執行。",
            "11月底至12月初：工作與人際節奏可能加快。行程和專案預留調整空間，不把臨時變化直接當成危機。",
            "12月至明年1月初：長期責任、預算與優先順序可能需要重排。年末文件、承諾和支出尤其值得複核。"
          ],
          more: "展開完整占星解讀",
          timeline: "展開天象日期與重要事件",
          observation: "展開悉尼觀測與歷史紀錄",
          method: "查看天文數據與計算依據",
          context: "傳統占星象徵｜非個人預測"
        };
  return (
    <main className="sky-events-page">
      <nav className="sky-events-nav"><Link to="/">← {ui.back}</Link><span>昭梧 · SKY DESK</span></nav>
      <header className="sky-events-hero">
        <span className="sky-events-kicker">CELESTIAL WATCH</span>
        <h1>{ui.title}</h1>
        <p>{ui.lead}</p>
      </header>

      <SkyUniverse lang={lang} />

      <nav className="sky-events-shortcuts" aria-label={labels.navigation}>
        <a href="#sky-featured">{labels.feature}</a>
        <a href="#sky-observation-record">{labels.week}</a>
        <a href="#sky-archive">{labels.archive}</a>
      </nav>

      <article className="sky-event-article">
        <section className="sky-event-impact" id="sky-featured" aria-labelledby="sky-impact-heading">
          <span className="sky-layer-tag">INTERPRETIVE · {ui.symbolic}</span>
          <h2 id="sky-impact-heading">{guide.impactTitle}</h2>
          <p className="sky-impact-intro">{guide.impactIntro}</p>
          <ol className="sky-impact-points">{(event.id === "zhaowu-sky-quarter-2026-10-04-2027-01-04" ? guide.headlines : event.interpretation[lang]).map((text, index) => (
            <li key={index}>{text}</li>
          ))}</ol>
          {event.id === "zhaowu-sky-quarter-2026-10-04-2027-01-04" ? (
            <details className="sky-impact-more">
              <summary>{guide.more}</summary>
              <ul>{event.interpretation[lang].map((text, index) => <li key={index}>{text}</li>)}</ul>
            </details>
          ) : null}
          <p className="sky-impact-context">{guide.context}</p>
        </section>

        <div className="sky-event-kind-tags" aria-label={labels.featureKinds.join(" / ")}>
          {labels.featureKinds.map((label, index) => <span key={label} className={index === 0 ? "is-fact" : "is-symbol"}>{label}</span>)}
        </div>
        <header className="sky-event-title">
          <figure className="sky-event-art">
            <img src="/mythic-atlas/originals/12-stars-and-constellations.webp"
              width={320} height={400} loading="lazy" decoding="async"
              alt={lang === "en" ? "Traditional celestial constellation painting; editorial artwork, not a live astronomical image."
                : lang === "zh-Hans" ? "传统星宿绘画，用作栏目配图，并非实时天文影像。"
                : "傳統星宿繪畫，作為欄目配圖，並非即時天文影像。"} />
            <figcaption>{lang === "en" ? "Archived celestial artwork" : lang === "zh-Hans" ? "既有星宿画作" : "既有星宿畫作"}</figcaption>
          </figure>
          <div><span className="sky-events-kicker">{event.published}</span><h2>{event.title[lang]}</h2><p>{event.subtitle[lang]}</p></div>
        </header>

        <details className="sky-section-disclosure sky-event-details">
          <summary><strong>{guide.timeline}</strong><span>{labels.expand}</span></summary>
          <div className="sky-event-disclosure-body">
            <div className="sky-event-timeline">
              {event.facts.map((fact) => <div key={fact.date}><time>{fact.date}</time><span>{fact.label[lang]}</span></div>)}
            </div>
          </div>
        </details>

        <details className="sky-section-disclosure sky-science-details">
          <summary><strong>{guide.method}</strong><span>{labels.expand}</span></summary>
          <div className="sky-event-disclosure-body">
            <section className="sky-event-layer science">
              <span className="sky-layer-tag">OBSERVABLE</span><h3>{ui.science}</h3>
              <ul>{event.science[lang].map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
            <p className="sky-science-disclaimer">{ui.note}</p>
          </div>
        </details>

        {isSaturn ? <details className="sky-section-disclosure sky-long-read"><summary><strong>{labels.longRead}</strong><span>{labels.expand}</span></summary><SaturnEssay lang={lang} /></details> : event.houses.length > 0 ? (
          <details className="sky-section-disclosure sky-event-houses">
            <summary><strong>{ui.houses}</strong><span>{labels.expand}</span></summary>
            <div>{event.houses.map((x) => <article key={x.house}><b>{x.house}</b><span>{x[lang]}</span></article>)}</div>
          </details>
        ) : null}

        <details className="sky-section-disclosure sky-source-details">
          <summary><strong>{labels.sourceDetails}</strong><span>{event.sources.length}</span></summary>
          <footer className="sky-event-sources">
            <h3>{ui.sources}</h3>
            <div>{event.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>)}</div>
          </footer>
        </details>
      </article>


      <details className="sky-section-disclosure sky-observation-disclosure" id="sky-observation-record">
        <summary><strong>{guide.observation}</strong><span>{labels.expand}</span></summary>
        <div className="sky-observation-disclosure-body">
          <SkyObservationBrief />
          {showCurrentWeek ? (
            <section className="sky-week-public" id="sky-week" aria-label={labels.week}>
              <TodaySkyCards />
            </section>
          ) : null}
          <DailySkyObservation />
        </div>
      </details>

      <details className="sky-section-disclosure sky-watch-disclosure">
        <summary><strong>{ui.watch}</strong><span>{SKY_EVENT_CATEGORIES.length}</span></summary>
        <div className="sky-events-watch">
          <div className="sky-events-category-grid">{SKY_EVENT_CATEGORIES.map((x) => <span key={x}>{lang === "zh-Hans" ? toSimplifiedCustomerText(x) : x}</span>)}</div>
        </div>
      </details>

      {archive.length > 0 ? (
        <details className="sky-section-disclosure sky-events-archive" id="sky-archive" aria-label={ui.archive}>
          <summary><strong>{ui.archive}</strong><span>{archive.length}</span></summary>
          <div className="sky-events-archive-grid">
            {archive.map((row) => (
              <article key={row.id} className="sky-events-archive-card">
                <span className="sky-events-kicker">{row.published}</span>
                <strong>{row.title[lang]}</strong>
                <small>{row.subtitle[lang]}</small>
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </main>
  );
}
