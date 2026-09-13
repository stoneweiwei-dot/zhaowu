import type { Locale } from "@/lib/i18n";

export type LifeNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;
export type T = readonly [string, string, string];
export type Gift = { name: T; body: T };
export type Profile = {
  name: T;
  core: T;
  soul: T;
  role: T;
  words: readonly T[];
  gifts: readonly Gift[];
  challenge: T;
  challenges: readonly T[];
  lesson: T;
  action: T;
  directions: readonly T[];
};

export const MASTER_NUMBERS = new Set<LifeNumber>([11, 22, 33]);
export const tx = (locale: Locale, text: T) => (locale === "en" ? text[2] : locale === "zh-Hans" ? text[1] : text[0]);
export const t = (a: string, b: string, c: string): T => [a, b, c];

export function sumDigits(value: number) {
  return String(Math.abs(value)).split("").reduce((sum, digit) => sum + Number(digit), 0);
}

export function calculateLifeNumber(year: number, month: number, day: number) {
  const digits = `${String(year).padStart(4, "0")}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`.split("").map(Number);
  const steps = [digits.reduce((sum, digit) => sum + digit, 0)];
  let value = steps[0];
  while (value > 9 && value !== 11 && value !== 22 && value !== 33) {
    value = sumDigits(value);
    steps.push(value);
  }
  return { number: value as LifeNumber, digits, steps };
}

function gift(name: T, body: T): Gift {
  return { name, body };
}

export const NUMEROLOGY_PROFILES: Record<LifeNumber, Profile> = {
  1: {
    name: t("開創者", "开创者", "Pioneer"),
    core: t("你在能自己判斷方向、先走第一步時最有力量。成熟的主導不是什麼都自己扛，而是清楚哪些決定必須由你負責。", "你在能自己判断方向、先走第一步时最有力量。成熟的主导不是什么都自己扛，而是清楚哪些决定必须由你负责。", "You are strongest when you can choose a direction and take the first step. Mature independence means owning the decisions that truly belong to you."),
    soul: t("「起點在我。我得先把自己活成一個站得住的人。」", "“起点在我。我得先把自己活成一个站得住的人。”", "“The start is mine. I have to become someone who can stand.”"),
    role: t("你是先走一步的人。路不是等人鋪好才出發，而是你先踏出去，後面的結構才有地方長。", "你是先走一步的人。路不是等人铺好才出发，而是你先踏出去，后面的结构才有地方长。", "You are the one who takes the first step. The path exists because you walk it, not because someone else prepared it."),
    words: [t("自主", "自主", "autonomy"), t("開創", "开创", "initiative"), t("決斷", "决断", "decision"), t("勇氣", "勇气", "courage"), t("主導", "主导", "ownership")],
    gifts: [
      gift(t("自主", "自主", "Autonomy"), t("不必等人點頭，也能把方向從模糊收成一句清楚的話。", "不必等人点头，也能把方向从模糊收成一句清楚的话。", "You can turn a vague direction into a clear sentence without waiting for permission.")),
      gift(t("開創", "开创", "Initiative"), t("空白對你不是威脅，是可以開始的位置。", "空白对你不是威胁，是可以开始的位置。", "Empty space is not a threat to you; it is a place to begin.")),
      gift(t("決斷", "决断", "Decision"), t("你能在資訊不完整時先做一個可修正的決定。", "你能在资讯不完整时先做一个可修正的决定。", "You can make a revisable decision before every fact is in.")),
      gift(t("勇氣", "勇气", "Courage"), t("第一個開口、第一個承擔，往往會落在你身上。", "第一个开口、第一个承担，往往会落在你身上。", "The first voice and the first burden often land on you.")),
      gift(t("主導", "主导", "Ownership"), t("真正的主導是看清哪些必須由你負責，哪些可以交給別人。", "真正的主导是看清哪些必须由你负责，哪些可以交给别人。", "Real ownership is knowing what must stay with you and what can be handed on.")),
    ],
    challenge: t("太急著證明自己、拒絕協助，或把不同意見直接視為阻力。", "太急着证明自己、拒绝协助，或把不同意见直接视为阻力。", "Proving yourself too quickly, refusing help, or treating disagreement as obstruction."),
    challenges: [
      t("急著證明自己，把速度誤認成力量", "急着证明自己，把速度误认成力量", "Using speed to prove yourself"),
      t("拒絕協助，以為一個人才算主導", "拒绝协助，以为一个人才算主导", "Refusing help because independence feels safer"),
      t("把不同意見直接看成阻擋", "把不同意见直接看成阻挡", "Hearing disagreement as a block"),
    ],
    lesson: t("真正課題不是消掉你的主導，而是學會帶人一起走，仍把關鍵決定留在自己手上。", "真正课题不是消掉你的主导，而是学会带人一起走，仍把关键决定留在自己手上。", "The lesson is not to drop ownership, but to keep the key decisions while letting others walk with you."),
    action: t("保留主導權，但把真正需要合作的部分講清楚。", "保留主导权，但把真正需要合作的部分讲清楚。", "Keep ownership of the direction, but make the parts that need collaboration explicit."),
    directions: [t("創業／主理", "创业／主理", "founding / ownership"), t("專案決策", "项目决策", "project leadership"), t("自主型專業工作", "自主型专业工作", "autonomous specialist work")],
  },
  2: {
    name: t("協調者", "协调者", "Diplomat"),
    core: t("你很容易先讀到人與人之間的氣氛，再決定怎麼推進。敏銳是優勢，但不能長期把自己的需要放到最後。", "你很容易先读到人与人之间的气氛，再决定怎么推进。敏锐是优势，但不能长期把自己的需要放到最后。", "You read the atmosphere between people before deciding how to move. Sensitivity is useful, but your own needs cannot always come last."),
    soul: t("「人與人的交會裡，我才確認自己真的在這裡。」", "“人与人的交会里，我才确认自己真的在这里。”", "“I know I am here when I meet another person honestly.”"),
    role: t("你是現場的平衡者。還沒有人把話說完，你已經感覺到哪裡鬆、哪裡緊，並試著讓兩邊都能站住。", "你是现场的平衡者。还没有人把话说完，你已经感觉到哪里松、哪里紧，并试着让两边都能站住。", "You keep the room in balance. Before the sentence is finished, you can feel where it is loose and where it is tight."),
    words: [t("敏銳", "敏锐", "sensitivity"), t("協調", "协调", "coordination"), t("傾聽", "倾听", "listening"), t("合作", "合作", "cooperation"), t("平衡", "平衡", "balance")],
    gifts: [
      gift(t("敏銳", "敏锐", "Sensitivity"), t("氣氛一變，你通常比別人更早知道。", "气氛一变，你通常比别人更早知道。", "You notice a change in atmosphere before most people do.")),
      gift(t("協調", "协调", "Coordination"), t("你能把兩種不同節奏接成一件還能推進的事。", "你能把两种不同节奏接成一件还能推进的事。", "You can join two different tempos into one workable move.")),
      gift(t("傾聽", "倾听", "Listening"), t("別人還沒說出口的部分，你常常已經聽見了。", "别人还没说出口的部分，你常常已经听见了。", "You often hear the part that has not been said yet.")),
      gift(t("合作", "合作", "Cooperation"), t("你讓事情不必變成一個人的戰場。", "你让事情不必变成一个人的战场。", "You keep work from becoming a one-person battlefield.")),
      gift(t("平衡", "平衡", "Balance"), t("你天生會找兩邊都能站住的位置。", "你天生会找两边都能站住的位置。", "You look for the place where both sides can still stand.")),
    ],
    challenge: t("為了和諧而延後表態、過度迎合，或把別人的情緒當成自己的責任。", "为了和谐而延后表态、过度迎合，或把别人的情绪当成自己的责任。", "Delaying your position to preserve harmony, over-accommodating, or carrying other people's emotions."),
    challenges: [
      t("為了和諧而遲遲不表態", "为了和谐而迟迟不表态", "Delaying your position to keep the peace"),
      t("把別人的情緒當成自己的作業", "把别人的情绪当成自己的作业", "Treating other people's moods as your homework"),
      t("迎合太久，連自己要什麼都聽不見", "迎合太久，连自己要什么都听不见", "Accommodating until your own need disappears"),
    ],
    lesson: t("真正課題是先把自己的底線說清楚，再談配合。和諧不是消失。", "真正课题是先把自己的底线说清楚，再谈配合。和谐不是消失。", "The lesson is to name your boundary first. Harmony is not disappearance."),
    action: t("先說清楚自己的底線，再談配合。", "先说清楚自己的底线，再谈配合。", "State your boundary first, then negotiate the compromise."),
    directions: [t("協作／顧問", "协作／顾问", "collaboration / advisory"), t("關係型服務", "关系型服务", "relationship-based service"), t("細膩判斷工作", "细腻判断工作", "nuance-heavy work")],
  },
  3: {
    name: t("表達者", "表达者", "Communicator"),
    core: t("你的能量要透過表達流動。想法被說出、寫出、做成作品時，比只留在腦中更有生命力。", "你的能量要通过表达流动。想法被说出、写出、做成作品时，比只留在脑中更有生命力。", "Your energy moves through expression. Ideas gain force when they are spoken, written, performed, or made real."),
    soul: t("「世界給我一塊畫布。不把內在的光說出來，我會覺得自己還沒開始。」", "“世界给我一块画布。不把内在的光说出来，我会觉得自己还没开始。”", "“The world is a canvas. Until I give the inner light a form, I have not begun.”"),
    role: t("你是把內在變成可見的人。一句話、一段文字、一個畫面，往往比長篇解釋更能讓事情活起來。", "你是把内在变成可见的人。一句话、一段文字、一个画面，往往比长篇解释更能让事情活起来。", "You make the inner life visible. One sentence, one page, one image can do more than a long explanation."),
    words: [t("表達", "表达", "expression"), t("創意", "创意", "creativity"), t("語言", "语言", "language"), t("感染力", "感染力", "influence"), t("活力", "活力", "vitality")],
    gifts: [
      gift(t("表達", "表达", "Expression"), t("你一開口，空氣就會換一個密度。", "你一开口，空气就会换一个密度。", "When you speak, the room changes density.")),
      gift(t("創意", "创意", "Creativity"), t("舊材料到你手上，常常會長出新形狀。", "旧材料到你手上，常常会长出新形状。", "Old material often takes a new shape in your hands.")),
      gift(t("語言", "语言", "Language"), t("你能把複雜的感覺收成一句別人聽得懂的話。", "你能把复杂的感觉收成一句别人听得懂的话。", "You can compress a complex feeling into a sentence others can hold.")),
      gift(t("感染力", "感染力", "Influence"), t("你的節奏會帶著旁邊的人一起動。", "你的节奏会带着旁边的人一起动。", "Your tempo tends to move the people beside you.")),
      gift(t("活力", "活力", "Vitality"), t("新鮮感對你不是娛樂，是能量重新流通的方式。", "新鲜感对你不是娱乐，是能量重新流通的方式。", "Freshness is not just entertainment; it is how your energy circulates again.")),
    ],
    challenge: t("分心、只追求新鮮感，或用輕鬆與幽默避開真正需要處理的問題。", "分心、只追求新鲜感，或用轻松与幽默避开真正需要处理的问题。", "Distraction, chasing novelty, or using lightness to avoid what still needs attention."),
    challenges: [
      t("同時開太多線，作品無法累積", "同时开太多线，作品无法累积", "Opening too many threads for anything to accumulate"),
      t("用輕鬆蓋住真正要處理的事", "用轻松盖住真正要处理的事", "Using lightness to cover what still needs work"),
      t("等狀態來，而不是建立輸出節奏", "等状态来，而不是建立输出节奏", "Waiting for the mood instead of a rhythm of output"),
    ],
    lesson: t("真正課題是把靈感變成固定輸出。表達要落地，才會成為力量而不是煙火。", "真正课题是把灵感变成固定输出。表达要落地，才会成为力量而不是烟火。", "The lesson is to turn inspiration into repeatable output, so expression becomes force rather than fireworks."),
    action: t("把靈感變成固定輸出，而不是只等狀態來。", "把灵感变成固定输出，而不是只等状态来。", "Turn inspiration into repeatable output instead of waiting for the mood."),
    directions: [t("內容／創作", "内容／创作", "content / creative work"), t("傳播／教學", "传播／教学", "communication / teaching"), t("品牌與表達", "品牌与表达", "brand / expressive work")],
  },
  4: {
    name: t("建構者", "建构者", "Builder"),
    core: t("你重視可執行、可持續、真正站得住的東西，擅長把混亂整理成秩序，再一層一層建立。", "你重视可执行、可持续、真正站得住的东西，擅长把混乱整理成秩序，再一层一层建立。", "You value workable, durable things and are good at turning disorder into structure, then building layer by layer."),
    soul: t("「我交給世界的禮物，是能站得住的秩序。」", "“我交给世界的礼物，是能站得住的秩序。”", "“The gift I give the world is order that can stand.”"),
    role: t("你是把散件收成房子的人。別人還在談感覺，你已經在想承重、節奏與下一步要釘哪一根樑。", "你是把散件收成房子的人。别人还在谈感觉，你已经在想承重、节奏与下一步要钉哪一根梁。", "You turn loose parts into a house. While others talk about the feeling, you are already thinking about the load-bearing line."),
    words: [t("秩序", "秩序", "order"), t("穩定", "稳定", "stability"), t("耐性", "耐性", "patience"), t("規劃", "规划", "planning"), t("落地", "落地", "execution")],
    gifts: [
      gift(t("秩序", "秩序", "Order"), t("混亂到你面前，會開始顯出層次。", "混乱到你面前，会开始显出层次。", "Disorder starts to show layers when it reaches you.")),
      gift(t("穩定", "稳定", "Stability"), t("你讓人覺得這件事明天還會在。", "你让人觉得这件事明天还会在。", "You make people feel that the work will still be here tomorrow.")),
      gift(t("耐性", "耐性", "Patience"), t("你受得住重複，也因此能把基礎打厚。", "你受得住重复，也因此能把基础打厚。", "You can bear repetition, and that is how a foundation thickens.")),
      gift(t("規劃", "规划", "Planning"), t("你看見的不是一天，是一條可走完的路徑。", "你看见的不是一天，是一条可走完的路径。", "You see a path that can be finished, not only a day.")),
      gift(t("落地", "落地", "Execution"), t("紙上的計畫到你手上，才比較像真的。", "纸上的计划到你手上，才比较像真的。", "A plan starts to look real once it is in your hands.")),
    ],
    challenge: t("把穩定變成僵化，或因為過度求完整而拖慢開始與調整。", "把稳定变成僵化，或因为过度求完整而拖慢开始与调整。", "Turning stability into rigidity, or delaying action because the structure never feels complete enough."),
    challenges: [
      t("結構還沒完美就不肯開始", "结构还没完美就不肯开始", "Refusing to start until the structure is perfect"),
      t("穩定過了頭，變成不肯調整", "稳定过了头，变成不肯调整", "Stability hardening into refusal to revise"),
      t("把變化看成對秩序的冒犯", "把变化看成对秩序的冒犯", "Treating change as an insult to order"),
    ],
    lesson: t("真正課題是保留結構，同時替變化預留一扇窗。秩序是為了讓生命能住進去。", "真正课题是保留结构，同时替变化预留一扇窗。秩序是为了让生命能住进去。", "The lesson is to keep the structure and leave a window for change. Order exists so life can live inside it."),
    action: t("保留結構，但替變化預留空間。", "保留结构，但替变化预留空间。", "Keep the structure, but deliberately leave room for revision."),
    directions: [t("營運／系統", "运营／系统", "operations / systems"), t("工程／技術", "工程／技术", "engineering / technical work"), t("長週期建設", "长周期建设", "long-cycle building work")],
  },
  5: {
    name: t("探索者", "探索者", "Explorer"),
    core: t("你透過移動、變化與親身經驗理解世界。真正適合你的自由，是保有調整方法的能力，而不是一直換掉目標。", "你通过移动、变化与亲身经验理解世界。真正适合你的自由，是保有调整方法的能力，而不是一直换掉目标。", "You understand the world through movement and direct experience. Real freedom is adapting the method rather than constantly replacing the goal."),
    soul: t("「生命要去走、去試。我不能只坐在已知的房間裡。」", "“生命要去走、去试。我不能只坐在已知的房间里。”", "“Life has to be walked and tried. I cannot stay only in the room I already know.”"),
    role: t("你是打開下一扇門的人。地圖不夠用時，你會用腳去量。自由對你不是逃避，是保持活的方法。", "你是打开下一扇门的人。地图不够用时，你会用脚去量。自由对你不是逃避，是保持活的方法。", "You open the next door. When the map is not enough, you measure with your feet."),
    words: [t("自由", "自由", "freedom"), t("變化", "变化", "change"), t("探索", "探索", "exploration"), t("適應", "适应", "adaptation"), t("經驗", "经验", "experience")],
    gifts: [
      gift(t("自由", "自由", "Freedom"), t("你能在框裡找到可移動的縫。", "你能在框里找到可移动的缝。", "You can find a movable seam inside a frame.")),
      gift(t("變化", "变化", "Change"), t("情況一轉，你比很多人更快換方法。", "情况一转，你比很多人更快换方法。", "When the situation turns, you change method faster than most.")),
      gift(t("探索", "探索", "Exploration"), t("未知對你是邀請，不是警報。", "未知对你是邀请，不是警报。", "The unknown is an invitation, not an alarm.")),
      gift(t("適應", "适应", "Adaptation"), t("換地方、換節奏，你通常能很快重新站穩。", "换地方、换节奏，你通常能很快重新站稳。", "A new place or tempo rarely keeps you off balance for long.")),
      gift(t("經驗", "经验", "Experience"), t("你相信親身走過的，多過紙上寫過的。", "你相信亲身走过的，多过纸上写过的。", "You trust what you have walked more than what was written down.")),
    ],
    challenge: t("因為厭倦而過早離開、同時開太多方向，或把承諾誤認成失去自由。", "因为厌倦而过早离开、同时开太多方向，或把承诺误认成失去自由。", "Leaving too early from boredom, opening too many paths, or confusing commitment with loss of freedom."),
    challenges: [
      t("一厭倦就走，還沒累積就換題", "一厌倦就走，还没累积就换题", "Leaving at the first boredom, before anything compounds"),
      t("同時開太多方向，主線變淡", "同时开太多方向，主线变淡", "Opening too many paths until the main line fades"),
      t("把承諾誤認成失去自由", "把承诺误认成失去自由", "Hearing commitment as the end of freedom"),
    ],
    lesson: t("真正課題是留下一條值得累積的主線，把變化用在方法，而不是一直換掉目標。", "真正课题是留下一条值得累积的主线，把变化用在方法，而不是一直换掉目标。", "The lesson is to keep one path worth compounding, and use flexibility on the method rather than the goal."),
    action: t("留下真正值得累積的主線，把變化用在方法。", "留下真正值得积累的主线，把变化用在方法。", "Keep one path worth compounding and use flexibility on the method."),
    directions: [t("跨域／旅行型工作", "跨域／旅行型工作", "cross-domain / travel-heavy work"), t("市場／探索", "市场／探索", "market / exploration"), t("快速變化專案", "快速变化项目", "fast-changing projects")],
  },
  6: {
    name: t("守護者", "守护者", "Guardian"),
    core: t("你容易把照顧、品質、美感與責任放進同一件事裡。你擅長讓環境與關係變好，但不代表所有問題都該由你收拾。", "你容易把照顾、品质、美感与责任放进同一件事里。你擅长让环境与关系变好，但不代表所有问题都该由你收拾。", "You combine care, quality, aesthetics, and responsibility. You improve people and environments, but not every problem is yours to fix."),
    soul: t("「愛與責任是我站得住的地基。少了這兩樣，其他都會晃。」", "“爱与责任是我站得住的地基。少了这两样，其他都会晃。”", "“Care and responsibility are the ground I stand on. Without them, everything sways.”"),
    role: t("你是把空間與關係照顧好的人。東西要體面，人也要被看見；可是你不是整棟樓的無限維修工。", "你是把空间与关系照顾好的人。东西要体面，人也要被看见；可是你不是整栋楼的无限维修工。", "You look after rooms and relationships. Things should be decent, people should be seen; you are not the building's endless repair service."),
    words: [t("照顧", "照顾", "care"), t("責任", "责任", "responsibility"), t("品質", "品质", "quality"), t("美感", "美感", "aesthetics"), t("守護", "守护", "stewardship")],
    gifts: [
      gift(t("照顧", "照顾", "Care"), t("你會注意到誰還沒被好好對待。", "你会注意到谁还没被好好对待。", "You notice who has not been treated well yet.")),
      gift(t("責任", "责任", "Responsibility"), t("事情落到你手上，通常會被收得比較完整。", "事情落到你手上，通常会被收得比较完整。", "Work that reaches you is usually closed more completely.")),
      gift(t("品質", "品质", "Quality"), t("你受不了「差不多就好」長期掛在那裡。", "你受不了“差不多就好”长期挂在那里。", "You cannot leave a permanent almost-good enough hanging in the air.")),
      gift(t("美感", "美感", "Aesthetics"), t("環境一亂，你的身體會先抗議。", "环境一乱，你的身体会先抗议。", "When a space falls apart, your body protests first.")),
      gift(t("守護", "守护", "Stewardship"), t("你會替一段關係、一個家、一份工作守住體面。", "你会替一段关系、一个家、一份工作守住体面。", "You keep dignity in a relationship, a home, or a piece of work.")),
    ],
    challenge: t("責任感過量、完美主義，或在照顧別人時把自己的能量消耗到最後。", "责任感过量、完美主义，或在照顾别人时把自己的能量消耗到最后。", "Excess responsibility, perfectionism, or depleting yourself while caring for everyone else."),
    challenges: [
      t("責任感過量，把不是你的也收進來", "责任感过量，把不是你的也收进来", "Taking in responsibilities that are not yours"),
      t("完美主義讓照顧變成壓力", "完美主义让照顾变成压力", "Perfection turning care into pressure"),
      t("先把自己用到最後，再談休息", "先把自己用到最后，再谈休息", "Using yourself up before rest is allowed"),
    ],
    lesson: t("真正課題是先確認這件事是不是你的責任。照顧別人之前，你自己也要被包括在內。", "真正课题是先确认这件事是不是你的责任。照顾别人之前，你自己也要被包括在内。", "The lesson is to check whether the task is yours. Care has to include you."),
    action: t("幫助別人之前，先確認這件事是不是你的責任。", "帮助别人之前，先确认这件事是不是你的责任。", "Before helping, check whether the responsibility is actually yours."),
    directions: [t("設計／美感服務", "设计／美感服务", "design / aesthetic service"), t("教育／照顧", "教育／照顾", "education / care"), t("品質與客戶關係", "品质与客户关系", "quality / client relationships")],
  },
  7: {
    name: t("探究者", "探究者", "Seeker"),
    core: t("你不滿足於表面答案，通常要理解到底層邏輯才會真正相信。深度是優勢，但最後要回到現實判斷。", "你不满足于表面答案，通常要理解到底层逻辑才会真正相信。深度是优势，但最后要回到现实判断。", "Surface answers rarely satisfy you. Depth is a strength, but it eventually needs to return to a real-world decision."),
    soul: t("「表面不夠。萬物背後總有一層，我一定要看到。」", "“表面不够。万物背后总有一层，我一定要看到。”", "“The surface is not enough. There is always another layer, and I have to see it.”"),
    role: t("你是往下挖的人。現成說法站不住時，你會繼續問，直到結構自己顯形。", "你是往下挖的人。现成说法站不住时，你会继续问，直到结构自己显形。", "You dig. When the ready-made answer will not stand, you keep asking until the structure shows itself."),
    words: [t("分析", "分析", "analysis"), t("深度", "深度", "depth"), t("研究", "研究", "research"), t("內省", "内省", "reflection"), t("洞察", "洞察", "insight")],
    gifts: [
      gift(t("分析", "分析", "Analysis"), t("你能把一團感覺拆成可以核對的部分。", "你能把一团感觉拆成可以核对的部分。", "You can take a cloud of feeling apart into parts that can be checked.")),
      gift(t("深度", "深度", "Depth"), t("淺層答案過不了你這一關。", "浅层答案过不了你这一关。", "A shallow answer does not get past you.")),
      gift(t("研究", "研究", "Research"), t("你願意為一個真正的問題坐得很久。", "你愿意为一个真正的问题坐得很久。", "You will sit with a real question for a long time.")),
      gift(t("內省", "内省", "Reflection"), t("你習慣先回到自己內部核對，再對外發言。", "你习惯先回到自己内部核对，再对外发言。", "You check inward before you speak outward.")),
      gift(t("洞察", "洞察", "Insight"), t("你常看見別人還沒命名的結構。", "你常看见别人还没命名的结构。", "You often see a structure other people have not named yet.")),
    ],
    challenge: t("想得太深而抽離現實、一直研究不下結論，或因標準太高而遲遲不行動。", "想得太深而抽离现实、一直研究不下结论，或因标准太高而迟迟不行动。", "Going so deep that you detach from reality, researching without deciding, or delaying action because certainty never feels high enough."),
    challenges: [
      t("想得太深，人從現場消失", "想得太深，人从现场消失", "Going so deep that you leave the room"),
      t("研究沒有截止點", "研究没有截止点", "Research with no deadline"),
      t("標準太高，行動一直延後", "标准太高，行动一直延后", "Standards so high that action keeps receding"),
    ],
    lesson: t("真正課題是給研究一個截止點，然後把理解轉成一次具體決定。深度要回來面對世界。", "真正课题是给研究一个截止点，然后把理解转成一次具体决定。深度要回来面对世界。", "The lesson is to give research a deadline and turn understanding into one concrete decision. Depth has to return to the world."),
    action: t("給研究設定截止點，之後把理解轉成一次具體決定。", "给研究设置截止点，之后把理解转成一次具体决定。", "Give research a deadline, then convert what you know into one concrete decision."),
    directions: [t("研究／分析", "研究／分析", "research / analysis"), t("技術／策略", "技术／策略", "technical / strategy"), t("深度專業領域", "深度专业领域", "deep-specialist fields")],
  },
  8: {
    name: t("掌舵者", "掌舵者", "Executive"),
    core: t("你對成果、效率、資源配置與權責很敏感，力量在於把分散資源集中到真正有回報的地方。", "你对成果、效率、资源配置与权责很敏感，力量在于把分散资源集中到真正有回报的地方。", "You are highly aware of outcomes, efficiency, resources, and authority. Your strength is concentrating resources where they matter."),
    soul: t("「物質世界不是敵人。我要把它變成看得見的成果。」", "“物质世界不是敌人。我要把它变成看得见的成果。”", "“The material world is not the enemy. I am here to turn it into a result you can see.”"),
    role: t("你是把資源趕到同一條河裡的人。權責、效率、成果在你眼裡不是冷的字，是事情能不能真的發生。", "你是把资源赶到同一条河里的人。权责、效率、成果在你眼里不是冷的字，是事情能不能真的发生。", "You drive resources into one river. Authority, efficiency and results are not cold words to you; they are whether the thing actually happens."),
    words: [t("成果", "成果", "results"), t("資源", "资源", "resources"), t("權責", "权责", "authority"), t("效率", "效率", "efficiency"), t("掌控", "掌控", "control")],
    gifts: [
      gift(t("成果", "成果", "Results"), t("你很快能分辨什麼只是忙，什麼才算做成。", "你很快能分辨什么只是忙，什么才算做成。", "You can tell busywork from a finished result quickly.")),
      gift(t("資源", "资源", "Resources"), t("人、錢、時間到你手上，會被重新排隊。", "人、钱、时间到你手上，会被重新排队。", "People, money and time get reordered when they reach you.")),
      gift(t("權責", "权责", "Authority"), t("你知道誰該做決定，也受不了責任懸空。", "你知道谁该做决定，也受不了责任悬空。", "You know who should decide, and you cannot stand a floating responsibility.")),
      gift(t("效率", "效率", "Efficiency"), t("重複的浪費會讓你坐不住。", "重复的浪费会让你坐不住。", "Repeated waste will not let you sit still.")),
      gift(t("掌控", "掌控", "Control"), t("局面一散，你會想把舵重新握回來。", "局面一散，你会想把舵重新握回来。", "When the field scatters, you want the helm back in your hands.")),
    ],
    challenge: t("把價值只看成成果、過度控制，或在壓力下忽略人與恢復成本。", "把价值只看成成果、过度控制，或在压力下忽略人与恢复成本。", "Reducing value to outcomes alone, over-controlling, or ignoring people and recovery costs under pressure."),
    challenges: [
      t("只拿成果衡量自己", "只拿成果衡量自己", "Measuring yourself only by outcomes"),
      t("控制過了頭，身邊的人喘不過氣", "控制过了头，身边的人喘不过气", "Control so tight that people around you cannot breathe"),
      t("壓力一來就忽略恢復成本", "压力一来就忽略恢复成本", "Ignoring recovery cost the moment pressure arrives"),
    ],
    lesson: t("真正課題是用權責創造成果，但不要讓成果成為唯一的自我評價。人與節奏也是資源。", "真正课题是用权责创造成果，但不要让成果成为唯一的自我评价。人与节奏也是资源。", "The lesson is to use authority to create outcomes without making outcomes your only self-worth. People and pace are resources too."),
    action: t("用權責創造成果，但不要讓成果成為唯一的自我評價。", "用权责创造成果，但不要让成果成为唯一的自我评价。", "Use authority to create outcomes without making outcomes your only measure of self-worth."),
    directions: [t("管理／商業", "管理／商业", "management / business"), t("資源配置／談判", "资源配置／谈判", "allocation / negotiation"), t("結果導向專案", "结果导向项目", "results-driven projects")],
  },
  9: {
    name: t("整合者", "整合者", "Integrator"),
    core: t("你容易把個人經驗放進更大的背景裡看，對人性、意義與整體影響較敏感，也需要學會真正完成與放手。", "你容易把个人经验放进更大的背景里看，对人性、意义与整体影响较敏感，也需要学会真正完成与放手。", "You naturally place personal experience inside a larger picture and notice meaning, humanity, and wider impact. You also need to know when a cycle is complete."),
    soul: t("「個人的故事會接到更大的畫面。我這一生，是拿來完成與給出的。」", "“个人的故事会接到更大的画面。我这一生，是拿来完成与给出的。”", "“A personal story joins a larger picture. This life is for completing and giving.”"),
    role: t("你是把零散經驗收成整體的人。一件事對你很少只是這一件事，它會連到更大的意義、更遠的人。", "你是把零散经验收成整体的人。一件事对你很少只是这一件事，它会连到更大的意义、更远的人。", "You gather scattered experience into a whole. For you a single event is rarely only itself."),
    words: [t("整合", "整合", "integration"), t("同理", "同理", "empathy"), t("視野", "视野", "perspective"), t("完成", "完成", "completion"), t("意義", "意义", "meaning")],
    gifts: [
      gift(t("整合", "整合", "Integration"), t("不相干的線，到你這裡常常會結成一幅圖。", "不相干的线，到你这里常常会结成一幅图。", "Unrelated threads often become one picture with you.")),
      gift(t("同理", "同理", "Empathy"), t("你能站進別人的位置，而不只是評論。", "你能站进别人的位置，而不只是评论。", "You can stand in another person's place, not only comment from outside.")),
      gift(t("視野", "视野", "Perspective"), t("你習慣把眼前這一步放到更長的時間裡看。", "你习惯把眼前这一步放到更长的时间里看。", "You place the present step inside a longer stretch of time.")),
      gift(t("完成", "完成", "Completion"), t("你知道有些循環該收口，而不是無限延期。", "你知道有些循环该收口，而不是无限延期。", "You know some cycles need a close, not an endless delay.")),
      gift(t("意義", "意义", "Meaning"), t("做事若只剩功能，你會覺得缺了一截。", "做事若只剩功能，你会觉得缺了一截。", "If the work is only function, you feel a missing piece.")),
    ],
    challenge: t("對人或理想投入過多、捨不得結束已完成的階段，或把同理心變成替別人承擔。", "对人或理想投入过多、舍不得结束已完成的阶段，或把同理心变成替别人承担。", "Remaining invested after a cycle has ended, or turning empathy into carrying what belongs to others."),
    challenges: [
      t("對人或理想投入過久，該走還不走", "对人或理想投入过久，该走还不走", "Staying after the cycle has already ended"),
      t("把同理心變成替別人扛", "把同理心变成替别人扛", "Turning empathy into carrying someone else's load"),
      t("捨不得結束，完成變成拖延", "舍不得结束，完成变成拖延", "Refusing the ending until completion becomes delay"),
    ],
    lesson: t("真正課題是保留善意，但接受有些完成就是放手。給出不是無限延期。", "真正课题是保留善意，但接受有些完成就是放手。给出不是无限延期。", "The lesson is to keep the goodwill and still let some cycles end. Giving is not endless postponement."),
    action: t("保留善意，但接受有些完成就是放手。", "保留善意，但接受有些完成就是放手。", "Keep the goodwill, but accept that some forms of completion require letting go."),
    directions: [t("文化／公共內容", "文化／公共内容", "culture / public content"), t("跨域整合", "跨域整合", "cross-domain integration"), t("人文視角工作", "人文视角工作", "human-centred work")],
  },
  11: {
    name: t("啟蒙者", "启蒙者", "Inspirer"),
    core: t("11 的核心是高敏銳度：你常較早感到氣氛、細微變化與尚未成形的可能。敏感要落地成作品、決定或清楚表達，才會變成力量。", "11 的核心是高敏锐度：你常较早感到气氛、细微变化与尚未成形的可能。敏感要落地成作品、决定或清楚表达，才会变成力量。", "11 centres on heightened sensitivity. You may notice atmosphere and emerging possibilities early; the signal becomes useful when it turns into clear expression or action."),
    soul: t("「我看見別人還沒說出口的光。真正的功課是把它變成可給出的方向，而不是把自己燒乾。」", "“我看见别人还没说出口的光。真正的功课是把它变成可给出的方向，而不是把自己烧干。”", "“I see the light before it is spoken. The work is to give it a direction, not to burn myself out.”"),
    role: t("你是靈敏的橋樑。個人感受會接到更大的集體氣氛；你的存在本身，常常就能讓旁邊的人重新對準方向。這不是較高等級，而是更重的感受負荷。", "你是灵敏的桥梁。个人感受会接到更大的集体气氛；你的存在本身，常常就能让旁边的人重新对准方向。这不是较高等级，而是更重的感受负荷。", "You are a sensitive bridge. Private feeling joins a wider atmosphere; your presence can retune a room. That is not a higher rank, it is a heavier sensory load."),
    words: [t("直覺", "直觉", "intuition"), t("靈感", "灵感", "inspiration"), t("敏銳", "敏锐", "sensitivity"), t("洞察", "洞察", "insight"), t("啟發", "启发", "influence")],
    gifts: [
      gift(t("直覺先至", "直觉先至", "Early intuition"), t("氣氛還沒被命名，你往往已經感到轉向。", "气氛还没被命名，你往往已经感到转向。", "You often feel the turn before the atmosphere has a name.")),
      gift(t("感受載體", "感受载体", "Feeling as vessel"), t("你能承接別人還沒說清楚的情緒，並把它變成可理解的語言。", "你能承接别人还没说清楚的情绪，并把它变成可理解的语言。", "You can hold an unspoken feeling and turn it into language.")),
      gift(t("點亮表達", "点亮表达", "Illuminating speech"), t("一句準的話、一個圖像，就能讓人重新看見自己。", "一句准的话、一个图像，就能让人重新看见自己。", "One accurate sentence or image can help someone see themselves again.")),
      gift(t("集體感知", "集体感知", "Collective sensing"), t("你對一群人的走向比對單一事件更敏感。", "你对一群人的走向比对单一事件更敏感。", "You are more sensitive to the direction of a group than to a single event.")),
      gift(t("高處對準", "高处对准", "Higher alignment"), t("你會把日常選擇對準一個更長、更乾淨的方向。", "你会把日常选择对准一个更长、更干净的方向。", "You aim ordinary choices at a longer, cleaner direction.")),
    ],
    challenge: t("感受太多而過度思考、緊張、自我懷疑，或把每個細微信號都放大。", "感受太多而过度思考、紧张、自我怀疑，或把每个细微信号都放大。", "Overthinking, tension, self-doubt, or treating every subtle signal as equally important."),
    challenges: [
      t("感受太多，把每個細訊都放大", "感受太多，把每个细讯都放大", "Amplifying every faint signal"),
      t("理想一碰現實就自我懷疑", "理想一碰现实就自我怀疑", "Self-doubt as soon as the ideal meets reality"),
      t("想照顧所有訊號，反而忽略身體", "想照顾所有讯号，反而忽略身体", "Attending to every signal and ignoring the body"),
      t("敏感沒有邊界，就變成長期緊繃", "敏感没有边界，就变成长期紧绷", "Sensitivity without a boundary becoming constant tension"),
    ],
    lesson: t("學會在敏銳與邊界之間站穩。真正的啟發不是犧牲自己，而是把看見的光，用可被理解的方式交給世界。", "学会在敏锐与边界之间站稳。真正的启发不是牺牲自己，而是把看见的光，用可被理解的方式交给世界。", "Stand between sensitivity and a boundary. Real inspiration is not self-erasure; it is giving the light a form others can use."),
    action: t("建立情緒邊界，用現實驗證把敏銳轉成具體輸出。", "建立情绪边界，用现实验证把敏锐转成具体输出。", "Build emotional boundaries and use reality checks to turn sensitivity into concrete output."),
    directions: [
      t("心靈成長／諮詢", "心灵成长／咨询", "inner work / counselling"),
      t("教學／寫作", "教学／写作", "teaching / writing"),
      t("內容與表達", "内容与表达", "content / expression"),
      t("藝術／音樂", "艺术／音乐", "art / music"),
      t("公開分享", "公开分享", "public sharing"),
      t("公益與公共服務", "公益与公共服务", "public service"),
      t("身心支持工作", "身心支持工作", "body-mind support work"),
    ],
  },
  22: {
    name: t("築夢者", "筑梦者", "Master Builder"),
    core: t("22 的重點不是只會做大夢，而是把大願景拆成能落地、能協作、能長期維持的結構。真正優勢在長線建設。", "22 的重点不是只会做大梦，而是把大愿景拆成能落地、能协作、能长期维持的结构。真正优势在长线建设。", "22 is not just about large dreams. Its strength is turning a big vision into a structure that can be built, shared, and sustained over time."),
    soul: t("「大願要能落地。我不是來做一個漂亮的夢，是來把夢建成能住的地方。」", "“大愿要能落地。我不是来做一个漂亮的梦，是来把梦建成能住的地方。”", "“A large wish has to land. I am not here to keep a pretty dream, but to build a place that can be lived in.”"),
    role: t("你是把遠景砌成結構的人。11 看見可能，22 負責讓可能變成可走、可協作、可維持的工程。這同樣不是較高等級，而是更長的工期。", "你是把远景砌成结构的人。11 看见可能，22 负责让可能变成可走、可协作、可维持的工程。这同样不是较高等级，而是更长的工期。", "You turn a far view into structure. Eleven sees a possibility; twenty-two makes it a path that can be walked, shared and kept. That is not a higher rank, it is a longer build."),
    words: [t("願景", "愿景", "vision"), t("建設", "建设", "building"), t("組織", "组织", "organisation"), t("執行", "执行", "execution"), t("長線", "长线", "long-range")],
    gifts: [
      gift(t("願景尺度", "愿景尺度", "Scale of vision"), t("你看見的不是一週，是一座還能住人的架構。", "你看见的不是一周，是一座还能住人的架构。", "You see more than a week; you see a structure people could live in.")),
      gift(t("拆解能力", "拆解能力", "Decomposition"), t("大目標到你手上，可以被切成階段與責任。", "大目标到你手上，可以被切成阶段与责任。", "A large goal can be cut into stages and responsibilities in your hands.")),
      gift(t("組織骨架", "组织骨架", "Organising spine"), t("你能讓一群人圍著同一份圖紙工作。", "你能让一群人围着同一份图纸工作。", "You can get a group of people working from the same drawing.")),
      gift(t("落地執行", "落地执行", "Grounded execution"), t("你在意的是這一步能不能真正被做完。", "你在意的是这一步能不能真正被做完。", "You care whether this step can actually be finished.")),
      gift(t("長線耐力", "长线耐力", "Long-range stamina"), t("你受得住不是立刻被看見的建設。", "你受得住不是立刻被看见的建设。", "You can bear building that is not immediately visible.")),
    ],
    challenge: t("目標太大、標準太高而拖延，或一開始就想承擔整個工程。", "目标太大、标准太高而拖延，或一开始就想承担整个工程。", "Delay caused by huge goals, very high standards, or trying to carry the whole project from day one."),
    challenges: [
      t("目標太大，第一步遲遲跨不出去", "目标太大，第一步迟迟跨不出去", "A goal so large the first step never happens"),
      t("標準太高，工程變成自我審判", "标准太高，工程变成自我审判", "Standards so high the work becomes self-trial"),
      t("一開始就想扛整座建築", "一开始就想扛整座建筑", "Trying to carry the whole building on day one"),
      t("看見缺陷就停，而不是改下一層", "看见缺陷就停，而不是改下一层", "Stopping at every defect instead of revising the next layer"),
    ],
    lesson: t("把願景拆成階段、責任與里程碑。真正的建設是一步一步蓋出來，不是一次夢見完成。", "把愿景拆成阶段、责任与里程碑。真正的建设是一步一步盖出来，不是一次梦见完成。", "Break the vision into stages, responsibilities and milestones. Real building is done step by step, not finished in one dream."),
    action: t("拆成階段、責任與里程碑，一步一步把願景蓋出來。", "拆成阶段、责任与里程碑，一步一步把愿景盖出来。", "Break the vision into stages, responsibilities, and milestones, then build it step by step."),
    directions: [
      t("大型專案／平台", "大型项目／平台", "large projects / platforms"),
      t("組織與系統建設", "组织与系统建设", "organisational systems"),
      t("長期創業／產品", "长期创业／产品", "long-term ventures / products"),
      t("空間／城市與公共建設", "空间／城市与公共建设", "spatial / civic building"),
      t("教育體系與制度設計", "教育体系与制度设计", "education systems / policy design"),
      t("跨團隊協作工程", "跨团队协作工程", "cross-team construction"),
      t("可持續產品與基礎設施", "可持续产品与基础设施", "durable products / infrastructure"),
    ],
  },
  33: {
    name: t("療癒者／導師", "疗愈者／导师", "Healer / Guide"),
    core: t("33 的核心是高度關懷與影響力。你可能自然成為傾聽、教導或引導的人；真正課題是關懷而不自我耗盡。", "33 的核心是高度关怀与影响力。你可能自然成为倾听、教导或引导的人；真正课题是关怀而不自我耗尽。", "33 centres on care and influence. You may naturally listen, teach, or guide; the real task is caring without depleting yourself."),
    soul: t("「關懷是力量，不是自我消失。我要把愛活成可持續的支持。」", "“关怀是力量，不是自我消失。我要把爱活成可持续的支持。”", "“Care is a force, not self-erasure. Love has to become support that can last.”"),
    role: t("你是把人帶回自己節奏的人。傾聽、教導、陪伴會自然發生；可是你來此不是為了替所有人燃盡。這不是較高等級，而是更需要邊界的關懷。", "你是把人带回自己节奏的人。倾听、教导、陪伴会自然发生；可是你来此不是为了替所有人燃尽。这不是较高等级，而是更需要边界的关怀。", "You bring people back to their own pace. Listening, teaching and companionship happen naturally; you are not here to burn out for everyone. That is not a higher rank, it is care that needs a boundary."),
    words: [t("關懷", "关怀", "care"), t("同理", "同理", "empathy"), t("教導", "教导", "teaching"), t("療癒", "疗愈", "healing"), t("影響", "影响", "influence")],
    gifts: [
      gift(t("深層關懷", "深层关怀", "Deep care"), t("你能看見一個人疲憊底下真正需要被守住的那一截。", "你能看见一个人疲惫底下真正需要被守住的那一截。", "You can see, under fatigue, the part of a person that still needs to be kept.")),
      gift(t("同理容器", "同理容器", "Empathic vessel"), t("別人的故事進到你這裡，會被聽完，而不是被急著修正。", "别人的故事进到你这里，会被听完，而不是被急着修正。", "A story that reaches you is heard through, not hastily corrected.")),
      gift(t("教導傳遞", "教导传递", "Teaching"), t("你能把自己走過的路，變成別人也能用的語言。", "你能把自己走过的路，变成别人也能用的语言。", "You can turn a path you have walked into language someone else can use.")),
      gift(t("修復陪伴", "修复陪伴", "Restorative presence"), t("你的在場本身，常能讓現場從緊繃回到可呼吸。", "你的在场本身，常能让现场从紧绷回到可呼吸。", "Your presence often lets a tight room breathe again.")),
      gift(t("長遠影響", "长远影响", "Lasting influence"), t("你留下的不是一次安慰，而是別人之後還能自己走的方向。", "你留下的不是一次安慰，而是别人之后还能自己走的方向。", "What you leave is not one consolation, but a direction the other person can walk later.")),
    ],
    challenge: t("替別人承擔太多、把愛等同犧牲，或因為想照顧所有人而失去自己的節奏。", "替别人承担太多、把爱等同牺牲，或因为想照顾所有人而失去自己的节奏。", "Carrying too much for others, equating care with sacrifice, or losing your own rhythm while supporting everyone else."),
    challenges: [
      t("替別人承擔太多，愛被做成犧牲", "替别人承担太多，爱被做成牺牲", "Carrying too much until love becomes sacrifice"),
      t("想照顧所有人，自己的節奏先沒了", "想照顾所有人，自己的节奏先没了", "Trying to care for everyone until your own pace is gone"),
      t("責任過重，關懷變成疲憊", "责任过重，关怀变成疲惫", "So much responsibility that care turns into fatigue"),
      t("界限不清，別人的痛變成你的作業", "界限不清，别人的痛变成你的作业", "No boundary, so another person's pain becomes your homework"),
    ],
    lesson: t("學會在服務與自我之間找到平衡。真正的關懷不是犧牲自己，而是活出完整與豐盛，讓支持可以長期流動。", "学会在服务与自我之间找到平衡。真正的关怀不是牺牲自己，而是活出完整与丰盛，让支持可以长期流动。", "Find the balance between service and self. Real care is not self-sacrifice; it is living fully enough that support can keep flowing."),
    action: t("先保留自己的能量與邊界，再把關懷變成可持續的支持。", "先保留自己的能量与边界，再把关怀变成可持续的支持。", "Protect your energy and boundaries first, then turn care into sustainable support."),
    directions: [
      t("教育／引導", "教育／引导", "education / guidance"),
      t("服務／照顧", "服务／照顾", "service / care"),
      t("身心支持工作", "身心支持工作", "body-mind support"),
      t("諮詢與陪伴", "咨询与陪伴", "counselling / companionship"),
      t("藝術治療與表達", "艺术治疗与表达", "expressive / restorative arts"),
      t("社群與公共關懷", "社群与公共关怀", "community care"),
      t("以人為核心的專業", "以人为核心的专业", "human-centred professional work"),
    ],
  },
};
