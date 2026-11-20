import type { LifeViewArticle } from "@/lib/life-view";
import { TEN_GODS_RELATIONSHIP_COMIC } from "@/lib/article-media/ten-gods-relationship-comic";

type ArticleIllustration = {
  src: string;
  afterParagraph: number;
  alt: Record<"zh-Hant" | "zh-Hans" | "en", string>;
};

export const TEN_GODS_RELATIONSHIP_FRICTION_LONG_FORM: LifeViewArticle & { illustrations: ArticleIllustration[] } = {
  id: "ten-gods-relationship-friction",
  publishedAt: "2026-09-14",
  title: {
    "zh-Hant": "十神看你最容易嫌棄誰？從「不順眼」看見命局裡的關係模式",
    "zh-Hans": "十神看你最容易嫌弃谁？从“不顺眼”看见命局里的关系模式",
    en: "Who gets under your skin? Reading relationship friction through BaZi",
  },
  summary: {
    "zh-Hant": "把「看誰不順眼」從網路口訣拉回完整子平結構：先定關係十神，再看病藥、制化、歲運與現實事件，不用一顆星替一段關係下判決。",
    "zh-Hans": "把“看谁不顺眼”从网络口诀拉回完整子平结构：先定关系十神，再看病药、制化、岁运与现实事件，不用一颗星替一段关系下判决。",
    en: "A BaZi note on relationship friction: identify the relational role first, then test balance, regulation, timing and real events instead of blaming one strong factor.",
  },
  body: {
    "zh-Hant": `網路上常見一句話：看老婆不順眼是某星過旺、看同事不順眼又是另一顆星過旺。這種說法很有記憶點，但真正的子平判法不能把「某星旺」直接翻譯成「一定討厭某人」。要看的不是一顆星，而是關係十神、力量如何作用、誰在制誰，以及這個矛盾有沒有在歲運與現實中被真正引動。

這張漫畫可以當作快速取象圖，但只適合幫你記住「關係角色」與可能的摩擦方向。正式判斷仍要回到完整四柱：月令、承載、格局病藥、流通、十神戰局與歲運。單一十神、單一「過旺」或一張圖，都不能獨立定吉凶。

伴侶：不是「某星旺就嫌老婆／老公」。男命傳統上以財星作妻緣的重要觀察點，但真正要看的是財星在整局中是否受制、比劫是否形成爭奪，以及歲運有沒有把矛盾引動。比劫旺而克財時，可能表現為資源分配、控制感、價值觀或伴侶關係上的摩擦。女命論伴侶常以官殺作重要觀察點；食傷過強而直接制官殺時，可能更容易對伴侶的權威、規則與做法產生挑剔或抵觸。這些都只是結構取象，不是性格判決。

父母：先看印，再看財印關係。父母與原生家庭不能只靠一句口訣。印星常用來觀察照顧、承接、學習與長輩支持；若命局真的形成財旺壞印、印星受傷，才可能旁證「覺得長輩不理解自己」「家庭支持方式和自己需求不合」等感受。反過來，印旺也不等於一定與父母親近；印若成為命局之病，同樣可能表現成過度保護、標準壓力或難以脫離原生框架。

孩子：不能用一個「過旺」口訣一概而論。看孩子最容易被網路口訣誤導。子女星的取法、男女命差異、食傷與相關十神的狀態、宮位承載，以及整個命局是否有制化，都要一起看。若只看到一個十神旺，就直接下「看孩子不順眼」的結論，等於把完整結構壓扁成標籤。真正能說的，是某些組合可能讓親子互動更容易出現控制、消耗、期待落差或溝通摩擦；至於是否真的發生，還要回到現實與歲運驗證。

同事與上司：要分清競爭、壓力與抗權威。看同事不順眼，常見的不是「財星旺」這麼簡單，而可能是比劫帶來資源競爭、官殺帶來制度與績效壓力，或食傷與官殺衝突後產生「別人怎麼都不按我的方法做」的摩擦。看上司不順眼，則更常從傷官見官、食傷抗官等結構切入：問題可能不是討厭某個人，而是自己對規則、權力、管理方式與自主性的容忍度正在被觸發。

那「看誰都不順眼」呢？把它直接說成「火氣過旺」仍然太粗。火燥確實可以取急躁、炎上、耐受度下降之象，但真正值得看的，是整局是否燥烈、偏枯、制化失衡，或某段歲運把原本可控的壓力推到臨界點。也可能根本不是五行問題，而是現實中長期睡眠不足、工作壓力、關係耗損或環境刺激造成。命理只能提供一個觀察角度，不能替代現實原因。

相反，「看誰都順眼」也不能直接等於「運氣正旺」。當大運流年配合得比較好、內在張力下降、外部環境也比較順時，人確實可能更有餘裕、更能包容別人的差異；但這仍只是當下狀態，不是永久保證，更不是好運的唯一驗證方式。

昭梧的四步校驗是：第一，先定關係——這個人與你在命理模型裡主要落在哪一種關係角色；第二，再看病藥——相關十神究竟是命局需要的力量，還是已經成為失衡點；第三，再看制化——旺不等於壞，有沒有制、有沒有化、有沒有出口，結果完全不同；第四，最後看歲運與現實——只有當大運流年真的引動，而且現實關係也出現對應事件，才值得把取象提高權重。

命理不是教你把身邊的人貼上標籤，而是借一套結構語言，看見自己在什麼關係裡最容易被觸發。本文屬子平八字的關係取象教學。正式判斷仍以完整四柱為主：先看月令與承載，再看格局病藥、流通與十神戰局，最後才把關係象與歲運、現實事件交叉驗證。`,
    "zh-Hans": `网络上常见一句话：看老婆不顺眼是某星过旺、看同事不顺眼又是另一颗星过旺。这种说法很有记忆点，但真正的子平判法不能把“某星旺”直接翻译成“一定讨厌某人”。要看的不是一颗星，而是关系十神、力量如何作用、谁在制谁，以及这个矛盾有没有在岁运与现实中被真正引动。

这张漫画可以当作快速取象图，但只适合帮你记住“关系角色”与可能的摩擦方向。正式判断仍要回到完整四柱：月令、承载、格局病药、流通、十神战局与岁运。单一十神、单一“过旺”或一张图，都不能独立定吉凶。

伴侣：不是“某星旺就嫌老婆／老公”。男命传统上以财星作妻缘的重要观察点，但真正要看的是财星在整局中是否受制、比劫是否形成争夺，以及岁运有没有把矛盾引动。比劫旺而克财时，可能表现为资源分配、控制感、价值观或伴侣关系上的摩擦。女命论伴侣常以官杀作重要观察点；食伤过强而直接制官杀时，可能更容易对伴侣的权威、规则与做法产生挑剔或抵触。这些都只是结构取象，不是性格判决。

父母：先看印，再看财印关系。父母与原生家庭不能只靠一句口诀。印星常用来观察照顾、承接、学习与长辈支持；若命局真的形成财旺坏印、印星受伤，才可能旁证“觉得长辈不理解自己”“家庭支持方式和自己需求不合”等感受。反过来，印旺也不等于一定与父母亲近；印若成为命局之病，同样可能表现成过度保护、标准压力或难以脱离原生框架。

孩子：不能用一个“过旺”口诀一概而论。看孩子最容易被网络口诀误导。子女星的取法、男女命差异、食伤与相关十神的状态、宫位承载，以及整个命局是否有制化，都要一起看。若只看到一个十神旺，就直接下“看孩子不顺眼”的结论，等于把完整结构压扁成标签。真正能说的，是某些组合可能让亲子互动更容易出现控制、消耗、期待落差或沟通摩擦；至于是否真的发生，还要回到现实与岁运验证。

同事与上司：要分清竞争、压力与抗权威。看同事不顺眼，常见的不是“财星旺”这么简单，而可能是比劫带来资源竞争、官杀带来制度与绩效压力，或食伤与官杀冲突后产生“别人怎么都不按我的方法做”的摩擦。看上司不顺眼，则更常从伤官见官、食伤抗官等结构切入：问题可能不是讨厌某个人，而是自己对规则、权力、管理方式与自主性的容忍度正在被触发。

那“看谁都不顺眼”呢？把它直接说成“火气过旺”仍然太粗。火燥确实可以取急躁、炎上、耐受度下降之象，但真正值得看的，是整局是否燥烈、偏枯、制化失衡，或某段岁运把原本可控的压力推到临界点。也可能根本不是五行问题，而是现实中长期睡眠不足、工作压力、关系耗损或环境刺激造成。命理只能提供一个观察角度，不能替代现实原因。

相反，“看谁都顺眼”也不能直接等于“运气正旺”。当大运流年配合得比较好、内在张力下降、外部环境也比较顺时，人确实可能更有余裕、更能包容别人的差异；但这仍只是当下状态，不是永久保证，更不是好运的唯一验证方式。

昭梧的四步校验是：第一，先定关系——这个人与你在命理模型里主要落在哪一种关系角色；第二，再看病药——相关十神究竟是命局需要的力量，还是已经成为失衡点；第三，再看制化——旺不等于坏，有没有制、有没有化、有没有出口，结果完全不同；第四，最后看岁运与现实——只有当大运流年真的引动，而且现实关系也出现对应事件，才值得把取象提高权重。

命理不是教你把身边的人贴上标签，而是借一套结构语言，看见自己在什么关系里最容易被触发。本文属子平八字的关系取象教学。正式判断仍以完整四柱为主：先看月令与承载，再看格局病药、流通与十神战局，最后才把关系象与岁运、现实事件交叉验证。`,
    en: `Short online rules often claim that one strong factor explains why you dislike a spouse, coworker or boss. The rule is memorable, but serious BaZi cannot translate “this factor is strong” into “you will definitely dislike this person.” The useful question is how the relational roles interact across the whole chart, which force constrains which, and whether timing and real events actually activate the tension.

The comic below works as a quick memory aid for relationship roles and possible sources of friction. It is not a chart judgement by itself. A formal reading still returns to the complete Four Pillars: seasonal command, capacity, structural remedy, flow, Ten-God dynamics and timing. One factor, one claim of excess, or one infographic cannot decide the outcome.

Partners: there is no rule saying one strong factor means you will dislike your wife or husband. In traditional BaZi, a male chart often examines the wealth factor as an important partner indicator. The real question is whether that factor is constrained, whether peer forces create competition, and whether timing activates the conflict. In a female chart, authority factors are often important partner indicators; strong output directly challenging authority can describe greater friction with rules, control or a partner’s way of doing things. These are structural clues, not personality verdicts.

Parents: begin with support patterns, then examine how support and resources interact. Family relationships cannot be reduced to one slogan. The resource/support factor can describe care, learning and elder support. Only when the chart actually shows that support being damaged does it become a stronger clue for experiences such as feeling misunderstood or poorly supported. Strong support does not automatically mean closeness either; when excessive, it can describe overprotection, standards or difficulty leaving the family framework.

Children: this is especially easy to oversimplify. Child indicators, chart context, relevant output factors, capacity and regulation all need to be read together. Seeing one strong Ten God and concluding “you will dislike your child” turns a complete structure into a label. At most, some combinations can point to a higher chance of control struggles, exhaustion, mismatched expectations or communication friction. Whether that actually happens still needs timing and real-world confirmation.

Coworkers and bosses: separate competition, pressure and resistance to authority. Friction with coworkers can come from peer competition for resources, pressure from rules and performance expectations, or conflict between self-expression and authority. Disliking a boss may therefore reflect tension with hierarchy, management style, rules or limits on autonomy rather than a fixed dislike of one person.

What if everyone seems irritating? Reducing this to “too much fire” is still too crude. A hot, dry structure can symbolically correspond with impatience or lower tolerance, but the more useful question is whether the whole chart is dry, strained or poorly regulated, and whether a particular period pushes manageable pressure beyond its threshold. The cause may also be entirely ordinary: poor sleep, work stress, relationship strain or an overstimulating environment. BaZi can offer one observational lens; it cannot replace real causes.

Likewise, finding everyone agreeable does not prove that luck is permanently strong. A smoother period can reduce internal tension and create more room to tolerate other people’s differences, but that is a temporary state and only one signal among many.

Zhaowu uses four checks before raising the weight of any relationship clue. First, identify the relationship role. Second, ask whether the relevant factor supports the chart or contributes to imbalance. Third, test regulation and release: strength is not the same as harm, and the presence of control, transformation or an outlet changes the result. Fourth, cross-check timing and reality. Only when the relevant cycle activates the structure and the real relationship shows a corresponding event should the symbolism receive more weight.

The purpose of BaZi is not to label the people around you. It is to use a structured language to notice which kinds of relationships most easily trigger you. This article is a teaching note on relationship symbolism in Zi Ping BaZi. A formal reading still begins with the complete Four Pillars and only then cross-checks relationship patterns against timing and real events.`,
  },
  illustrations: [
    {
      src: TEN_GODS_RELATIONSHIP_COMIC,
      afterParagraph: 2,
      alt: {
        "zh-Hant": "昭梧十神關係漫畫：伴侶、父母、孩子、同事、上司與整體人際摩擦的快速取象",
        "zh-Hans": "昭梧十神关系漫画：伴侣、父母、孩子、同事、上司与整体人际摩擦的快速取象",
        en: "Zhaowu comic guide to relationship friction through the Ten Gods in BaZi",
      },
    },
  ],
};
