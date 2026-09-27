import type { Locale } from "@/lib/i18n";
import type { LifeViewArticle } from "@/lib/life-view";

type IllustratedLifeViewArticle = LifeViewArticle & {
  illustrations: Array<{
    src: string;
    afterParagraph: number;
    alt: Record<Locale, string>;
    display?: "wide" | "portrait";
  }>;
};

export const TIME_IS_IT_FASTER_LONG_FORM: IllustratedLifeViewArticle = {
  id: "time-is-it-really-faster",
  publishedAt: "2026-09-27",
  title: {
    "zh-Hant": "時間真的變快了嗎？從物理時間、主觀時間到「一天只剩 16 小時」",
    "zh-Hans": "时间真的变快了吗？从物理时间、主观时间到「一天只剩 16 小时」",
    en: "Is Time Really Speeding Up? From Physical Time to the Feeling of a 16-Hour Day",
  },
  summary: {
    "zh-Hant": "目前沒有可靠證據顯示物理時間整體加速；但注意力、記憶、資訊密度與可用時間的壓縮，足以讓一天真實地「感覺只剩 16 小時」。",
    "zh-Hans": "目前没有可靠证据显示物理时间整体加速；但注意力、记忆、信息密度与可用时间的压缩，足以让一天真实地「感觉只剩 16 小时」。",
    en: "There is no reliable evidence that physical time itself is speeding up, but attention, memory, information density and shrinking usable time can make a 24-hour day genuinely feel much shorter.",
  },
  body: {
    "zh-Hant": `很多人近年都有一種很強烈的感覺：時間似乎正在加速。不是單純「年紀大了，覺得一年一下就過去」，而是以前兩小時能完成的工作，如今做事方式、努力程度與習慣看起來差不多，卻常常只能完成三分之二。鐘面仍是 24 小時，生活卻像只剩 16 小時。

要理性回答這件事，第一步不是先否定這種感受，也不是直接宣布宇宙時間正在加速，而是先分清楚三件事：物理時間、可用時間，以及主觀時間。

一｜物理學首先會問：時間相對於什麼變快？我們測量時間，本身就要依靠物理過程，例如原子振盪、石英晶體、天體運動、電子訊號與其他週期性變化。如果所有物理過程、所有鐘與觀察者都同比例加速，宇宙內部沒有另一把「宇宙外的鐘」可供比較。從可操作的物理意義看，「整個時間本身一起加速」很難成為可檢驗命題。

真正能測的是「過程／標準時間」的比例：兩小時完成多少工作、固定流程要幾分鐘、獨立時鐘與天文週期是否彼此偏離。若以前兩小時完成 10 件事，現在只完成 6～7 件，這確實證明單位時間產出變了；但單憑這一點，還沒有證明時間本身變了。

二｜「一天像只剩 16 小時」可能是真的，但真的部分更可能是可用時間被壓縮。睡眠、通勤、通知、工作切換、決策疲勞、家務、等待與恢復時間，都會從名義上的 24 小時中拿走一部分。

很多損耗不是整塊消失，而是每個環節多 10 秒、30 秒、1 分鐘。因為它們分散在一天裡，人往往仍覺得自己的習慣與效率沒有明顯改變；但全部累積後，差異可以大到足以讓一天像少了好幾個小時。

因此，「做事方式沒有變，卻做不完以前同樣的量」是一個值得測量的現象。它首先指向的是單位時間內的產出、干擾與認知成本，而不是直接指向宇宙時間加速。

三｜主觀時間不是原子鐘。大腦不會以完全均勻的方式感受每一分鐘；注意力、記憶、事件密度、情緒與身體狀態都會改變時間感。同樣的 60 分鐘，可以在等待時像 90 分鐘，在高度投入時卻像 20 分鐘。

當人進入沉浸或 flow，注意力轉向任務本身，對時間的監控下降，所以常出現「怎麼一下三小時過去了」。相反，在事故、緊張或高度警覺的幾秒內，大腦處理大量細節，短時間又可能被主觀拉長。

四｜所謂「高能量、高資訊密度的人」，時間感也不會只有一個方向。短時高警覺可能讓時間變慢；長時高投入則往往讓時間變快。也因此，一個人可以同時覺得某幾秒非常漫長，卻又覺得整個下午瞬間消失。

五｜記憶會再改寫一次時間。第一次旅行到陌生城市的一天，當下可能忙到覺得飛快，幾個月後回想卻顯得很長，因為留下了大量可區分的記憶節點。相反，高度重複的半年，在當下不一定每一天都很快，但回顧時可能像被整段壓縮。

六｜時間本身真的「流」嗎？我們直接觀測到的是鐘的變化、原子振盪、物體運動、老化、因果先後與熵的方向，而不是一種可以單獨抓住的「時間流」。現代物理至少允許一個值得認真對待的可能：變化、順序與因果是真的，而「流逝感」未必是一個獨立的基本實體。

這並不等於時間不存在，也不等於人生早已寫死。相對論告訴我們，不存在所有觀察者共同共享的絕對「現在」；量子理論與量子重力裡，時間的角色也仍有深層問題。這些問題很重要，但都不足以證明「未來已經拍完，所以選擇沒有意義」。

七｜最公平的驗證方式其實很簡單：找一件流程固定、熟練度高、外部變數少的任務，開始時按一次計時，過程中不要看鐘，完成後才記錄「完成量｜客觀分鐘｜中斷次數｜主觀估計」。連續做 10～20 次。

如果客觀耗時沒有明顯改變，但你持續低估經過時間，較像時間知覺被壓縮；如果客觀耗時真的穩定增加，就應該找效率、流程、疲勞或干擾的變化；只有當多套彼此獨立的物理時鐘與物理過程都出現一致、可重複的比例異常，才有資格開始討論未知的物理時間尺度變化。

所以，「時間真的變快了嗎？」目前最理性的答案是：沒有可靠證據顯示物理時間本身正在整體加速；但人的可用時間與主觀時間完全可能被壓縮到像一天只剩 16 小時。這種感受不必被嘲笑成錯覺，但也不能直接升格成宇宙物理結論。

真正值得追問的是：我們所謂的時間，有多少屬於宇宙本身，又有多少屬於意識理解宇宙的方式？也許最終存在的是事件、變化、關係與因果；而「流逝」，是意識站在其中，回望記憶、面向未知時產生的一種極其真實的經驗。`,
    "zh-Hans": `很多人近年都有一种很强烈的感觉：时间似乎正在加速。不是单纯「年纪大了，觉得一年一下就过去」，而是以前两小时能完成的工作，如今做事方式、努力程度与习惯看起来差不多，却常常只能完成三分之二。钟面仍是 24 小时，生活却像只剩 16 小时。

要理性回答这件事，第一步不是先否定这种感受，也不是直接宣布宇宙时间正在加速，而是先分清楚三件事：物理时间、可用时间，以及主观时间。

一｜物理学首先会问：时间相对于什么变快？我们测量时间，本身就要依靠物理过程，例如原子振荡、石英晶体、天体运动、电子信号与其他周期性变化。如果所有物理过程、所有钟与观察者都同比例加速，宇宙内部没有另一把「宇宙外的钟」可供比较。从可操作的物理意义看，「整个时间本身一起加速」很难成为可检验命题。

真正能测的是「过程／标准时间」的比例：两小时完成多少工作、固定流程要几分钟、独立时钟与天文周期是否彼此偏离。若以前两小时完成 10 件事，现在只完成 6～7 件，这确实证明单位时间产出变了；但单凭这一点，还没有证明时间本身变了。

二｜「一天像只剩 16 小时」可能是真的，但真的部分更可能是可用时间被压缩。睡眠、通勤、通知、工作切换、决策疲劳、家务、等待与恢复时间，都会从名义上的 24 小时中拿走一部分。

很多损耗不是整块消失，而是每个环节多 10 秒、30 秒、1 分钟。因为它们分散在一天里，人往往仍觉得自己的习惯与效率没有明显改变；但全部累积后，差异可以大到足以让一天像少了好几个小时。

因此，「做事方式没有变，却做不完以前同样的量」是一个值得测量的现象。它首先指向的是单位时间内的产出、干扰与认知成本，而不是直接指向宇宙时间加速。

三｜主观时间不是原子钟。大脑不会以完全均匀的方式感受每一分钟；注意力、记忆、事件密度、情绪与身体状态都会改变时间感。同样的 60 分钟，可以在等待时像 90 分钟，在高度投入时却像 20 分钟。

当人进入沉浸或 flow，注意力转向任务本身，对时间的监控下降，所以常出现「怎么一下三小时过去了」。相反，在事故、紧张或高度警觉的几秒内，大脑处理大量细节，短时间又可能被主观拉长。

四｜所谓「高能量、高信息密度的人」，时间感也不会只有一个方向。短时高警觉可能让时间变慢；长时高投入则往往让时间变快。也因此，一个人可以同时觉得某几秒非常漫长，却又觉得整个下午瞬间消失。

五｜记忆会再改写一次时间。第一次旅行到陌生城市的一天，当下可能忙到觉得飞快，几个月后回想却显得很长，因为留下了大量可区分的记忆节点。相反，高度重复的半年，在当下不一定每一天都很快，但回顾时可能像被整段压缩。

六｜时间本身真的「流」吗？我们直接观察到的是钟的变化、原子振荡、物体运动、老化、因果先后与熵的方向，而不是一种可以单独抓住的「时间流」。现代物理至少允许一个值得认真对待的可能：变化、顺序与因果是真的，而「流逝感」未必是一个独立的基本实体。

这并不等于时间不存在，也不等于人生早已写死。相对论告诉我们，不存在所有观察者共同共享的绝对「现在」；量子理论与量子引力里，时间的角色也仍有深层问题。这些问题很重要，但都不足以证明「未来已经拍完，所以选择没有意义」。

七｜最公平的验证方式其实很简单：找一件流程固定、熟练度高、外部变量少的任务，开始时按一次计时，过程中不要看钟，完成后才记录「完成量｜客观分钟｜中断次数｜主观估计」。连续做 10～20 次。

如果客观耗时没有明显改变，但你持续低估经过时间，较像时间知觉被压缩；如果客观耗时真的稳定增加，就应该找效率、流程、疲劳或干扰的变化；只有当多套彼此独立的物理时钟与物理过程都出现一致、可重复的比例异常，才有资格开始讨论未知的物理时间尺度变化。

所以，「时间真的变快了吗？」目前最理性的答案是：没有可靠证据显示物理时间本身正在整体加速；但人的可用时间与主观时间完全可能被压缩到像一天只剩 16 小时。这种感受不必被嘲笑成错觉，但也不能直接升格成宇宙物理结论。

真正值得追问的是：我们所谓的时间，有多少属于宇宙本身，又有多少属于意识理解宇宙的方式？也许最终存在的是事件、变化、关系与因果；而「流逝」，是意识站在其中，回望记忆、面向未知时产生的一种极其真实的经验。`,
    en: `A growing number of people describe a specific feeling: time seems to be accelerating. This is not merely “years pass faster as I get older.” The claim is more concrete: a task that once fit comfortably into two hours now seems to fill the same two hours while producing less, even though habits and effort feel unchanged. The clock still says 24 hours, but the day can feel closer to 16.

A rational analysis should neither dismiss that experience nor jump straight to the claim that cosmic time itself is accelerating. Three different things need to be separated: physical time, usable time and subjective time.

1 | Physics first asks: faster relative to what? Every clock is itself a physical process—atomic transitions, crystal oscillations, astronomical cycles, electronic signals or other repeatable changes. If every physical process, every clock and every observer accelerated by exactly the same factor, there would be no second “outside-the-universe clock” with which to compare them. In operational physics, a universal acceleration of time is therefore very difficult to define as a testable claim.

What we can measure is the ratio between a process and a standard clock: how much work is completed in two hours, how long a fixed routine takes, and whether independent clocks or astronomical cycles drift relative to one another. If ten tasks once fit into two hours and only six or seven fit now, that is a real change in output per unit time. By itself, however, it does not show that time itself changed.

2 | “A day feels like only 16 hours” can be real in another sense: usable time can be compressed. Sleep, commuting, notifications, task switching, decision fatigue, household work, waiting and recovery all subtract from the nominal 24-hour day.

Much of that loss does not vanish in one obvious block. It appears as ten seconds here, thirty seconds there, a minute of switching, a small pause, another decision. Because the losses are distributed, a person may sincerely feel that their habits and efficiency have not changed. Added together, however, the difference can become large enough to feel like several hours disappeared.

That makes “I work the same way but no longer finish the same amount” a phenomenon worth measuring. Its first targets are output, interruption and cognitive cost—not an immediate conclusion that cosmic time accelerated.

3 | Subjective time is not an atomic clock. The brain does not experience every minute with equal density. Attention, memory, event density, emotion and bodily state all change duration estimates. The same 60 minutes can feel like 90 while waiting and like 20 during deep engagement.

During flow, attention moves away from monitoring time and toward the task itself, producing the familiar “how did three hours pass?” effect. During a crash, threat or intense alertness, the opposite can happen over a few seconds: more detail is processed and a short interval may feel stretched.

4 | A highly active or information-dense mind therefore does not experience time in only one direction. Short periods of high alertness can feel slower; long periods of deep engagement often feel faster. The same person can experience a few seconds as unusually long and an entire afternoon as if it vanished.

5 | Memory rewrites time again. A first day in an unfamiliar city may pass quickly while it is happening but feel long months later because it contains many distinct memory markers. A repetitive half-year may not feel especially fast on each individual day, yet appear dramatically compressed in retrospect.

6 | Does time itself actually “flow”? What we directly observe are changing clocks, atomic transitions, moving objects, ageing, causal order and the thermodynamic arrow—not a separate substance called “the flow of time.” Modern physics at least leaves open a serious possibility: change, order and causality are real, while the felt flow of time may not be an independent fundamental object.

That does not mean time is unreal, nor that every life event is already scripted. Relativity removes a universal absolute “now,” and quantum theory and quantum gravity still contain deep questions about the role of time. Those questions matter, but none of them proves that the future is a finished film or that human decisions are meaningless.

7 | A fair test is simple. Choose a routine that is highly familiar, stable and minimally affected by outside variables. Start a timer once, do not look at it during the task, then record: output | objective minutes | interruptions | subjective estimate. Repeat this 10–20 times.

If objective duration stays stable while you consistently underestimate elapsed time, time perception is likely being compressed. If objective duration steadily increases, investigate changes in workflow, fatigue, interruption or cognitive load. Only if multiple independent physical clocks and processes show the same repeatable proportional anomaly would it make sense to begin discussing an unknown change in the physical time scale.

So, is time really speeding up? The most rational answer today is: there is no reliable evidence that physical time itself is globally accelerating. But usable time and subjective time can absolutely become compressed enough for a 24-hour day to feel like 16. The experience does not need to be mocked as “just an illusion,” but it also should not be promoted directly into a claim about the physics of the universe.

The deeper question is how much of what we call time belongs to the universe itself and how much belongs to the way consciousness represents the universe. Perhaps the most basic reality is events, change, relations and causality—and “passing” is the remarkably real experience produced by a mind standing among those events, remembering one direction and facing the unknown in the other.`,
  },
  illustrations: [
    {
      src: "/articles/time-faster-hero.webp",
      afterParagraph: 2,
      display: "wide",
      alt: {
        "zh-Hant": "時間真的變快了嗎：物理時間、主觀時間與一天只剩 16 小時的視覺摘要",
        "zh-Hans": "时间真的变快了吗：物理时间、主观时间与一天只剩 16 小时的视觉摘要",
        en: "Visual summary comparing physical time, subjective time and the feeling of a 16-hour day",
      },
    },
    {
      src: "/articles/time-objective-subjective.webp",
      afterParagraph: 4,
      display: "wide",
      alt: {
        "zh-Hant": "客觀物理時間與主觀時間感受的對照",
        "zh-Hans": "客观物理时间与主观时间感受的对照",
        en: "Objective physical time contrasted with subjective time perception",
      },
    },
    {
      src: "/articles/time-16-hours.webp",
      afterParagraph: 7,
      display: "wide",
      alt: {
        "zh-Hant": "24 小時如何被睡眠、切換、干擾與疲勞壓縮成較少的可用時間",
        "zh-Hans": "24 小时如何被睡眠、切换、干扰与疲劳压缩成较少的可用时间",
        en: "How sleep, switching, interruptions and fatigue can compress a 24-hour day into fewer usable hours",
      },
    },
    {
      src: "/articles/time-high-energy.webp",
      afterParagraph: 10,
      display: "wide",
      alt: {
        "zh-Hant": "高警覺與高投入狀態如何以不同方向改變時間知覺",
        "zh-Hans": "高警觉与高投入状态如何以不同方向改变时间知觉",
        en: "How high alertness and deep engagement can alter time perception in opposite directions",
      },
    },
  ],
};
