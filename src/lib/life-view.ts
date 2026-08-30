import type { Locale } from "@/lib/i18n";

export type LifeViewArticle = {
  id: string;
  publishedAt: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  body: Record<Locale, string>;
};

/**
 * Stone's essays for the public "昭梧 · 觀世錄" section.
 * New chat-submitted articles are appended here so the website has one
 * stable source of truth and no database/schema change is required.
 */
export const LIFE_VIEW_ARTICLES: LifeViewArticle[] = [
  {
    id: "break-the-deadlock",
    publishedAt: "2026-08-30",
    title: {
      "zh-Hant": "破局之前，先修心",
      "zh-Hans": "破局之前，先修心",
      en: "Before You Break Through, Steady the Mind",
    },
    summary: {
      "zh-Hant": "真正的破局，不只靠方法，也靠你能不能放下執著、看淡得失，把力氣留給真正能解決的事。",
      "zh-Hans": "真正的破局，不只靠方法，也靠你能不能放下执着、看淡得失，把力气留给真正能解决的事。",
      en: "A real breakthrough is not only about strategy. It also depends on letting go of fixation, seeing gain and loss clearly, and keeping your energy for what can actually be changed.",
    },
    body: {
      "zh-Hant": "人生不是用來演繹完美，而是用來經歷。很多痛苦不是因為事情本身有多大，而是我們死死抓住某一個結果：一定要被理解、一定要得到、一定不能失去、一定不能出錯。當一件事被我們認定成唯一答案，心就被它困住了。\n\n我理解的修心，不是什麼都不在乎，而是不讓念頭、愛恨、得失成為枷鎖。能做的事就做，能解決的問題就解決；解決不了，就換方法、換時間、換角度。真正的強大，是心裡有事，仍然能把力氣用在處理事情，而不是被情緒拖著走。\n\n人生的高度，很多時候不在於看清多少，而在於看輕多少；心的寬度，也不在於認識多少人，而在於容得下多少不同。做人如山，能容萬物；做人如水，知進也知退。看淡，不等於消極，而是知道什麼值得用力，什麼應該放過自己。\n\n所以破局之前，先問自己：我現在是在解決問題，還是在守住一個執念？當你不再把所有事都當成生死局，路反而會開始出現。",
      "zh-Hans": "人生不是用来演绎完美，而是用来经历。很多痛苦不是因为事情本身有多大，而是我们死死抓住某一个结果：一定要被理解、一定要得到、一定不能失去、一定不能出错。当一件事被我们认定成唯一答案，心就被它困住了。\n\n我理解的修心，不是什么都不在乎，而是不让念头、爱恨、得失成为枷锁。能做的事就做，能解决的问题就解决；解决不了，就换方法、换时间、换角度。真正的强大，是心里有事，仍然能把力气用在处理事情，而不是被情绪拖着走。\n\n人生的高度，很多时候不在于看清多少，而在于看轻多少；心的宽度，也不在于认识多少人，而在于容得下多少不同。做人如山，能容万物；做人如水，知进也知退。看淡，不等于消极，而是知道什么值得用力，什么应该放过自己。\n\n所以破局之前，先问自己：我现在是在解决问题，还是在守住一个执念？当你不再把所有事都当成生死局，路反而会开始出现。",
      en: "Life is not a performance of perfection. It is something to be lived. A great deal of suffering comes not from the size of the event itself, but from clinging to one required outcome: I must be understood, I must get this, I must not lose, I must not fail. The moment we make one outcome the only acceptable answer, the mind becomes trapped by it.\n\nFor me, inner practice does not mean becoming indifferent. It means refusing to let thoughts, attachment, love, resentment, gain or loss become chains. Do what can be done. Solve what can be solved. If one method fails, change the method, the timing or the angle. Strength is not having no emotion; it is being able to keep your energy on the problem instead of handing control to the emotion.\n\nThe height of a life is often shaped less by how much you can see through and more by how much you can hold lightly. The width of the mind is not the number of people you know, but how much difference you can contain. Be like a mountain that can hold many things, and like water that knows when to advance and when to withdraw.\n\nBefore trying to break through, ask one question: am I solving the problem, or protecting an attachment? When everything stops feeling like a final battle, more than one road usually becomes visible.",
    },
  },
  {
    id: "awakening-and-reality",
    publishedAt: "2026-08-30",
    title: {
      "zh-Hant": "覺醒，不是逃離現實",
      "zh-Hans": "觉醒，不是逃离现实",
      en: "Awakening Is Not Escaping Reality",
    },
    summary: {
      "zh-Hant": "真正的清醒，是能接納無常、看見自己的情緒與慣性，同時仍然在現實裡做選擇、負責任、長期行動。",
      "zh-Hans": "真正的清醒，是能接纳无常、看见自己的情绪与惯性，同时仍然在现实里做选择、负责任、长期行动。",
      en: "Clarity means accepting change, noticing your own patterns, and still making grounded choices, taking responsibility and acting for the long term.",
    },
    body: {
      "zh-Hant": "我不把覺醒理解成離開現實，也不把修行理解成把自己藏進一套漂亮的道理裡。真正的覺醒，反而是越來越能看清自己的念頭、情緒、慾望和恐懼，知道它們會出現，但不必每一次都照著它們走。\n\n無常不是一句安慰人的話，而是現實本身。關係會變，工作會變，身體會變，人也會變。你越要求一切永遠維持原樣，就越容易與現實拔河。接納不是認輸，而是先承認事情已經如此，再決定下一步怎麼走。\n\n我更相信長期的力量。很多人想一次想通、一次翻身、一次改命，但真正把人拉開差距的，常常是長年累積的認知、勇氣、執行和耐性。快慢不是核心，能不能持續才是。流水不爭先，爭的是滔滔不絕。\n\n所以我理解的修行，最後一定要回到現實：能不能把自己的事做好，能不能在混亂裡保持判斷，能不能在低谷裡不把自己丟掉，能不能在順境裡不失去分寸。能做到這些，比說多少高深的話都重要。",
      "zh-Hans": "我不把觉醒理解成离开现实，也不把修行理解成把自己藏进一套漂亮的道理里。真正的觉醒，反而是越来越能看清自己的念头、情绪、欲望和恐惧，知道它们会出现，但不必每一次都照着它们走。\n\n无常不是一句安慰人的话，而是现实本身。关系会变，工作会变，身体会变，人也会变。你越要求一切永远维持原样，就越容易与现实拔河。接纳不是认输，而是先承认事情已经如此，再决定下一步怎么走。\n\n我更相信长期的力量。很多人想一次想通、一次翻身、一次改命，但真正把人拉开差距的，常常是长年累积的认知、勇气、执行和耐性。快慢不是核心，能不能持续才是。流水不争先，争的是滔滔不绝。\n\n所以我理解的修行，最后一定要回到现实：能不能把自己的事做好，能不能在混乱里保持判断，能不能在低谷里不把自己丢掉，能不能在顺境里不失去分寸。能做到这些，比说多少高深的话都重要。",
      en: "I do not see awakening as leaving reality, and I do not see practice as hiding inside a beautiful philosophy. Real awakening is becoming more able to notice your own thoughts, emotions, wants and fears. They can arise without becoming commands you must obey.\n\nImpermanence is not a comforting slogan. It is the nature of ordinary life. Relationships change, work changes, bodies change and people change. The more we demand that everything stay exactly as it is, the more energy we spend fighting reality. Acceptance is not surrender. It is recognising what is already true, then choosing what to do next.\n\nI trust the long term more than sudden transformation. People often want one insight, one opportunity or one decision to change everything. In reality, the gap between people is usually built through years of accumulated understanding, courage, execution and patience. Speed is secondary. Continuity matters more.\n\nFor me, any inner practice has to return to ordinary life: can you do your work well, think clearly inside disorder, stay with yourself during a low period, and keep proportion when life is going well? Those are more convincing than any impressive theory.",
    },
  },
  {
    id: "belief-and-world",
    publishedAt: "2026-08-30",
    title: {
      "zh-Hant": "信念不是魔法，它會改變你的選擇",
      "zh-Hans": "信念不是魔法，它会改变你的选择",
      en: "Belief Is Not Magic. It Changes Your Choices",
    },
    summary: {
      "zh-Hant": "同一件事，可以被看成證據、阻礙或機會。信念未必直接改變世界，卻會改變你看見什麼、怎麼解讀、最後採取什麼行動。",
      "zh-Hans": "同一件事，可以被看成证据、阻碍或机会。信念未必直接改变世界，却会改变你看见什么、怎么解读、最后采取什么行动。",
      en: "The same event can look like proof, an obstacle or an opportunity. Belief may not magically change the world, but it changes what you notice, how you interpret it and what you do next.",
    },
    body: {
      "zh-Hant": "同樣一個孩子抱著書睡著，有人看到的是用功，有人看到的是沒出息；同樣出身不寬裕，有人把它理解成努力也沒用，有人把它理解成更需要翻身。事情沒有換，詮釋先換了，而詮釋會慢慢改變行動。\n\n這也是我對信念的理解。它不是一句你只要相信就一定會得到的魔法，而是一套長期運作的內在篩選。當你深信自己一定倒楣，大腦更容易抓住失敗的證據；當你相信事情仍有解法，你更可能注意到資源、方法和下一步。心理學裡的確認偏誤與自證預言，都能解釋這種現象的一部分。\n\n我也會把量子物理裡的觀察者概念當作一個比喻，而不是拿它來證明人可以用念頭控制宇宙。物理學談的是測量與系統互動；放回人生，它提醒我的是另一件事：你用什麼框架去看一件事，會影響你如何回應它。\n\n所以真正值得調整的，不是強迫自己天天正能量，而是發現那些已經變成自動反應的句子：我就是不行、我一定很倒楣、別人都不可信。當這些聲音出現時，先停一下，再問：如果這不是唯一解釋，我還能怎麼看？認知一換，行動就可能換；行動一換，人生才真正開始出現不同的結果。",
      "zh-Hans": "同样一个孩子抱着书睡着，有人看到的是用功，有人看到的是没出息；同样出身不宽裕，有人把它理解成努力也没用，有人把它理解成更需要翻身。事情没有换，诠释先换了，而诠释会慢慢改变行动。\n\n这也是我对信念的理解。它不是一句你只要相信就一定会得到的魔法，而是一套长期运作的内在筛选。当你深信自己一定倒霉，大脑更容易抓住失败的证据；当你相信事情仍有解法，你更可能注意到资源、方法和下一步。心理学里的确认偏误与自证预言，都能解释这种现象的一部分。\n\n我也会把量子物理里的观察者概念当作一个比喻，而不是拿它来证明人可以用念头控制宇宙。物理学谈的是测量与系统互动；放回人生，它提醒我的是另一件事：你用什么框架去看一件事，会影响你如何回应它。\n\n所以真正值得调整的，不是强迫自己天天正能量，而是发现那些已经变成自动反应的句子：我就是不行、我一定很倒霉、别人都不可信。当这些声音出现时，先停一下，再问：如果这不是唯一解释，我还能怎么看？认知一换，行动就可能换；行动一换，人生才真正开始出现不同的结果。",
      en: "The same child can fall asleep holding a book and one person sees effort while another sees failure. The same difficult background can be read as proof that effort is pointless or as a reason to build a different life. The event has not changed. The interpretation has, and interpretation gradually changes behaviour.\n\nThat is how I understand belief. It is not magic and it does not guarantee that wanting something makes it happen. It is more like a long-running filter. If you are convinced that you are always unlucky, your mind becomes quicker to collect evidence of failure. If you believe a situation may still have a workable path, you are more likely to notice resources, options and the next move. Confirmation bias and self-fulfilling prophecies describe part of this process.\n\nI sometimes use the observer idea from quantum physics as a metaphor, not as proof that thoughts control the universe. Physics is about measurement and interaction with a system. Applied to ordinary life, the useful reminder is simpler: the frame through which you view an event affects how you respond to it.\n\nThe point is not to force constant positivity. It is to catch the automatic sentences that quietly run your decisions: I cannot do this, I am always unlucky, nobody can be trusted. When one appears, pause and ask: if this is not the only interpretation, what else can I see? A change in interpretation can change action, and changed action is where different outcomes actually begin.",
    },
  },
  {
    id: "relationships-and-boundaries",
    publishedAt: "2026-08-30",
    title: {
      "zh-Hant": "關係走到最後，不過相識一場",
      "zh-Hans": "关系走到最后，不过相识一场",
      en: "In the End, Every Relationship Is a Meeting",
    },
    summary: {
      "zh-Hant": "允許自己做自己，也允許別人做別人。真正的邊界不是冷漠，而是不討要、不糾纏、不替別人活。",
      "zh-Hans": "允许自己做自己，也允许别人做别人。真正的边界不是冷漠，而是不讨要、不纠缠、不替别人活。",
      en: "Let yourself be yourself, and let other people be themselves. Boundaries are not coldness; they mean not begging, clinging or living another person's life for them.",
    },
    body: {
      "zh-Hant": "任何關係走到最後，都不過是相識一場。有人陪得久，有人只走一段；有人讓你安心，有人讓你學會邊界。聚散本身不是對錯，它只是關係在不同時間裡呈現出的樣子。\n\n我越來越認同一句話：允許自己做自己，也允許別人做別人。你不需要把每一個人改造成你期待的樣子，也不必因為別人的選擇就否定自己。真正成熟的關係，不是互相控制，而是彼此有選擇，也彼此承擔選擇的後果。\n\n所以敲不開的門，不要一直敲。伸手討來的糖，和別人真心想給你的糖，本來就不是同一回事。收回熱情、及時止損、體面退場，不代表你沒有感情，而是你開始尊重自己的時間、尊嚴和能量。\n\n有心者有所累，無心者無所謂。既然情出自願，就不要事後把所有付出變成債。能同行時珍惜，不能同行時放下。真正的自由，不是從此不需要任何人，而是不再靠抓住誰來證明自己的價值。",
      "zh-Hans": "任何关系走到最后，都不过是相识一场。有人陪得久，有人只走一段；有人让你安心，有人让你学会边界。聚散本身不是对错，它只是关系在不同时间里呈现出的样子。\n\n我越来越认同一句话：允许自己做自己，也允许别人做别人。你不需要把每一个人改造成你期待的样子，也不必因为别人的选择就否定自己。真正成熟的关系，不是互相控制，而是彼此有选择，也彼此承担选择的后果。\n\n所以敲不开的门，不要一直敲。伸手讨来的糖，和别人真心想给你的糖，本来就不是同一回事。收回热情、及时止损、体面退场，不代表你没有感情，而是你开始尊重自己的时间、尊严和能量。\n\n有心者有所累，无心者无所谓。既然情出自愿，就不要事后把所有付出变成债。能同行时珍惜，不能同行时放下。真正的自由，不是从此不需要任何人，而是不再靠抓住谁来证明自己的价值。",
      en: "Every relationship eventually becomes a meeting that happened. Some people stay for years, some walk only one part of the road. Some give you safety; others teach you where your boundaries are. Coming together and moving apart are not automatically right or wrong. They are simply different forms a relationship can take over time.\n\nI increasingly believe in allowing myself to be myself and allowing other people to be themselves. You do not need to turn everyone into the person you hoped they would be, and another person's choice does not have to become a verdict on your worth. A mature relationship is not mutual control. It is two people with choices, each carrying the consequences of those choices.\n\nIf a door will not open, do not spend forever knocking. Something you have to beg for is not the same as something freely given. Pulling back, stopping a loss or leaving with dignity does not mean you lack feeling. It means you have started to respect your own time, dignity and energy.\n\nIf you gave willingly, do not later turn every act of care into a debt. Value the time you can walk together. Let go when you cannot. Freedom is not needing nobody; it is no longer needing to hold on to someone in order to prove your own value.",
    },
  },
  {
    id: "emotion-and-judgement",
    publishedAt: "2026-08-30",
    title: {
      "zh-Hant": "心中有事，仍把力氣留給解決問題",
      "zh-Hans": "心中有事，仍把力气留给解决问题",
      en: "Keep Your Energy for Solving the Problem",
    },
    summary: {
      "zh-Hant": "情緒可以被看見，但不必成為方向盤。真正的穩定，是事情再大，也先保住判斷力。",
      "zh-Hans": "情绪可以被看见，但不必成为方向盘。真正的稳定，是事情再大，也先保住判断力。",
      en: "Emotion can be acknowledged without becoming the steering wheel. Stability means protecting your judgement even when the situation is serious.",
    },
    body: {
      "zh-Hant": "我不認為情緒本身是錯的。生氣、委屈、恐懼、焦慮，都有它們出現的原因。但如果每一次情緒升起，都立刻變成決策，那一個人其實很容易把主動權交出去。\n\n真正重要的是：心裡有事，還能不能保住判斷。事情來了，先分清楚什麼是事實、什麼是自己的猜測；什麼現在能處理、什麼只能等待；什麼值得正面解決、什麼根本不值得再投入。這種分辨，比單純壓住情緒更重要。\n\n我欣賞的是那種心如止水的能力。不是沒有感受，而是天大的事來了，也知道先處理下一步。解決不了，就換方法；方法不對，就重新拆問題。只要還能思考，就還沒有真正失去主導權。\n\n情緒需要被理解，但人生不能交給情緒管理。把力氣留給真正能推動事情的部分，慢慢會發現：很多原本像天塌下來的事，其實只是需要時間、方法和一點距離。",
      "zh-Hans": "我不认为情绪本身是错的。生气、委屈、恐惧、焦虑，都有它们出现的原因。但如果每一次情绪升起，都立刻变成决策，那一个人其实很容易把主动权交出去。\n\n真正重要的是：心里有事，还能不能保住判断。事情来了，先分清楚什么是事实、什么是自己的猜测；什么现在能处理、什么只能等待；什么值得正面解决、什么根本不值得再投入。这种分辨，比单纯压住情绪更重要。\n\n我欣赏的是那种心如止水的能力。不是没有感受，而是天大的事来了，也知道先处理下一步。解决不了，就换方法；方法不对，就重新拆问题。只要还能思考，就还没有真正失去主导权。\n\n情绪需要被理解，但人生不能交给情绪管理。把力气留给真正能推动事情的部分，慢慢会发现：很多原本像天塌下来的事，其实只是需要时间、方法和一点距离。",
      en: "I do not think emotions are wrong. Anger, hurt, fear and anxiety usually arise for a reason. But if every emotion immediately becomes a decision, it becomes very easy to hand away control of your own life.\n\nWhat matters is whether you can keep your judgement while something is happening. Separate fact from assumption. Separate what can be handled now from what needs time. Decide what deserves a direct response and what no longer deserves further investment. That kind of discrimination matters more than simply suppressing emotion.\n\nThe quality I value is a steady mind. Not a person with no feelings, but someone who can face a serious event and still identify the next move. If one solution fails, try another. If the framing is wrong, break the problem down again. As long as you can still think, you have not completely lost the initiative.\n\nEmotion deserves understanding, but it should not run the whole life. Keep your energy for the part that can actually move the situation. With enough distance, many things that once felt catastrophic turn out to need time, method and proportion rather than panic.",
    },
  },
  {
    id: "long-term-practice",
    publishedAt: "2026-08-30",
    title: {
      "zh-Hant": "流水不爭先，爭的是滔滔不絕",
      "zh-Hans": "流水不争先，争的是滔滔不绝",
      en: "Do Not Race the River. Keep It Flowing",
    },
    summary: {
      "zh-Hant": "真正拉開差距的，往往不是一時爆發，而是長時間把一件事做深、做熟、做成自己的能力。",
      "zh-Hans": "真正拉开差距的，往往不是一时爆发，而是长时间把一件事做深、做熟、做成自己的能力。",
      en: "What creates real distance is rarely one burst of effort. It is years of making one thing deeper, sharper and genuinely your own.",
    },
    body: {
      "zh-Hant": "很多事情，三年只是入門，五年才開始懂行，十年才真正形成自己的判斷。這不是要迷信年數，而是提醒自己：真正有價值的能力，大多需要時間反覆打磨。\n\n我不太相信橫空出世。看起來突然出現的結果，背後往往有很長一段沒人看見的累積。別人覺得難、覺得麻煩、覺得不值得花時間的地方，如果你願意研究得更深，時間久了，就會變成你的壁壘。\n\n人生真正的幾個驅動力，我會放在認知、野心、勇氣和執行力上。認知決定你看不看得到，野心決定你想不想去，勇氣決定你敢不敢，執行力決定你最後能不能把它做出來。四者缺一，事情都容易停在想法裡。\n\n所以不要太急著證明自己。找到值得做的事，然後持續把它做深。慢不是問題，停才是。當時間開始站在你這邊，很多以前需要向外證明的東西，最後都會變成你自己身上的能力。",
      "zh-Hans": "很多事情，三年只是入门，五年才开始懂行，十年才真正形成自己的判断。这不是要迷信年数，而是提醒自己：真正有价值的能力，大多需要时间反复打磨。\n\n我不太相信横空出世。看起来突然出现的结果，背后往往有很长一段没人看见的累积。别人觉得难、觉得麻烦、觉得不值得花时间的地方，如果你愿意研究得更深，时间久了，就会变成你的壁垒。\n\n人生真正的几个驱动力，我会放在认知、野心、勇气和执行力上。认知决定你看不看得到，野心决定你想不想去，勇气决定你敢不敢，执行力决定你最后能不能把它做出来。四者缺一，事情都容易停在想法里。\n\n所以不要太急着证明自己。找到值得做的事，然后持续把它做深。慢不是问题，停才是。当时间开始站在你这边，很多以前需要向外证明的东西，最后都会变成你自己身上的能力。",
      en: "In many fields, three years is only an introduction, five years begins to build real understanding, and a decade is where independent judgement starts to become reliable. The numbers are not sacred. The point is that valuable ability usually requires repeated work over time.\n\nI do not put much faith in the idea of appearing from nowhere. Results that look sudden often sit on top of years nobody saw. When other people find something too difficult, too tedious or not worth the time, going deeper can eventually become your advantage.\n\nThe four forces I return to are understanding, ambition, courage and execution. Understanding affects what you can see. Ambition affects whether you want to go there. Courage affects whether you dare to move. Execution determines whether the idea becomes real. Remove one, and a great deal stays theoretical.\n\nThere is no need to prove yourself too early. Find something worth doing and keep deepening it. Slow is not the problem; stopping is. Once time starts working with you, many things you once had to prove outwardly become abilities you simply carry.",
    },
  },
];
