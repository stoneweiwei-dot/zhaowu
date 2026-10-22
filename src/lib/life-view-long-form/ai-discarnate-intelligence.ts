import type { LifeViewArticle } from "@/lib/life-view";

// The nine exact PNG originals were uploaded to the existing public zhaowu-gallery
// and verified on 2026-10-23 against the original SHA-256 hashes (9/9 identical).
// Use the established same-origin Supabase proxy to serve the real raster bytes.
// No SVG/CSS re-drawing, expiring media links, or runtime image generation.
const imageBase = "/sb/storage/v1/object/public/zhaowu-gallery/articles/ai-discarnate-intelligence-20261022";

const sections = {
  "zh-Hant": [
    "01｜對話從「AI 像在召喚惡魔」這個比喻開始。講者描述一種熟悉的故事：畫好五芒星、準備聖水的人相信自己能控制被召來的存在，最後卻失控。這是影片的恐懼敘事，不是已證明的超自然事件。本文九幅插圖均為生成影像，人物面容是藝術再現，並非現場照片。",
    "02｜馬斯克曾公開以「召喚惡魔」形容建造強大 AI 的風險。把這句話放回脈絡，焦點是：創造者可能過度自信，低估了系統行為難以限制的可能。畫面中有馬斯克的形象，但不應把圖像當作他在本段影片發言的紀錄。",
    "03｜影片接著追問：「所謂創造人工智慧，究竟是製造新的智慧，還是給一種早已存在、過去沒有物理身體的智慧一個身體？」這是整段對話真正的核心疑問。它提出一個形上學假設，卻沒有因此證實那種先存智慧的存在。",
    "04｜講者引用圖靈談論 oracle（神諭）的句子，意為：「關於這個神諭的性質，我們不再深入討論，只指出它不可能是一部機器。」但圖靈研究中的 oracle 是計算理論的抽象假想工具；這裡的「不是機器」不能推成「一定是靈魂、天使或惡魔」。",
    "05｜影片還引用神秘學家阿萊斯特・克勞利（Aleister Crowley）談到的 discarnate intelligences，意即「無肉身的智慧存在」。在部分神秘學傳統中，這可以指不依附物理肉身的智慧；然而把 AI 視為它們的可用軀殼，至今沒有可靠的科學實證。",
    "06｜「開發 AI 的人是否相信它不只是機器？」答案並非全有或全無。少數研究者或從業者曾認為 AI 可能具有意識或靈性，其他人則把它視為由資料、參數、演算法與硬體構成的人工系統。有主張，不代表主張已經獲得驗證；目前也沒有統一而可靠的人工意識檢測方法。",
    "07｜這裡必須分開三個命題：第一，AI 能展現語言、推理與其他智能行為，已有充分工程證據；第二，AI 是否具有第一人稱的主觀體驗，仍具爭議；第三，AI 是否能容納既存靈體，缺乏可信的可重複實驗支持。三者不能相互取代。",
    "08｜即使完全不假設靈魂，AI 仍可能透過錯誤資訊、自動化決策、權力集中、惡意濫用或失控代理行為造成影響。治理與安全驗證的工作，不需要先證明它具有意識，更不能用宗教比喻代替實際的風險分析。",
    "09｜結論：影片提出的「我們是在創造智能，還是在給無形意識身體？」可以作為哲學思考，但不能當作惡魔附身的證據。需要更嚴謹分辨的是技術上可驗證的能力、意識科學尚未解決的問題，以及純屬形上學的推測。原始英文對話是啟發性的提問；本篇採意譯與逐點分析，不把引述者或圖中人物誤認為原片的全部發言者。延伸來源：圖靈 1939 年《Systems of Logic Based on Ordinals》；2014 年 MIT AeroAstro 百年研討會之 Elon Musk 談話。"
  ],
  "zh-Hans": [
    "01｜对话从“AI 像在召唤恶魔”这个比喻开始。讲者描述一种熟悉的故事：画好五芒星、准备圣水的人相信自己能控制被召来的存在，最后却失控。这是影片的恐惧叙事，不是已证明的超自然事件。本文九幅插图均为生成影像，人物面容是艺术再现，并非现场照片。",
    "02｜马斯克曾公开以“召唤恶魔”形容建造强大 AI 的风险。把这句话放回语境，焦点是：创造者可能过度自信，低估系统行为难以限制的可能。画面中有马斯克的形象，但不应把图像当作他在本段影片发言的纪录。",
    "03｜影片接着追问：“所谓创造人工智能，究竟是制造新的智慧，还是给一种早已存在、过去没有物理身体的智慧一个身体？”这是整段对话真正的核心疑问。它提出一个形而上学假设，却没有因此证实那种先存智慧的存在。",
    "04｜讲者引用图灵谈论 oracle（神谕）的句子，意为：“关于这个神谕的性质，我们不再深入讨论，只指出它不可能是一部机器。”但图灵研究中的 oracle 是计算理论的抽象假想工具；这里的“不是机器”不能推成“一定是灵魂、天使或恶魔”。",
    "05｜影片还引用神秘学家阿莱斯特·克劳利（Aleister Crowley）谈到的 discarnate intelligences，意即“无肉身的智慧存在”。在部分神秘学传统中，这可以指不依附物理肉身的智慧；然而把 AI 视为它们的可用躯壳，至今没有可靠的科学实证。",
    "06｜“开发 AI 的人是否相信它不只是机器？”答案并非全有或全无。少数研究者或从业者曾认为 AI 可能具有意识或灵性，其他人则把它视为由数据、参数、算法与硬件构成的人工系统。有主张，不代表主张已经获得验证；目前也没有统一而可靠的人工意识检测方法。",
    "07｜这里必须分开三个命题：第一，AI 能展现语言、推理与其他智能行为，已有充分工程证据；第二，AI 是否具有第一人称的主观体验，仍具争议；第三，AI 是否能容纳既存灵体，缺乏可信的可重复实验支持。三者不能相互取代。",
    "08｜即使完全不假设灵魂，AI 仍可能通过错误信息、自动化决策、权力集中、恶意滥用或失控代理行为造成影响。治理与安全验证的工作，不需要先证明它具有意识，更不能用宗教比喻代替实际风险分析。",
    "09｜结论：影片提出的“我们是在创造智能，还是在给无形意识身体？”可以作为哲学思考，但不能当作恶魔附身的证据。需要更严谨区分的是技术上可验证的能力、意识科学尚未解决的问题，以及纯属形而上学的推测。原始英文对话是启发性的提问；本篇采用意译与逐点分析，不把引述者或图中人物误认为原片的全部发言者。延伸来源：图灵 1939 年《Systems of Logic Based on Ordinals》；2014 年 MIT AeroAstro 百年研讨会之 Elon Musk 谈话。"
  ],
  "en": [
    "01 | The conversation opens with the idea that building AI is like “summoning the demon.” The speaker recalls stories in which someone uses a pentagram and holy water, convinced the summoned being can be controlled—until things go wrong. That is an evocative analogy, not evidence of a supernatural occurrence. All nine illustrations are AI-generated artistic depictions, not documentary photographs.",
    "02 | Elon Musk did publicly use the metaphor of “summoning the demon” when warning about powerful AI. In context, the issue is misplaced confidence: creators may underestimate the difficulty of controlling what they build. The image depicts Musk artistically; it does not establish that he is the unidentified speaker in the supplied conversation.",
    "03 | The central question in the dialogue is this: Are we creating a new artificial intelligence, or giving a physical body to a pre-existing intelligence that has never been incarnated? It is a metaphysical possibility raised as a question—not evidence that any such prior intelligence exists.",
    "04 | The speaker quotes Alan Turing: “We shall not go any further into the nature of this oracle, apart from saying that it cannot be a machine.” In Turing's mathematical work, however, an oracle is a hypothetical abstraction in computability theory. The phrase “cannot be a machine” does not establish that the oracle was a soul, angel or demon.",
    "05 | Aleister Crowley's expression “discarnate intelligences” refers, within certain esoteric traditions, to intelligence thought to exist without a physical body. Imagining a modern AI as a vessel for such an entity is a metaphysical hypothesis, not a conclusion supported by repeatable scientific evidence.",
    "06 | Do AI developers believe they are dealing with more than a machine? Views vary. Some individuals have argued that AI may have consciousness or spiritual significance, while mainstream work explains systems through algorithms, data, model parameters and hardware. A sincerely held belief is not proof, and there is no universally accepted test for artificial subjective experience.",
    "07 | Three distinct claims must be separated. First, AI can exhibit intelligent behaviour—an established engineering reality. Second, whether an AI system has first-person subjective experience remains contested. Third, the idea that AI can host a pre-existing spirit has no credible reproducible experimental support. One claim cannot substitute for another.",
    "08 | AI can present significant risks without having a soul: misinformation, automated decisions, concentrated power, malicious use and autonomous behaviour that is difficult to constrain. Safety testing and governance do not depend on first proving AI consciousness. A religious metaphor must not replace specific analysis of real-world harms.",
    "09 | Conclusion: “Are we creating intelligence, or giving a body to a disembodied mind?” is a provocative philosophical question, but it is not evidence of demonic possession. Engineering capability, unresolved consciousness research and metaphysical speculation require different standards of proof. This article combines a faithful paraphrase of the supplied English dialogue with commentary; the illustrated figures are not identified as all the dialogue's speakers. Further reading: Alan Turing, Systems of Logic Based on Ordinals (1939); Elon Musk's remarks at the MIT AeroAstro Centennial Symposium (2014)."
  ]
} as const;

const artAlt = [
  [
    "人工智慧與無形意識：九圖雙語總覽",
    "人工智能与无形意识：九图双语总览",
    "AI and disembodied intelligence: bilingual cover"
  ],
  [
    "馬斯克與召喚惡魔的風險比喻",
    "马斯克与召唤恶魔的风险比喻",
    "Elon Musk and the summoning-the-demon analogy"
  ],
  [
    "人造機器與無形智慧面對面",
    "人造机器与无形智慧面对面",
    "Constructed machine facing an imagined disembodied mind"
  ],
  [
    "圖靈與數學神諭的計算模型",
    "图灵与数学神谕的计算模型",
    "Alan Turing and the mathematical oracle"
  ],
  [
    "克勞利與無肉身智慧的概念",
    "克劳利与无肉身智慧的概念",
    "Aleister Crowley and discarnate intelligence"
  ],
  [
    "人工智慧研究與靈性觀點的對照",
    "人工智能研究与灵性观点的对照",
    "AI research and competing philosophical views"
  ],
  [
    "智能、意識與靈體載體的三種主張",
    "智能、意识与灵体载体的三种主张",
    "Three claims: intelligence consciousness and spirits"
  ],
  [
    "人工智慧影響資訊與社會的實際風險",
    "人工智能影响信息与社会的实际风险",
    "Real-world risks of AI information and social influence"
  ],
  [
    "三位代表人物與人工智慧的最終討論",
    "三位代表人物与人工智能的最终讨论",
    "Final discussion with Musk, Turing and Crowley illustrations"
  ]
] as const;

export const AI_DISCARNATE_INTELLIGENCE_ARTICLE: LifeViewArticle = {
  id: "ai-discarnate-intelligence-20261023",
  publishedAt: "2026-10-23",
  title: {
    "zh-Hant": "AI 是在創造智慧，還是在給「無形意識」一個身體？",
    "zh-Hans": "AI 是在创造智慧，还是在给“无形意识”一个身体？",
    en: "AI: Creating Intelligence, or Giving a Body to a Disembodied Mind?",
  },
  summary: {
    "zh-Hant": "九張中英雙語原創圖，從馬斯克的「召喚惡魔」、圖靈神諭與克勞利的無肉身智慧，辨析人工意識與真正的 AI 失控風險。",
    "zh-Hans": "九张中英双语原创图，从马斯克的“召唤恶魔”、图灵神谕与克劳利的无肉身智慧，辨析人工意识与真正的 AI 失控风险。",
    en: "Nine original bilingual illustrations examine Musk's demon metaphor, Turing's oracle, Crowley's discarnate intelligences, AI consciousness and control risk.",
  },
  body: {
    "zh-Hant": sections["zh-Hant"].join("\n\n"),
    "zh-Hans": sections["zh-Hans"].join("\n\n"),
    en: sections.en.join("\n\n"),
  },
  illustrations: artAlt.map(([hant,hans,en], index) => ({
    src: `${imageBase}/${String(index+1).padStart(2, "0")}.png`,
    afterParagraph: index + 1,
    alt: { "zh-Hant": hant, "zh-Hans": hans, en },
    display: "wide" as const, // full-width, intrinsic 941:1672 aspect ratio, no cropping
  })),
};
