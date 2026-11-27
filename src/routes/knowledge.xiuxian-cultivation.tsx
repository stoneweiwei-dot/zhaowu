import { pageHead } from "@/lib/route-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/knowledge/xiuxian-cultivation")({
  head: pageHead,
  component: XiuxianCultivationArticle,
});

type L = "zh-Hant" | "zh-Hans" | "en";
type Section = { h: string; ps: string[]; items?: [string, string][]; after?: string };

const CONTENT: Record<L, {
  eyebrow: string;
  h1: string;
  lead: string;
  sections: Section[];
  faqH: string;
  faq: [string, string][];
  quizLabel: string;
  quizNote: string;
  ctaChart: string;
  ctaBack: string;
}> = {
  "zh-Hant": {
    eyebrow: "文化隨筆 · 仙俠世界觀",
    h1: "修仙：把命運修在自己手裡",
    lead: "兩千多年來，中國有一種想法：人可以靠自己修煉成仙。從道教修行到今天的仙俠小說，這個想法變成一句話——命運可以自己修。",
    sections: [
      {
        h: "修仙是什麼",
        ps: [
          "大多數文化都接受一件事：人會生、會老、會死。但在中國的道教傳統裡，一直有另一種想法：人可以透過修煉，成為仙人。修的是自己的身體、呼吸與心，一層一層往上走。",
          "這不是科學結論，而是一種流傳了兩千多年的文化想像。今天它最常出現的地方，是仙俠小說與動畫：主角從凡人開始，一關一關修上去，最後渡劫成仙。",
        ],
      },
      {
        h: "升級之路：築基、金丹、渡劫",
        ps: ["仙俠小說把修煉寫得像打遊戲一樣，每一級都有名字："],
        items: [
          ["築基", "打好根基。像蓋房子先打地基，身體與心境都要先穩下來。"],
          ["結金丹", "在體內凝出一顆金丹，代表修為有了實體的憑據。"],
          ["渡天劫", "天雷劈下，過了就突破，沒過就身死。最難的一關，也是故事最好看的一關。"],
        ],
        after: "每一關都是自己修出來的，不是別人給的。這正是修仙故事吸引人的地方。",
      },
      {
        h: "「我命由我不由天」",
        ps: [
          "這句話是修仙故事的精神。它的意思不是人可以控制一切，而是命運不該全交給天：認清自己的位置，然後在自己的位置上盡力而為。",
          "很多人把這句話當座右銘。人生被打擊的時候，對自己說一句「這是我的修煉」，有時候真的能讓人再站起來。",
        ],
      },
      {
        h: "向內修，還是向外求",
        ps: [
          "西方求長生，往往向外找一件東西：煉金術的賢者之石、青春之泉。找到那件東西，就能不老不死。",
          "中國的修仙是向內修：煉自己的身體、呼吸與心，一層一層來。奇蹟不在物件裡，在人自己身上。",
          "兩邊沒有高下，只是把奇蹟放的地方不同。一個相信外物，一個相信自己。",
        ],
      },
      {
        h: "在昭梧怎麼看：分開看",
        ps: [
          "修仙是文化故事，不是算命方法。它不會改變任何人的八字、喜用、格局或大運。八字排的是出生那一刻的結構；修仙講的是人面對命運的姿態。兩件事可以並存，但不要互相代替。",
          "昭梧的命書看結構，修仙看心境。認清結構，再在結構裡盡力而為——這一點，兩邊其實說的是同一件事。",
        ],
      },
      {
        h: "靈感來源",
        ps: [
          "本文的靈感來自 Josie Explains China 的一條短片，內容為昭梧原創整理，不是原片逐字稿。",
        ],
      },
    ],
    faqH: "常見問題",
    faq: [
      ["修仙真的可以成仙嗎？", "作為文化與小說傳統，它是一種想像與修行觀，沒有科學證據說人可以靠修煉不死。把它當作故事與心境來讀就好。"],
      ["修仙會改變我的八字嗎？", "不會。八字是出生時間的結構紀錄；修仙是後天的態度與故事，兩者分開看。"],
      ["「我命由我不由天」是不是說命運完全由自己控制？", "不是。它說的是態度，不把命運全交給天；結構與時運仍有它的位置。認清結構，再盡力而為。"],
    ],
    quizLabel: "去玩修仙命格靈測",
    quizNote: "趣味世界觀測驗，結果不影響正式命書結論。",
    ctaChart: "產生完整命盤",
    ctaBack: "回知識庫",
  },
  "zh-Hans": {
    eyebrow: "文化随笔 · 仙侠世界观",
    h1: "修仙：把命运修在自己手里",
    lead: "两千多年来，中国有一种想法：人可以靠自己修炼成仙。从道教修行到今天的仙侠小说，这个想法变成一句话——命运可以自己修。",
    sections: [
      {
        h: "修仙是什么",
        ps: [
          "大多数文化都接受一件事：人会生、会老、会死。但在中国的道教传统里，一直有另一种想法：人可以通过修炼，成为仙人。修的是自己的身体、呼吸与心，一层一层往上走。",
          "这不是科学结论，而是一种流传了两千多年的文化想象。今天它最常出现的地方，是仙侠小说与动画：主角从凡人开始，一关一关修上去，最后渡劫成仙。",
        ],
      },
      {
        h: "升级之路：筑基、金丹、渡劫",
        ps: ["仙侠小说把修炼写得像打游戏一样，每一级都有名字："],
        items: [
          ["筑基", "打好根基。像盖房子先打地基，身体与心境都要先稳下来。"],
          ["结金丹", "在体内凝出一颗金丹，代表修为有了实体的凭据。"],
          ["渡天劫", "天雷劈下，过了就突破，没过就身死。最难的一关，也是故事最好看的一关。"],
        ],
        after: "每一关都是自己修出来的，不是别人给的。这正是修仙故事吸引人的地方。",
      },
      {
        h: "「我命由我不由天」",
        ps: [
          "这句话是修仙故事的精神。它的意思不是人可以控制一切，而是命运不该全交给天：认清自己的位置，然后在自己的位置上尽力而为。",
          "很多人把这句话当座右铭。人生被打击的时候，对自己说一句“这是我的修炼”，有时候真的能让人再站起来。",
        ],
      },
      {
        h: "向内修，还是向外求",
        ps: [
          "西方求长生，往往向外找一件东西：炼金术的贤者之石、青春之泉。找到那件东西，就能不老不死。",
          "中国的修仙是向内修：炼自己的身体、呼吸与心，一层一层来。奇迹不在物件里，在人自己身上。",
          "两边没有高下，只是把奇迹放的地方不同。一个相信外物，一个相信自己。",
        ],
      },
      {
        h: "在昭梧怎么看：分开看",
        ps: [
          "修仙是文化故事，不是算命方法。它不会改变任何人的八字、喜用、格局或大运。八字排的是出生那一刻的结构；修仙讲的是人面对命运的姿态。两件事可以并存，但不要互相代替。",
          "昭梧的命书看结构，修仙看心境。认清结构，再在结构里尽力而为——这一点，两边其实说的是同一件事。",
        ],
      },
      {
        h: "灵感来源",
        ps: [
          "本文的灵感来自 Josie Explains China 的一条短片，内容为昭梧原创整理，不是原片逐字稿。",
        ],
      },
    ],
    faqH: "常见问题",
    faq: [
      ["修仙真的可以成仙吗？", "作为文化与小说传统，它是一种想象与修行观，没有科学证据说人可以靠修炼不死。把它当作故事与心境来读就好。"],
      ["修仙会改变我的八字吗？", "不会。八字是出生时间的结构纪录；修仙是后天的态度与故事，两者分开看。"],
      ["「我命由我不由天」是不是说命运完全由自己控制？", "不是。它说的是态度，不把命运全交给天；结构与时运仍有它的位置。认清结构，再尽力而为。"],
    ],
    quizLabel: "去玩修仙命格灵测",
    quizNote: "趣味世界观测验，结果不影响正式命书结论。",
    ctaChart: "产生完整命盘",
    ctaBack: "回知识库",
  },
  en: {
    eyebrow: "CULTURAL ESSAY · XIANXIA WORLDVIEW",
    h1: "Cultivation: Holding Your Destiny in Your Own Hands",
    lead: "For over two thousand years, China has held an idea: a person can train to become an immortal. From Daoist practice to today's xianxia novels, it has become one line — destiny can be cultivated by your own hand.",
    sections: [
      {
        h: "What is cultivation?",
        ps: [
          "Most cultures accept one thing: people are born, age and die. But in China's Daoist tradition there has always been another idea: a person can train to become an immortal, refining their own body, breath and mind, one layer at a time.",
          "This is not a scientific conclusion. It is a cultural imagination more than two thousand years old. Today it lives most often in xianxia novels and animation: the hero starts as an ordinary person, passes one trial after another, and finally survives the heavenly tribulation to become an immortal.",
        ],
      },
      {
        h: "The levelling path: Foundation, Golden Core, Tribulation",
        ps: ["Xianxia novels write cultivation like a game, with a name for every level:"],
        items: [
          ["Foundation Building", "Lay the groundwork. Like a house needs solid foundations, body and mind must settle first."],
          ["Golden Core", "A golden core condenses inside the body — proof that the training has become something real."],
          ["Heavenly Tribulation", "Heavenly lightning strikes. Survive it and you break through; fail and you die. The hardest trial, and the best part of the story."],
        ],
        after: "Every stage is earned by one's own training, not given by anyone else. That is what makes these stories so compelling.",
      },
      {
        h: "“My fate is mine, not heaven's”",
        ps: [
          "This line is the spirit of cultivation stories. It does not mean a person can control everything. It means fate should not be handed entirely to heaven: know where you stand, then do your best from exactly there.",
          "Many people keep this line as a motto. When life hits hard, telling yourself “this is my training” can genuinely help you stand up again.",
        ],
      },
      {
        h: "Refine inward, or seek outward?",
        ps: [
          "When the West seeks long life, it usually looks outward for an object: the Philosopher's Stone of alchemy, the Fountain of Youth. Find the object, and you need never grow old or die.",
          "Chinese cultivation refines inward: your own body, breath and mind, layer by layer. The miracle is not in an object. It is in the person.",
          "Neither side is above the other. They simply place the miracle in different places — one in a thing, one in oneself.",
        ],
      },
      {
        h: "How Zhaowu sees it: keep them separate",
        ps: [
          "Cultivation is a cultural story, not a method of fortune-telling. It changes no one's BaZi chart, favourable elements, structure or luck cycles. A BaZi chart records the structure of the moment of birth; cultivation speaks of the attitude a person takes toward fate. The two can coexist, but one must never stand in for the other.",
          "Zhaowu's destiny book reads structure; cultivation reads state of mind. Know the structure, then do your best within it — on that point, the two are really saying the same thing.",
        ],
      },
      {
        h: "Source of inspiration",
        ps: [
          "This essay was inspired by a short video from Josie Explains China. The text is Zhaowu's own original writing, not a transcript of the video.",
        ],
      },
    ],
    faqH: "Common questions",
    faq: [
      ["Can cultivation really make someone an immortal?", "As a cultural and literary tradition, it is an imagination and a view of practice. There is no scientific evidence that training can make a person deathless. Read it as story and state of mind."],
      ["Does cultivation change my BaZi chart?", "No. A BaZi chart is a structural record of birth time; cultivation is an attitude and a story from later in life. Keep them separate."],
      ["Does “my fate is mine, not heaven's” mean destiny is fully under my control?", "No. It speaks of attitude — not handing fate entirely to heaven — while structure and timing still hold their place. Know the structure, then do your best."],
    ],
    quizLabel: "Try the Cultivation Destiny quiz",
    quizNote: "A light-hearted worldview quiz. Its result does not affect any formal destiny-book conclusion.",
    ctaChart: "Create complete chart",
    ctaBack: "Back to Knowledge",
  },
};

function XiuxianCultivationArticle() {
  const { locale } = useI18n();
  const key: L = locale === "zh-Hant" || locale === "zh-Hans" ? locale : "en";
  const t = CONTENT[key];

  return (
    <main className="mx-auto max-w-4xl space-y-5 pb-16" data-xiuxian-cultivation-page>
      <article className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <p className="text-xs tracking-[0.26em] text-cinnabar">{t.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">{t.h1}</h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-ink-soft">{t.lead}</p>
      </article>

      {t.sections.map((section, i) => (
        <section key={section.h} className={`seal-border rounded-2xl p-5 sm:p-8 ${i % 2 === 0 ? "bg-cream" : "bg-paper"}`}>
          <h2 className="font-display text-2xl text-ink">{section.h}</h2>
          <div className="mt-4 space-y-3 text-[15px] leading-8 text-ink-soft">
            {section.ps.map((p) => <p key={p}>{p}</p>)}
          </div>
          {section.items ? (
            <ol className="mt-4 space-y-3">
              {section.items.map(([name, text], j) => (
                <li key={name} className="rounded-xl border border-earth/25 bg-paper px-4 py-3">
                  <p className="text-sm font-semibold text-ink"><span className="mr-2 text-cinnabar">{j + 1}</span>{name}</p>
                  <p className="mt-1 text-[15px] leading-7 text-ink-soft">{text}</p>
                </li>
              ))}
            </ol>
          ) : null}
          {section.after ? <p className="mt-4 text-[15px] font-medium leading-8 text-ink">{section.after}</p> : null}
          {i === t.sections.length - 1 ? (
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              <a
                href="https://www.instagram.com/reel/DdpP9d6hycd/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                Josie Explains China · Instagram Reel
              </a>
            </p>
          ) : null}
        </section>
      ))}

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8" data-faq>
        <h2 className="font-display text-2xl text-ink">{t.faqH}</h2>
        <div className="mt-4 space-y-4">
          {t.faq.map(([q, a]) => (
            <div key={q}>
              <h3 className="text-base font-semibold text-ink">{q}</h3>
              <p className="mt-1 text-[15px] leading-8 text-ink-soft">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <a href="/quiz/cultivation-destiny" className="seal-border flex min-h-14 flex-col items-start justify-center rounded-2xl bg-cream px-5 py-4 text-sm text-ink">
          <span>{t.quizLabel}<span className="text-cinnabar"> →</span></span>
          <span className="mt-1 text-xs leading-5 text-ink-soft">{t.quizNote}</span>
        </a>
        <Link to="/knowledge" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-paper px-5 py-4 text-sm text-ink">
          <span>{t.ctaBack}</span>
          <span className="text-cinnabar">→</span>
        </Link>
      </div>

      <a href="/#birth-form" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-cream px-5 py-4 text-sm text-ink">
        <span>{t.ctaChart}</span>
        <span className="text-cinnabar">→</span>
      </a>
    </main>
  );
}
