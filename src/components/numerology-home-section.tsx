import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

type NumerologySection = {
  heading?: string;
  body: string;
};

export function NumerologyHomeSection() {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);

  const copy = useMemo(() => {
    if (locale === "en") {
      return {
        kicker: "STONE · NUMEROLOGY",
        groupTitle: "Numerology",
        groupLead: "A symbolic self-reflection lens based on number traditions. It stays separate from Zhaowu’s BaZi reading.",
        articleTitle: "Do You Have a Master Number?",
        articleSummary: "In numerology, 11, 22 and 33 are commonly kept as Master Numbers rather than reduced immediately. The point is not to rank people, but to reflect on potential, responsibility and recurring life lessons.",
        read: "Read this note",
        collapse: "Close",
        sections: [
          {
            body: "In numerology, three double-digit numbers are often treated as distinctive: 11, 22 and 33. When one of them appears while adding the digits of a birth date, many numerology traditions keep that number instead of immediately reducing it again. They are often called Master Numbers. This does not mean someone is more gifted or more important than everyone else. A more useful framing is stronger potential × greater responsibility × deeper lessons to work through.",
          },
          {
            heading: "11 · The Inspirer",
            body: "Keywords: intuition · inspiration · insight · creativity. Eleven combines the independence and initiative associated with 1 with the sensitivity and receptiveness associated with 2. People who identify with 11 are often described as quick to notice atmosphere, subtle emotional changes and possibilities other people miss. That sensitivity may support art, creative work, reflection and the ability to inspire others. The same sensitivity can also become overthinking, emotional overload or self-doubt. The practical lesson is to trust your perception without absorbing everything around you: build emotional boundaries and turn sensitivity into something useful rather than letting it become constant noise.",
          },
          {
            heading: "22 · The Builder",
            body: "Keywords: vision · organisation · execution · long-term building. Twenty-two is commonly described as combining the cooperative intuition of 2 with the structure, practicality and follow-through associated with 4. Its central image is not simply having a large dream, but being able to turn an abstract plan into something that exists in the real world. The challenge is scale: very large plans, high standards and fear of failure can make the first step feel too small or too risky. The practical lesson is to stop treating the final result as one enormous task. Break the vision into stages, manage pace and build it one concrete step at a time.",
          },
          {
            heading: "33 · The Healer / Guide",
            body: "Keywords: love · empathy · service · healing. Thirty-three is often read as combining the creativity, expression and influence associated with 3 with the care, responsibility and love associated with 6. People who identify with 33 may naturally become listeners, carers, teachers or guides because they quickly notice what other people need. The shadow is over-responsibility: helping can quietly turn into carrying everyone, interfering too much or sacrificing yourself until there is nothing left. The practical lesson is balance. Caring for other people does not require abandoning your own limits. Sustainable support works better when the person giving it still has energy, choice and a life of their own.",
          },
          {
            heading: "11 sees · 22 builds · 33 supports",
            body: "A compact way to remember the three is this: 11 notices possibilities that are not obvious yet; 22 turns possibilities into concrete structures; 33 uses care and influence to support people and relationships. None of these descriptions is automatically positive. Greater sensitivity can mean greater tension, bigger vision can create heavier pressure, and stronger care can become self-sacrifice. The number is only useful when it helps you notice how you actually behave.",
          },
          {
            heading: "How is a Master Number calculated?",
            body: "A common simple method is to add every digit in the full birth date, then keep reducing the total by adding its digits. If 11, 22 or 33 appears during that process, it is usually retained rather than reduced again. Numerology schools do not all calculate in exactly the same way, so Zhaowu presents this as a symbolic self-reflection method rather than a scientific measurement or a fixed prediction of fate.",
          },
          {
            heading: "The question that matters more",
            body: "If you get 11, 22 or 33, the useful question is not “Am I chosen?” but “How am I going to use this pattern?” Numbers can act as a mirror for self-observation. They do not make decisions for you. Direction still comes from your choices, habits and actions.",
          },
        ] as NumerologySection[],
        disclaimer: "Numerology is a symbolic self-reflection tool, not a scientific finding or a guarantee of fate.",
      };
    }

    if (locale === "zh-Hans") {
      return {
        kicker: "STONE · 生命灵数",
        groupTitle: "生命灵数",
        groupLead: "把数字当成认识自己的象征性镜子；独立于昭梧的八字主判，不混成一套结论。",
        articleTitle: "你是少见的「大师数／卓越数」吗？",
        articleSummary: "生命灵数中，11、22、33 常被称为 Master Numbers。重点不是谁比谁高级，而是借这三组数字观察潜能、责任与反复出现的人生课题。",
        read: "展开阅读",
        collapse: "收起",
        sections: [
          {
            body: "在生命灵数中，有三组数字相当特别：11、22、33。当生日数字加总的过程中出现这三组双位数时，许多生命灵数体系会把它们称为 Master Numbers，也常翻成「大师数／卓越数」，并先保留数字本身，不急着继续简化。它们并不代表「比别人更优秀」，更适合把它理解成一种象征：更强的潜能 × 更大的责任感 × 更深的人生课题。真正有价值的，不是替自己贴上一个稀有标签，而是看清这组数字提醒你怎样使用自己的能力。",
          },
          {
            heading: "11｜启蒙者 The Inspirer",
            body: "关键词：直觉・灵感・洞察・创造。11 结合了「1」的独立、开创与自主，也带有「2」的敏锐、感受力与接收性。11 号常被形容为对环境、人际气氛和细微情绪变化特别敏感，也比较容易看见别人还没有注意到的可能，因此在艺术、创意、表达、心灵探索或启发他人的事情上，往往很容易找到共鸣。但感受得越多，也越可能想得太多；敏感一旦没有边界，就会变成情绪过载、神经紧绷或不断怀疑自己。11 的课题不是关闭直觉，而是相信自己的感受，同时建立情绪与心理边界。不是把所有人的情绪都吸进来，而是把敏锐转成真正能照亮自己、也能帮助别人的能力。",
          },
          {
            heading: "22｜建造者 The Builder",
            body: "关键词：愿景・组织・执行・落地。22 常被理解为把「2」的协调、直觉与合作能力，与「4」的秩序、稳定、组织和实务精神结合起来。它最核心的象征不是「很会做梦」，而是有机会把宏大的想法拆成结构，再一步一步变成现实。22 号人可能拥有很大的愿景、长远的眼光，以及把抽象概念变成具体成果的能力；但也因为目标大、标准高，很容易出现另一面：计划铺得太大、担心失败、一直等待最完整的时机，最后反而迟迟没有踏出第一步。22 的课题，是不要只盯着终点。把目标拆解、安排阶段、管理节奏，用稳定执行代替一次到位的压力。梦想真正落地，不靠一直想得更完整，而靠一块一块把它盖起来。",
          },
          {
            heading: "33｜疗愈者／导师 The Healer",
            body: "关键词：爱・同理・奉献・疗愈。33 结合了「3」的创造、表达与感染力，以及「6」的关怀、责任与爱。33 号常被形容为很容易察觉别人的需要，拥有较强的同理心，也可能自然成为朋友眼中的倾听者、照顾者、老师或引导者。你希望身边的人都能变得更好，甚至会忍不住替别人承担。但爱别人，不等于必须牺牲自己。33 最重要的课题，是在付出与自我照顾之间找到平衡：尊重别人的课题与选择，不把所有责任都扛到自己身上。真正长久的疗愈，不是耗尽自己去照亮所有人，而是自己的心里也始终留着一盏灯。",
          },
          {
            heading: "11 看见・22 建造・33 影响",
            body: "可以把三组数字简单记成：11 看见别人尚未看见的可能；22 把可能一步一步变成现实；33 用爱、表达与影响力让关系和环境变得更温柔。但大师数带来的从来不只有「天赋」。更敏锐，往往也意味着更强烈的内在拉扯；目标更大，也可能伴随更高的自我要求；更会照顾别人，也更容易忘记自己。数字只有在你能看见它的两面时，才真正有参考价值。",
          },
          {
            heading: "怎么计算大师数？",
            body: "一种常见而直观的算法，是把出生年月日里的所有数字相加，再把得到的总数继续逐位相加；如果在这个过程中出现 11、22 或 33，通常先保留，不再继续化成个位数。不同生命灵数流派的具体算法并不完全一致，因此昭梧在这里把它作为象征性的自我探索工具，而不是科学测量，也不把它混入八字主判。",
          },
          {
            heading: "比「我是不是天选之人」更重要的问题",
            body: "如果你算出了 11、22 或 33，不需要急着问自己是不是更特别。更值得问的是：「这份能量，我准备怎么使用？」数字可以提供一面认识自己的镜子，但真正决定人生方向的，始终是你的选择、习惯与行动。",
          },
        ] as NumerologySection[],
        disclaimer: "生命灵数属于象征性的自我探索工具，不代表科学定论或命运保证。",
      };
    }

    return {
      kicker: "STONE · 生命靈數",
      groupTitle: "生命靈數",
      groupLead: "把數字當成認識自己的象徵性鏡子；獨立於昭梧的八字主判，不混成一套結論。",
      articleTitle: "你是少見的「大師數／卓越數」嗎？",
      articleSummary: "生命靈數中，11、22、33 常被稱為 Master Numbers。重點不是誰比誰高級，而是借這三組數字觀察潛能、責任與反覆出現的人生課題。",
      read: "展開閱讀",
      collapse: "收起",
      sections: [
        {
          body: "在生命靈數中，有三組數字相當特別：11、22、33。當生日數字加總的過程中出現這三組雙位數時，許多生命靈數體系會把它們稱為 Master Numbers，也常翻成「大師數／卓越數」，並先保留數字本身，不急著繼續簡化。它們並不代表「比別人更優秀」，更適合把它理解成一種象徵：更強的潛能 × 更大的責任感 × 更深的人生課題。真正有價值的，不是替自己貼上一個稀有標籤，而是看清這組數字提醒你怎樣使用自己的能力。",
        },
        {
          heading: "11｜啟蒙者 The Inspirer",
          body: "關鍵字：直覺・靈感・洞察・創造。11 結合了「1」的獨立、開創與自主，也帶有「2」的敏銳、感受力與接收性。11 號常被形容為對環境、人際氣氛和細微情緒變化特別敏感，也比較容易看見別人還沒有注意到的可能，因此在藝術、創意、表達、心靈探索或啟發他人的事情上，往往很容易找到共鳴。但感受得越多，也越可能想得太多；敏感一旦沒有邊界，就會變成情緒過載、神經緊繃或不斷懷疑自己。11 的課題不是關閉直覺，而是相信自己的感受，同時建立情緒與心理邊界。不是把所有人的情緒都吸進來，而是把敏銳轉成真正能照亮自己、也能幫助別人的能力。",
        },
        {
          heading: "22｜建造者 The Builder",
          body: "關鍵字：願景・組織・執行・落地。22 常被理解為把「2」的協調、直覺與合作能力，與「4」的秩序、穩定、組織和實務精神結合起來。它最核心的象徵不是「很會做夢」，而是有機會把宏大的想法拆成結構，再一步一步變成現實。22 號人可能擁有很大的願景、長遠的眼光，以及把抽象概念變成具體成果的能力；但也因為目標大、標準高，很容易出現另一面：計畫鋪得太大、擔心失敗、一直等待最完整的時機，最後反而遲遲沒有踏出第一步。22 的課題，是不要只盯著終點。把目標拆解、安排階段、管理節奏，用穩定執行代替一次到位的壓力。夢想真正落地，不靠一直想得更完整，而靠一塊一塊把它蓋起來。",
        },
        {
          heading: "33｜療癒者／導師 The Healer",
          body: "關鍵字：愛・同理・奉獻・療癒。33 結合了「3」的創造、表達與感染力，以及「6」的關懷、責任與愛。33 號常被形容為很容易察覺別人的需要，擁有較強的同理心，也可能自然成為朋友眼中的傾聽者、照顧者、老師或引導者。你希望身邊的人都能變得更好，甚至會忍不住替別人承擔。但愛別人，不等於必須犧牲自己。33 最重要的課題，是在付出與自我照顧之間找到平衡：尊重別人的課題與選擇，不把所有責任都扛到自己身上。真正長久的療癒，不是耗盡自己去照亮所有人，而是自己的心裡也始終留著一盞燈。",
        },
        {
          heading: "11 看見・22 建造・33 影響",
          body: "可以把三組數字簡單記成：11 看見別人尚未看見的可能；22 把可能一步一步變成現實；33 用愛、表達與影響力讓關係和環境變得更溫柔。但大師數帶來的從來不只有「天賦」。更敏銳，往往也意味著更強烈的內在拉扯；目標更大，也可能伴隨更高的自我要求；更會照顧別人，也更容易忘記自己。數字只有在你能看見它的兩面時，才真正有參考價值。",
        },
        {
          heading: "怎麼計算大師數？",
          body: "一種常見而直觀的算法，是把出生年月日裡的所有數字相加，再把得到的總數繼續逐位相加；如果在這個過程中出現 11、22 或 33，通常先保留，不再繼續化成個位數。不同生命靈數流派的具體算法並不完全一致，因此昭梧在這裡把它作為象徵性的自我探索工具，而不是科學測量，也不把它混入八字主判。",
        },
        {
          heading: "比「我是不是天選之人」更重要的問題",
          body: "如果你算出了 11、22 或 33，不需要急著問自己是不是更特別。更值得問的是：「這份能量，我準備怎麼使用？」數字可以提供一面認識自己的鏡子，但真正決定人生方向的，始終是你的選擇、習慣與行動。",
        },
      ] as NumerologySection[],
      disclaimer: "生命靈數屬於象徵性自我探索工具，不代表科學定論或命運保證。",
    };
  }, [locale]);

  return (
    <section
      id="numerology"
      data-numerology-section
      className="mb-5 scroll-mt-20 rounded-2xl border border-line/80 bg-[#f8f3e8] px-5 py-5 shadow-[0_10px_28px_rgba(86,62,31,0.06)] sm:px-7"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
        aria-controls="numerology-master-number-note"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-medium tracking-[0.22em] text-cinnabar">{copy.kicker}</span>
          <span className="mt-1 block font-display text-2xl tracking-[0.07em] text-ink">{copy.groupTitle}</span>
          <span className="mt-1 block text-xs leading-5 text-ink-mute">{copy.groupLead}</span>
        </span>
        <span className="shrink-0 text-lg text-cinnabar" aria-hidden>{open ? "−" : "+"}</span>
      </button>

      <div className="mt-4 border-t border-line/70 pt-4">
        <h3 className="font-display text-xl font-semibold leading-8 text-ink">✨ {copy.articleTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{copy.articleSummary}</p>

        {open ? (
          <div id="numerology-master-number-note" className="mt-5 border-l border-cinnabar/20 pl-4 text-[15px] leading-8 text-ink">
            {copy.sections.map((section, index) => (
              <div key={`${section.heading ?? "intro"}-${index}`} className={index ? "mt-6" : ""}>
                {section.heading ? <h4 className="font-display text-lg font-semibold leading-7 text-ink">{section.heading}</h4> : null}
                <p className={section.heading ? "mt-2" : ""}>{section.body}</p>
              </div>
            ))}
            <p className="mt-6 border-t border-line/70 pt-4 text-xs leading-6 text-ink-mute">{copy.disclaimer}</p>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-4 min-h-11 text-xs font-medium tracking-[0.08em] text-cinnabar"
        aria-expanded={open}
        aria-controls="numerology-master-number-note"
      >
        {open ? copy.collapse : `${copy.read} ›`}
      </button>
    </section>
  );
}
