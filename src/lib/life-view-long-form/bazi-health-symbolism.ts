import type { LifeViewArticle } from "@/lib/life-view";

type ArticleIllustration = {
  src: string;
  afterParagraph: number;
  alt: Record<"zh-Hant" | "zh-Hans" | "en", string>;
};

export const BAZI_HEALTH_SYMBOLISM_LONG_FORM: LifeViewArticle & { illustrations: ArticleIllustration[] } = {
  id: "bazi-health-symbolism",
  publishedAt: "2026-09-09",
  title: {
    "zh-Hant": "十天干與身體象義：如何看先天體質與時間觸發",
    "zh-Hans": "十天干与身体象义：如何看先天体质与时间触发",
    en: "Ten Heavenly Stems and Body Symbolism: Constitution, Timing and Traditional Health Reading",
  },
  summary: {
    "zh-Hant": "以十天干、五行、臟腑與大運流年為框架，整理傳統命理如何觀察先天體質傾向與後天時間觸發。本文只談傳統象義，不作醫療診斷或疾病預測。",
    "zh-Hans": "以十天干、五行、脏腑与大运流年为框架，整理传统命理如何观察先天体质倾向与后天时间触发。本文只谈传统象义，不作医疗诊断或疾病预测。",
    en: "A traditional framework linking the Ten Heavenly Stems, Five Phases, organs and timing cycles. It is presented as symbolic interpretation only, not medical diagnosis or disease prediction.",
  },
  body: {
    "zh-Hant": `在傳統醫易、五行臟腑與後世命理象數的語境裡，常會把十天干與身體部位建立一組固定對應：甲膽、乙肝、丙小腸、丁心、戊胃、己脾、庚大腸、辛肺、壬膀胱、癸腎。這套對應的核心思路，是以陽干偏向六腑、陰干偏向五臟，再放回木火土金水的整體系統中理解。昭梧在公開文章中只把它當作傳統象義框架，不把它等同於現代醫學的解剖、生理或診斷結論。

如果只看十個天干名稱，很容易把它變成「哪個字少，就哪個器官差」的簡化遊戲；這種讀法不夠。八字判斷身體象義，先看的仍然是整個命局的季節、旺衰、寒暖燥濕、透干、根氣、生剋制化與承載能力。五行的「多」不必然等於健康，五行的「少」也不必然等於有病；過旺、過弱、失去流通，才是傳統命理會進一步觀察的地方。

第一層先看月令。月令代表出生時節的大環境，決定五行在當令季節中的基本氣勢。夏季火氣顯，秋季金氣顯，冬季水氣顯，春季木氣顯，季月又有土的承接。這只能告訴我們「哪股氣有季節優勢」，不能直接推出某個器官一定強或一定弱。真正的判斷仍要看它在全局中是得到生扶、受到克泄，還是旺而無制、弱而受攻。

第二層看五行是否形成偏態。若某一五行得令、得地、透干，又獲得多重生扶，傳統上會把它視為該類功能偏強；但偏強若沒有出口，也可能形成壅滯與燥烈。相反，如果某一五行孤弱、無根、又反覆受制，才會被視為較值得留意的先天薄弱環節。這裡的「強弱」是命理結構語言，不是化驗數值，也不應被直接翻譯成疾病名稱。

第三層看日主與整體承載。日主不是一個人的免疫力刻度，也不能用「身強一定健康、身弱一定多病」來替代判斷。更有用的問題是：整個命局能不能承受它所面對的剋、泄、耗與寒熱？例如同樣是火旺，有的人有水來調候、有土承載、有金可流通；有的人則火燥土焦、全局缺少緩衝。傳統健康象義真正看的是這種整體結構，而不是單一字數。

第四層看被嚴重克伐的五行。木弱又遇金勢太強，會被視為木類象義較受壓；土弱而木勢過盛，會看土類承載是否不足；水弱又受厚土壓制，會留意水類功能的失衡象。這種判斷仍然只是「風險提示的象」，不是「某病必發」。網站在實際報告裡也應把它寫成需要留意、適合定期檢查或保持生活規律，而不是替代醫師下結論。

從臟腑再往外延伸，傳統五行還會配到形體與官竅：木主筋、開竅於目；火主脈、開竅於舌；土主肌肉、開竅於口；金主皮毛、開竅於鼻；水主骨、開竅於耳。放進命理裡，它提供的是一組「同類象義」：木的問題不只聯想到肝膽，也會同時觀察筋膜、眼目與疏泄；金不只聯想到肺與大腸，也會聯想到皮毛、鼻與呼吸；水則會延伸到骨、耳與泌尿生殖一類象徵。這種全息對應是傳統分類方式，不等於現代醫學所說的因果關係。

真正實用的地方，在於不能把五行孤立看。木克土，傳統上會看木氣過亢是否讓土的承載與運化吃力；火克金，會看燥熱是否壓制金的收斂與清肅；土克水，會看厚重壅滯是否妨礙水的流動；水克火，會看寒濕是否壓住火的溫煦；金克木，則會觀察過度收斂、壓制是否讓木失去伸展。這些都是結構性的「連鎖反應」，所以不能只拿一個天干去對一個器官。

到了大運、流年、流月、流日，分析重點不是重新算一套身體，而是看原局哪個結構被時間引動。原局先找「病根」——也就是本來已經偏旺、偏弱、偏寒、偏燥或彼此失衡的地方；後天時間只負責把某些力量放大、削弱或重新組合。大運是十年尺度，流年是一年尺度，流月把季節力量推到眼前，流日則更接近短期波動。時間層級越短，越不適合單獨下重判。

大運若長期加重原局本來就失衡的五行，傳統上會把那十年看成需要更注意生活節奏與定期檢查的時段；若大運補足原局缺少的調候、承載或流通，則可理解成結構相對舒展。這就是古人常說的「病藥」思路：病是結構偏差，藥是使它重新平衡的力量。這個「藥」是命理比喻，不是藥物名稱，也不代表可以自行停藥或改治療。

流年與大運、原局發生刑、沖、合、害時，常被當成「引動」。沖代表兩股力量直接對立，刑與害偏向長期牽扯或不順，合則可能把原有力量重新集中或改變去向。三合、三會如果把原本分散的五行突然聚成一股，也會讓某一類象義在那段時間明顯增強。這些結構很適合用來判斷「哪段時間更值得留意」，但不適合用來預告某一天一定會發生某種疾病。

流月尤其要看季節。原局本來火弱而水寒，到亥子丑一帶的冬季月份，寒水的象義更容易被放大；原局土弱而木盛，春季木旺時土的壓力會更明顯；原局金燥而火烈，巳午未附近的燥熱月份會讓原有偏態更突出。這類判斷最好的用法，是提醒自己提前調整作息、飲食、壓力與體檢，而不是等到不舒服才回頭找命理原因。

流日只能做更細的觀察，不應被誇張成「某日必病」。如果流月已經引動原局的失衡，某個流日又再次沖到同一組關係，確實可能讓體感、疲勞、疼痛、睡眠或情緒波動更明顯；但同一天是否真的出現症狀，仍受到現實中的睡眠、感染、受傷、飲食、藥物、工作壓力與既有疾病等大量因素影響。命理最多只能提示時間敏感度。

有些命理師會用「天干主外、地支主內」作為工作口訣，把天干理解成較容易顯現、較表層的現象，把地支理解成較深層、較持久的內在結構。這是一種傳統操作語法，而不是醫學分層。實戰時仍要回到同一條原則：先看原局，再看大運，再看流年、流月，最後才把流日當作細節，不可倒過來用某一天的一個沖合直接宣布健康結果。

「太過」與「不及」是整套框架最重要的兩端。太過不是越多越好，它可能表現成亢、燥、滯、壅；不及也不只是數量少，而是缺乏根氣、承載或生扶，在關鍵季節又反覆受制。真正可用的分析，是找出哪一股力量需要疏泄、哪一股需要扶持、哪一組寒熱燥濕需要調整。這和昭梧的主判原則一致：不做簡單「缺什麼補什麼」，而是看整體體用與流通。

如果一定要把這套方法化成一條實戰流程，可以記成四步：先定原局的季節與結構偏態；再找最容易被反覆引動的五行與身體象義；接著看大運、流年、流月是否把同一問題疊加；最後把所得結論轉成現實可執行的健康管理，例如規律睡眠、減少已知刺激、適度運動、按年齡與家族史安排體檢，以及有症狀時及時就醫。命理在這裡的價值，是提醒你「什麼時候更值得留心」，而不是代替檢查。

所以，十天干與臟腑的對應可以作為入口，但絕不能成為終點。真正成熟的命理健康分析，是從一個字走回整個命局，再從整個命局走回現實生活。看見偏態，是為了更早照顧自己；看見時間，是為了更好安排節奏。任何胸痛、呼吸困難、持續腹痛、暈厥、出血或其他明顯不適，都應直接尋求現代醫療評估，不應等待命理應期。`,
    "zh-Hans": `在传统医易、五行脏腑与后世命理象数的语境里，常会把十天干与身体部位建立一组固定对应：甲胆、乙肝、丙小肠、丁心、戊胃、己脾、庚大肠、辛肺、壬膀胱、癸肾。这套对应的核心思路，是以阳干偏向六腑、阴干偏向五脏，再放回木火土金水的整体系统中理解。昭梧在公开文章中只把它当作传统象义框架，不把它等同于现代医学的解剖、生理或诊断结论。

如果只看十个天干名称，很容易把它变成“哪个字少，就哪个器官差”的简化游戏；这种读法不够。八字判断身体象义，先看的仍然是整个命局的季节、旺衰、寒暖燥湿、透干、根气、生克制化与承载能力。五行的“多”不必然等于健康，五行的“少”也不必然等于有病；过旺、过弱、失去流通，才是传统命理会进一步观察的地方。

第一层先看月令。月令代表出生时节的大环境，决定五行在当令季节中的基本气势。夏季火气显，秋季金气显，冬季水气显，春季木气显，季月又有土的承接。这只能告诉我们“哪股气有季节优势”，不能直接推出某个器官一定强或一定弱。真正的判断仍要看它在全局中是得到生扶、受到克泄，还是旺而无制、弱而受攻。

第二层看五行是否形成偏态。若某一五行得令、得地、透干，又获得多重生扶，传统上会把它视为该类功能偏强；但偏强若没有出口，也可能形成壅滞与燥烈。相反，如果某一五行孤弱、无根、又反复受制，才会被视为较值得留意的先天薄弱环节。这里的“强弱”是命理结构语言，不是化验数值，也不应被直接翻译成疾病名称。

第三层看日主与整体承载。日主不是一个人的免疫力刻度，也不能用“身强一定健康、身弱一定多病”来替代判断。更有用的问题是：整个命局能不能承受它所面对的克、泄、耗与寒热？例如同样是火旺，有的人有水来调候、有土承载、有金可流通；有的人则火燥土焦、全局缺少缓冲。传统健康象义真正看的是这种整体结构，而不是单一字数。

第四层看被严重克伐的五行。木弱又遇金势太强，会被视为木类象义较受压；土弱而木势过盛，会看土类承载是否不足；水弱又受厚土压制，会留意水类功能的失衡象。这种判断仍然只是“风险提示的象”，不是“某病必发”。网站在实际报告里也应把它写成需要留意、适合定期检查或保持生活规律，而不是替代医师下结论。

从脏腑再往外延伸，传统五行还会配到形体与官窍：木主筋、开窍于目；火主脉、开窍于舌；土主肌肉、开窍于口；金主皮毛、开窍于鼻；水主骨、开窍于耳。放进命理里，它提供的是一组“同类象义”：木的问题不只联想到肝胆，也会同时观察筋膜、眼目与疏泄；金不只联想到肺与大肠，也会联想到皮毛、鼻与呼吸；水则会延伸到骨、耳与泌尿生殖一类象征。这种全息对应是传统分类方式，不等于现代医学所说的因果关系。

真正实用的地方，在于不能把五行孤立看。木克土，传统上会看木气过亢是否让土的承载与运化吃力；火克金，会看燥热是否压制金的收敛与清肃；土克水，会看厚重壅滞是否妨碍水的流动；水克火，会看寒湿是否压住火的温煦；金克木，则会观察过度收敛、压制是否让木失去伸展。这些都是结构性的“连锁反应”，所以不能只拿一个天干去对一个器官。

到了大运、流年、流月、流日，分析重点不是重新算一套身体，而是看原局哪个结构被时间引动。原局先找“病根”——也就是本来已经偏旺、偏弱、偏寒、偏燥或彼此失衡的地方；后天时间只负责把某些力量放大、削弱或重新组合。大运是十年尺度，流年是一年尺度，流月把季节力量推到眼前，流日则更接近短期波动。时间层级越短，越不适合单独下重判。

大运若长期加重原局本来就失衡的五行，传统上会把那十年看成需要更注意生活节奏与定期检查的时段；若大运补足原局缺少的调候、承载或流通，则可理解成结构相对舒展。这就是古人常说的“病药”思路：病是结构偏差，药是使它重新平衡的力量。这个“药”是命理比喻，不是药物名称，也不代表可以自行停药或改治疗。

流年与大运、原局发生刑、冲、合、害时，常被当成“引动”。冲代表两股力量直接对立，刑与害偏向长期牵扯或不顺，合则可能把原有力量重新集中或改变去向。三合、三会如果把原本分散的五行突然聚成一股，也会让某一类象义在那段时间明显增强。这些结构很适合用来判断“哪段时间更值得留意”，但不适合用来预告某一天一定会发生某种疾病。

流月尤其要看季节。原局本来火弱而水寒，到亥子丑一带的冬季月份，寒水的象义更容易被放大；原局土弱而木盛，春季木旺时土的压力会更明显；原局金燥而火烈，巳午未附近的燥热月份会让原有偏态更突出。这类判断最好的用法，是提醒自己提前调整作息、饮食、压力与体检，而不是等到不舒服才回头找命理原因。

流日只能做更细的观察，不应被夸张成“某日必病”。如果流月已经引动原局的失衡，某个流日又再次冲到同一组关系，确实可能让体感、疲劳、疼痛、睡眠或情绪波动更明显；但同一天是否真的出现症状，仍受到现实中的睡眠、感染、受伤、饮食、药物、工作压力与既有疾病等大量因素影响。命理最多只能提示时间敏感度。

有些命理师会用“天干主外、地支主内”作为工作口诀，把天干理解成较容易显现、较表层的现象，把地支理解成较深层、较持久的内在结构。这是一种传统操作语法，而不是医学分层。实战时仍要回到同一条原则：先看原局，再看大运，再看流年、流月，最后才把流日当作细节，不可倒过来用某一天的一个冲合直接宣布健康结果。

“太过”与“不及”是整套框架最重要的两端。太过不是越多越好，它可能表现成亢、燥、滞、壅；不及也不只是数量少，而是缺乏根气、承载或生扶，在关键季节又反复受制。真正可用的分析，是找出哪一股力量需要疏泄、哪一股需要扶持、哪一组寒热燥湿需要调整。这和昭梧的主判原则一致：不做简单“缺什么补什么”，而是看整体体用与流通。

如果一定要把这套方法化成一条实战流程，可以记成四步：先定原局的季节与结构偏态；再找最容易被反复引动的五行与身体象义；接着看大运、流年、流月是否把同一问题叠加；最后把所得结论转成现实可执行的健康管理，例如规律睡眠、减少已知刺激、适度运动、按年龄与家族史安排体检，以及有症状时及时就医。命理在这里的价值，是提醒你“什么时候更值得留心”，而不是代替检查。

所以，十天干与脏腑的对应可以作为入口，但绝不能成为终点。真正成熟的命理健康分析，是从一个字走回整个命局，再从整个命局走回现实生活。看见偏态，是为了更早照顾自己；看见时间，是为了更好安排节奏。任何胸痛、呼吸困难、持续腹痛、晕厥、出血或其他明显不适，都应直接寻求现代医疗评估，不应等待命理应期。`,
    en: `In traditional Chinese correlative thought, the Ten Heavenly Stems are often paired with body functions and organ systems: Jia with the gallbladder, Yi with the liver, Bing with the small intestine, Ding with the heart, Wu with the stomach, Ji with the spleen, Geng with the large intestine, Xin with the lungs, Ren with the bladder and Gui with the kidneys. The usual logic places yang stems with the fu organs and yin stems with the zang organs, then reads them inside the wider Wood, Fire, Earth, Metal and Water framework. On Zhaowu, this is treated as traditional symbolism, not as modern anatomy, physiology or diagnosis.

The first mistake is to turn the chart into a counting game: “this element is missing, therefore this organ is weak.” A traditional reading is much more structural. It begins with season, relative strength, heat and cold, dryness and dampness, visible stems, rooting, support, restraint and the chart’s capacity to carry pressure. More of an element does not automatically mean healthier, and less does not automatically mean disease. Excess, deficiency and blocked circulation are the more useful traditional concepts.

The first layer is the month branch, which represents the seasonal environment of birth. Fire has seasonal advantage in summer, Metal in autumn, Water in winter and Wood in spring, with Earth carrying the transitional phases. This only describes the climate of the chart. It does not prove that a particular organ is strong or weak. The rest of the chart still determines whether that seasonal force is supported, drained, restrained or left excessive.

The second layer asks whether any phase becomes structurally extreme. An element that is timely, rooted, visible and repeatedly supported may become dominant; if it has no outlet, dominance can become congestion, dryness or overactivity in traditional language. An element that is isolated, unrooted and repeatedly restrained is more likely to be treated as a vulnerable area. These are chart terms, not laboratory measurements and not medical diagnoses.

The third layer is the Day Master and overall carrying capacity. A strong Day Master is not a direct measurement of immunity, and a weak Day Master does not mean someone must be sick. The useful question is whether the chart as a whole can carry its restraint, drain, expenditure, heat and cold. Two charts may both contain strong Fire, yet one has Water to moderate it, Earth to carry it and Metal to move it onward, while another becomes dry and overheated with little buffering. Traditional health symbolism is about this whole structure rather than one count.

The fourth layer looks at an element that is both weak and repeatedly attacked. Weak Wood under overwhelming Metal, weak Earth under dominant Wood, or weak Water compressed by heavy Earth would traditionally draw attention to the corresponding symbolic functions. The responsible way to use that information is as a prompt for awareness, routine care and appropriate screening, never as a statement that a specific illness must occur.

The Five Phases also extend beyond organs into tissues and sensory openings. Wood is traditionally associated with sinews and the eyes; Fire with vessels and the tongue; Earth with flesh and the mouth; Metal with skin, body hair and the nose; Water with bones and the ears. This creates families of symbols rather than one-to-one biomedical causes. A Wood pattern may be discussed together with the liver and gallbladder, the eyes, tension and movement; Metal may be discussed with lungs, large intestine, skin, nose and breathing; Water may extend to bones, ears and urinary or reproductive symbolism.

The most useful part of the system is relational. Wood restrains Earth, so excessive Wood may be read as placing pressure on Earth’s carrying and digestive symbolism. Fire restrains Metal, so heat and dryness may be read as challenging Metal’s contracting and clearing functions. Earth restrains Water, Water restrains Fire, and Metal restrains Wood. The point is not to diagnose a disease from one interaction, but to see how one imbalance can propagate through the chart.

Luck pillars, annual cycles, months and days are then used as timing layers. They do not create a new body from scratch; they activate what is already present in the natal structure. First identify the original imbalance: too strong, too weak, too cold, too dry or caught in conflict. Then see whether later timing amplifies, relieves or reorganises the same pattern. A ten-year luck pillar is a broad climate, the year is a shorter layer, the month carries seasonal force strongly, and the day is best treated as fine-grained fluctuation.

If a luck pillar repeatedly intensifies an existing imbalance, traditional practice may treat that decade as a period to be more disciplined about routine, stress and screening. If the pillar supplies missing moderation, support or circulation, the structure may be read as more comfortable. This is the traditional “illness and remedy” metaphor: the illness is the structural imbalance, while the remedy is the balancing function. It is a metaphysical metaphor, not a pharmaceutical instruction and never a reason to change prescribed treatment.

Clashes, punishments, combinations and harms between natal and timing layers are treated as activations. A clash brings direct opposition, punishment and harm describe more entangled forms of friction, and combinations can concentrate or redirect a force. Three-harmony and three-meeting configurations can suddenly gather an element that was previously scattered. These are useful for asking which periods deserve more attention, but they should not be used to predict that a specific disease will occur on a specific date.

Months deserve particular attention because they carry seasonal conditions directly. A chart that is already cold with weak Fire may feel that imbalance more strongly in winter months; weak Earth under strong Wood may be more pressured in spring; dry Metal under intense Fire may feel more strained in hot, dry periods. The practical use is to adjust sleep, food, workload, stress and routine check-ups in advance rather than waiting for symptoms and then blaming the chart.

Days should be treated even more cautiously. If a month has already activated an imbalance and a day repeats the same clash, some people may notice stronger fatigue, discomfort, sleep disturbance or emotional fluctuation. But whether symptoms actually appear depends on ordinary factors such as infection, injury, diet, medication, sleep, workload and existing conditions. A day pillar can at most suggest sensitivity; it cannot establish cause.

Some practitioners use the shorthand “stems show outwardly, branches hold inwardly.” This is a traditional working grammar, not a medical distinction between external and internal disease. The sequence should still be natal chart first, then luck pillar, year and month, and only then the day. A single daily clash should never be turned into a serious health conclusion.

“Excess” and “insufficiency” are the two poles of the entire framework. Excess is not simply “more is better”; it can describe heat, dryness, stagnation or congestion. Insufficiency is not merely a low count; it means lack of rooting, support or capacity, especially when the same function is repeatedly restrained at sensitive times. The goal is to identify what needs release, what needs support, and where heat, cold, dryness or dampness require better balance. This matches Zhaowu’s wider rule: never reduce Bazi to “whatever is missing must be added.”

A practical four-step workflow is therefore: establish the natal season and structural imbalance; identify the Five-Phase and body-symbol families most often involved; check whether luck pillars, years and months repeatedly amplify the same pattern; then translate the result into ordinary health management such as regular sleep, reducing known triggers, appropriate exercise, age- and family-history-based screening, and timely medical care when symptoms appear. The value of the metaphysical layer is to prompt attention and timing, not to replace examination.

The Ten Stems and organ correspondences are therefore an entry point, not the conclusion. A mature reading moves from one symbol back to the whole chart, and from the whole chart back to real life. The point of noticing imbalance is to care for yourself earlier; the point of noticing timing is to manage rhythm more intelligently. Chest pain, difficulty breathing, persistent abdominal pain, fainting, bleeding or other significant symptoms require prompt medical assessment rather than waiting for any astrological timing window.`,
  },
  illustrations: [
    {
      src: "/articles/bazi-health-five-phases.svg",
      afterParagraph: 3,
      alt: {
        "zh-Hant": "五行循環與陰陽成對的抽象宋式插圖",
        "zh-Hans": "五行循环与阴阳成对的抽象宋式插图",
        en: "Song-inspired abstract illustration of the Five Phases and paired yin-yang movement",
      },
    },
    {
      src: "/articles/bazi-health-body-map.svg",
      afterParagraph: 7,
      alt: {
        "zh-Hant": "以五行意象分布於人體區域的抽象插圖",
        "zh-Hans": "以五行意象分布于人体区域的抽象插图",
        en: "Abstract illustration placing Five-Phase motifs across the body",
      },
    },
    {
      src: "/articles/bazi-health-timing-rings.svg",
      afterParagraph: 11,
      alt: {
        "zh-Hant": "大運、流年、流月、流日層層引動的時間環插圖",
        "zh-Hans": "大运、流年、流月、流日层层引动的时间环插图",
        en: "Concentric timing rings representing decade, year, month and day activation",
      },
    },
    {
      src: "/articles/bazi-health-balance.svg",
      afterParagraph: 15,
      alt: {
        "zh-Hant": "太過、不及與重新平衡的山水抽象插圖",
        "zh-Hans": "太过、不及与重新平衡的山水抽象插图",
        en: "Landscape-inspired illustration of excess, insufficiency and restored balance",
      },
    },
  ],
};
