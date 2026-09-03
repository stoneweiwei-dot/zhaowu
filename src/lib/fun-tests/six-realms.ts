import type { Locale } from "@/lib/i18n";

export type SixRealmKey = "A" | "B" | "C" | "D" | "E" | "F";

export type SixRealmQuestion = {
  title: string;
  answers: Array<{ key: SixRealmKey; label: string }>;
};

export type SixRealmResult = {
  name: string;
  summary: string;
  watch: string;
  practice: string;
};

const keys: SixRealmKey[] = ["A", "B", "C", "D", "E", "F"];

function q(title: string, labels: [string, string, string, string, string, string]): SixRealmQuestion {
  return { title, answers: labels.map((label, index) => ({ key: keys[index], label })) };
}

export const SIX_REALM_QUESTIONS: Record<Locale, SixRealmQuestion[]> = {
  "zh-Hant": [
    q("當你突然獲得一筆意外之財（或額外好處），你的第一反應是？", ["開心收下，覺得『本來就該是我的』，繼續享受當下", "立刻想怎麼用這筆錢勝過別人、證明自己更強", "先規劃怎麼合理運用，也考慮是否分享給需要的人", "沒特別感覺，隨便花掉或放著不管", "開始焦慮『會不會不夠用』『要不要再多賺一點』，捨不得用", "覺得這世界不公平，或懷疑這筆錢會不會有問題"]),
    q("跟朋友或同事發生意見不合時，你通常會？", ["懶得爭，覺得『他們不懂我的高度』，直接抽離", "一定要把道理講清楚、爭贏為止，輸了會很不爽", "試著溝通理解，尋求雙方都能接受的平衡", "不太想動腦，隨便附和或轉移話題算了", "很在意自己有沒有吃虧，反覆計較得失", "容易發火、言語變尖銳，事後才後悔"]),
    q("看到別人比你過得好、或得到你也想要的東西時，你心裡第一個念頭是？", ["『啊，他們有福報啊』，然後繼續過自己的日子", "『憑什麼？我比他強／努力，為什麼不是我？』", "『恭喜他，我也可以朝那個方向努力看看』", "沒太大感覺，繼續做自己眼前的事", "『我什麼時候才能也有？會不會永遠輪不到我？』", "心裡冒出『希望他也不會太順』或莫名煩躁"]),
    q("日常小事（例如排隊、等人、交通、小事出錯）讓你不順心時，你的身體與情緒反應？", ["不太受影響，很快就忘了，繼續享受當下", "會明顯不服氣，想找方法『扳回來』或證明自己對", "會有點煩，但能調整心態，繼續往前", "容易懶得處理，拖延或逃避", "會反覆想『為什麼總是我遇到這種事』，感到焦慮或匱乏", "容易瞬間火大、語氣變衝，身體也緊繃"]),
    q("對於『付出』與『得到』的平衡，你平常比較接近哪種狀態？", ["我付出很多也沒關係，因為我本來就比較有餘裕", "付出可以，但一定要被看見、被肯定，不然會覺得不公平", "盡量公平往來，也願意適度幫助別人", "不太主動付出，也不太主動要求，得過且過", "很在意自己有沒有得到對等回報，容易覺得『我總是給太多』", "付出後若不如預期，容易產生怨恨或攻擊性想法"]),
    q("當你獨處、沒有外在壓力時，內心最常出現的狀態是？", ["輕鬆、自在，甚至有點『人間事與我無關』的悠然", "還是會想著怎麼量化自己、怎麼贏過某些人或目標", "會反思自己、規劃生活，也會有各種情緒起落", "容易發呆、放空、想睡覺或沉浸在感官享受", "腦海常轉著『不夠、缺少、擔心失去』之類的念頭", "容易出現煩躁、憤怒、或對過去人事的怨氣"]),
  ],
  "zh-Hans": [
    q("当你突然获得一笔意外之财（或额外好处），你的第一反应是？", ["开心收下，觉得『本来就该是我的』，继续享受当下", "立刻想怎么用这笔钱胜过别人、证明自己更强", "先规划怎么合理运用，也考虑是否分享给需要的人", "没特别感觉，随便花掉或放着不管", "开始焦虑『会不会不够用』『要不要再多赚一点』，舍不得用", "觉得这世界不公平，或怀疑这笔钱会不会有问题"]),
    q("跟朋友或同事发生意见不合时，你通常会？", ["懒得争，觉得『他们不懂我的高度』，直接抽离", "一定要把道理讲清楚、争赢为止，输了会很不爽", "试着沟通理解，寻求双方都能接受的平衡", "不太想动脑，随便附和或转移话题算了", "很在意自己有没有吃亏，反复计较得失", "容易发火、言语变尖锐，事后才后悔"]),
    q("看到别人比你过得好、或得到你也想要的东西时，你心里第一个念头是？", ["『啊，他们有福报啊』，然后继续过自己的日子", "『凭什么？我比他强／努力，为什么不是我？』", "『恭喜他，我也可以朝那个方向努力看看』", "没太大感觉，继续做自己眼前的事", "『我什么时候才能也有？会不会永远轮不到我？』", "心里冒出『希望他也不会太顺』或莫名烦躁"]),
    q("日常小事（例如排队、等人、交通、小事出错）让你不顺心时，你的身体与情绪反应？", ["不太受影响，很快就忘了，继续享受当下", "会明显不服气，想找方法『扳回来』或证明自己对", "会有点烦，但能调整心态，继续往前", "容易懒得处理，拖延或逃避", "会反复想『为什么总是我遇到这种事』，感到焦虑或匮乏", "容易瞬间火大、语气变冲，身体也紧绷"]),
    q("对于『付出』与『得到』的平衡，你平常比较接近哪种状态？", ["我付出很多也没关系，因为我本来就比较有余裕", "付出可以，但一定要被看见、被肯定，不然会觉得不公平", "尽量公平往来，也愿意适度帮助别人", "不太主动付出，也不太主动要求，得过且过", "很在意自己有没有得到对等回报，容易觉得『我总是给太多』", "付出后若不如预期，容易产生怨恨或攻击性想法"]),
    q("当你独处、没有外在压力时，内心最常出现的状态是？", ["轻松、自在，甚至有点『人间事与我无关』的悠然", "还是会想着怎么量化自己、怎么赢过某些人或目标", "会反思自己、规划生活，也会有各种情绪起落", "容易发呆、放空、想睡觉或沉浸在感官享受", "脑海常转着『不够、缺少、担心失去』之类的念头", "容易出现烦躁、愤怒、或对过去人事的怨气"]),
  ],
  en: [
    q("You unexpectedly receive extra money or another unplanned benefit. What is your first reaction?", ["Enjoy it easily and feel that good things naturally come my way", "Think about how to use it to get ahead or prove myself", "Plan how to use it sensibly and consider sharing some of it", "Feel fairly neutral and spend or leave it without much thought", "Worry that it may not be enough and become reluctant to use it", "Feel suspicious, irritated or focused on how unfair things are"]),
    q("A friend or colleague strongly disagrees with you. What do you usually do?", ["Withdraw because arguing feels beneath the situation", "Keep arguing until my point is recognised or I win", "Try to understand both sides and find workable common ground", "Avoid thinking about it too much and go along or change the subject", "Replay whether I was treated fairly or lost out", "Become sharp or angry quickly and regret the tone later"]),
    q("Someone else gets something you also wanted. What is your first inner response?", ["Good for them; I return to my own life", "Why them? I am just as capable or have worked harder", "Congratulations; I can work toward something similar", "Not much reaction; I stay with whatever I was already doing", "When will it be my turn? What if I never have enough?", "I feel irritated or catch myself wishing things were less easy for them"]),
    q("A small everyday inconvenience throws things off. What happens first?", ["It barely sticks; I move on quickly", "I want to push back, correct it or prove I was right", "I get annoyed but can reset and continue", "I delay, avoid or hope the problem disappears", "I keep thinking about why this always happens to me", "I become tense, angry or abrupt very quickly"]),
    q("Which pattern best describes how you think about giving and receiving?", ["I can give freely because I usually feel I have enough", "I can give, but I need the effort to be seen and recognised", "I prefer fair exchange and I am also willing to help", "I rarely initiate much either way and tend to let things drift", "I closely track whether I am getting an equal return", "If giving does not produce what I expected, resentment can rise quickly"]),
    q("When you are alone and under no outside pressure, what state appears most often?", ["Light, comfortable and detached from everyday drama", "Still measuring progress and thinking about how to outperform a target", "Reflecting, planning and moving through a normal mix of emotions", "Drifting, zoning out, sleeping or seeking sensory comfort", "Thinking about what is missing, not enough or could be lost", "Feeling restless, angry or pulled back into old resentment"]),
  ],
};

export const SIX_REALM_RESULTS: Record<Locale, Record<SixRealmKey, SixRealmResult>> = {
  "zh-Hant": {
    A: { name: "天道習氣", summary: "你較容易帶著『本來就會順』『我還有餘裕』的感受，對小事不太執著。", watch: "留意慢心、過度安逸，或因為當下順遂而減少自我反省。", practice: "練習居安思危與分享，把自己的餘裕變成真正能幫助人的力量。" },
    B: { name: "阿修羅道習氣", summary: "你有很強的競爭動能、不服輸，也希望能力被看見。", watch: "留意比較、嫉妒，以及把輸贏變成自我價值的主要尺度。", practice: "把爭勝轉成精進：不必贏過誰，只需要把力量放進真正有價值的成長。" },
    C: { name: "人道習氣", summary: "你較接近平衡而複雜的人間狀態：會思考、會掙扎，也保有選擇與調整的能力。", watch: "留意在情緒與選擇間反覆搖擺，或對自己忽高忽低的要求。", practice: "把能思考、能選擇的能力用好，持續覺察習慣並做更清楚的選擇。" },
    D: { name: "畜生道習氣", summary: "你較容易憑習慣、直覺與當下舒服程度行動，不太喜歡把事情想得過度複雜。", watch: "留意懈怠、逃避思考，或被感官與既有習慣牽著走。", practice: "多想一步、多問一句『為什麼』，把自動反應慢慢變成有意識的選擇。" },
    E: { name: "餓鬼道習氣", summary: "你對得失、資源與安全感較敏感，容易覺得還不夠、還需要更多。", watch: "留意匱乏感、過度計較，以及得到之後仍難以真正安心。", practice: "練習看見『已經夠了』，也練習分享時間、注意力與資源。" },
    F: { name: "地獄道習氣", summary: "你在壓力或不順時，情緒力道可能來得快而直接。", watch: "留意憤怒、尖銳與長時間抓住怨氣，避免讓一時情緒替你做決定。", practice: "先停三秒，再決定怎麼說、怎麼做；把怒氣轉成清楚的界線與保護。" },
  },
  "zh-Hans": {
    A: { name: "天道习气", summary: "你较容易带着『本来就会顺』『我还有余裕』的感受，对小事不太执着。", watch: "留意慢心、过度安逸，或因为当下顺遂而减少自我反省。", practice: "练习居安思危与分享，把自己的余裕变成真正能帮助人的力量。" },
    B: { name: "阿修罗道习气", summary: "你有很强的竞争动能、不服输，也希望能力被看见。", watch: "留意比较、嫉妒，以及把输赢变成自我价值的主要尺度。", practice: "把争胜转成精进：不必赢过谁，只需要把力量放进真正有价值的成长。" },
    C: { name: "人道习气", summary: "你较接近平衡而复杂的人间状态：会思考、会挣扎，也保有选择与调整的能力。", watch: "留意在情绪与选择间反复摇摆，或对自己忽高忽低的要求。", practice: "把能思考、能选择的能力用好，持续觉察习惯并做更清楚的选择。" },
    D: { name: "畜生道习气", summary: "你较容易凭习惯、直觉与当下舒服程度行动，不太喜欢把事情想得过度复杂。", watch: "留意懈怠、逃避思考，或被感官与既有习惯牵着走。", practice: "多想一步、多问一句『为什么』，把自动反应慢慢变成有意识的选择。" },
    E: { name: "饿鬼道习气", summary: "你对得失、资源与安全感较敏感，容易觉得还不够、还需要更多。", watch: "留意匮乏感、过度计较，以及得到之后仍难以真正安心。", practice: "练习看见『已经够了』，也练习分享时间、注意力与资源。" },
    F: { name: "地狱道习气", summary: "你在压力或不顺时，情绪力道可能来得快而直接。", watch: "留意愤怒、尖锐与长时间抓住怨气，避免让一时情绪替你做决定。", practice: "先停三秒，再决定怎么说、怎么做；把怒气转成清楚的边界与保护。" },
  },
  en: {
    A: { name: "Heaven-realm habit", summary: "You often move from a sense that life will work out and that you have enough room to breathe.", watch: "Watch for complacency, superiority or losing the urge to reflect when life is going well.", practice: "Keep perspective and share some of your spare capacity with others." },
    B: { name: "Asura-realm habit", summary: "You carry strong competitive drive, dislike losing and want your ability to be recognised.", watch: "Watch comparison, envy and making winning the main measure of your worth.", practice: "Turn competition into disciplined improvement rather than needing to beat a person." },
    C: { name: "Human-realm habit", summary: "You show a balanced but complex human pattern: reflection, mixed emotions and the ability to choose differently.", watch: "Watch repeated indecision or swinging between being too hard and too easy on yourself.", practice: "Use your capacity to reflect and choose deliberately instead of running on habit." },
    D: { name: "Animal-realm habit", summary: "You tend to rely on routine, instinct and immediate comfort rather than overcomplicating things.", watch: "Watch passivity, avoidance of thought and being pulled along by comfort or habit.", practice: "Pause one step longer and ask why before turning an automatic reaction into action." },
    E: { name: "Hungry-ghost habit", summary: "You are sensitive to resources, fairness and security, and can easily feel there is still not enough.", watch: "Watch scarcity thinking, score-keeping and difficulty feeling settled even after getting more.", practice: "Notice what is already enough, and practise giving time, attention or resources without tracking every return." },
    F: { name: "Hell-realm habit", summary: "When things go wrong, emotional intensity can arrive quickly and directly.", watch: "Watch anger, sharpness and holding on to resentment long enough that it starts making decisions for you.", practice: "Pause for three seconds before speaking or acting, then turn the energy into a clear boundary." },
  },
};

export function scoreSixRealmAnswers(answers: SixRealmKey[]) {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<SixRealmKey, number>;
  for (const answer of answers) counts[answer] += 1;

  const scoreBands = [...new Set(keys.map((key) => counts[key]).filter((value) => value > 0))].sort((a, b) => b - a);
  const primaryScore = scoreBands[0] ?? 0;
  const secondaryScore = scoreBands[1] ?? 0;
  const primary = primaryScore > 0 ? keys.filter((key) => counts[key] === primaryScore) : [];
  const secondary = secondaryScore > 0 ? keys.filter((key) => counts[key] === secondaryScore) : [];

  return {
    counts,
    winners: primary,
    tied: primary.length > 1,
    primary,
    secondary,
  };
}
