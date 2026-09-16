import type { Locale } from "@/lib/i18n";
import type { LifeViewArticle } from "@/lib/life-view";

type IllustratedLifeViewArticle = LifeViewArticle & {
  illustrations?: Array<{
    src: string;
    afterParagraph: number;
    alt: Record<Locale, string>;
  }>;
};

export const SHUSHU_ENDS_IN_CHOICE_ARTICLE: IllustratedLifeViewArticle = {
  id: "shushu-ends-in-choice",
  publishedAt: "2026-09-15",
  title: {
    "zh-Hant": "術數的最後，不是問天，而是決於人",
    "zh-Hans": "术数的最后，不是问天，而是决于人",
    en: "The Final Step of Divination Is Not Asking Heaven, but Choosing for Yourself",
  },
  summary: {
    "zh-Hant": "「問心、歸真、自省、守靜、無悔、誠正」可以作為一組現代哲理整理，但不能冒充各門術數古籍裡固定的「最後一課」。真正值得保留的是：術數可以看勢，卻不能替人作決定。",
    "zh-Hans": "“问心、归真、自省、守静、无悔、诚正”可以作为一组现代哲理整理，但不能冒充各门术数古籍里固定的“最后一课”。真正值得保留的是：术数可以看势，却不能替人作决定。",
    en: "“Question the Heart, Return to Truth, Self-Reflection, Keeping Still, No Regret, Upright Sincerity” can work as a modern philosophical framework, but not as a verified set of traditional final lessons. Divination can help read conditions; it cannot make the choice for you.",
  },
  body: {
    "zh-Hant": `網路上常見一組很漂亮的說法：奇門遁甲的最後一局叫「問心」，大六壬最後一課叫「歸真」，六爻最後一爻叫「自省」，梅花易數最後一項叫「守靜」，太乙神數最後一盤叫「無悔」，而《易經》最後一卦叫「誠正」。把六個詞排在一起，確實很像一套完整的「術數歸心」。但如果把它當成古籍知識，就必須把哲理與史實分開。

至少有兩點可以直接核對：《周易》第六十四卦是「未濟」，不是「誠正」；《周易》六十四卦也不存在一個正式名為「自省」的「最後一爻」，若依卦序而言，最後一爻是未濟卦上九。至於「問心」「歸真」「守靜」「無悔」被說成奇門、六壬、梅花、太乙固定的最後一局、最後一課、最後一項或最後一盤，目前並沒有足夠可靠的典籍依據可以把它們當成正式制度。這組文字更適合被理解為後人整理出的哲理文案，而不是傳統術數的共同終章。

但這不代表它完全沒有價值。相反，它碰到了一個術數真正重要的問題：當你已經看見了時勢、吉凶、風險與可能，接下來究竟由誰決定？

答案仍然是人。

奇門可以幫你辨時與勢，六壬可以提供事件結構的另一種觀察，六爻可以看變化，梅花重取象，太乙有其推演大勢的傳統，《周易》更以變易為核心。這些方法的共同價值，不是替你交出一張不可違抗的判決書，而是增加你對局勢的理解。

《周易》最後以「未濟」作結，本身就很值得玩味。它沒有把六十四卦收在一個「一切完成」的終點，而停在事情尚未完成、仍有後續變化的位置。這裡是一種現代哲學上的閱讀：世界沒有真正靜止的終局，人的處境也不會因為一次占問就永久定型。這是詮釋，不是把新的詞句冒充成《周易》原文。

所以，術數最好被當成鏡，而不是命令。鏡子可以讓你看見自己現在站在哪裡、前面有什麼、哪一條路風險較高；但鏡子不能替你走路。看見凶象，不等於只能恐懼；看見吉象，也不等於可以停止判斷。真正成熟的用法，是知道條件之後仍然保留選擇權。

所謂「問心」，若把它當成現代轉譯，可以是：先辨自己真正的動機。所謂「歸真」，可以是：推演再多，最後仍回到已知事實。所謂「自省」，可以是：在怪罪環境以前先檢查自己的決策。所謂「守靜」，可以是：資訊再多也不讓心跟著每一個象起伏。所謂「無悔」，不是保證每次都選對，而是盤盡之後願意承擔自己的選擇。所謂「誠正」，則可以理解成不欺騙自己，也不拿術數替慾望背書。

這樣看，「問心、歸真、自省、守靜、無悔、誠正」仍然可以留下，只是要誠實標明：這是一套現代的哲學整理，不是古籍原有的六門術數終章。

術數的終點，不是得到一個可以停止思考的答案，而是看清之後仍能自己裁決。外在之象可以參考，最終之決仍在人。

用昭梧今天的話說：「術至於境，境止於人。」這不是古訓，而是現代整理：知命而不認命，知勢而仍自決。`,
    "zh-Hans": `网络上常见一组很漂亮的说法：奇门遁甲的最后一局叫“问心”，大六壬最后一课叫“归真”，六爻最后一爻叫“自省”，梅花易数最后一项叫“守静”，太乙神数最后一盘叫“无悔”，而《易经》最后一卦叫“诚正”。把六个词排在一起，确实很像一套完整的“术数归心”。但如果把它当成古籍知识，就必须把哲理与史实分开。

至少有两点可以直接核对：《周易》第六十四卦是“未济”，不是“诚正”；《周易》六十四卦也不存在一个正式名为“自省”的“最后一爻”，若依卦序而言，最后一爻是未济卦上九。至于“问心”“归真”“守静”“无悔”被说成奇门、六壬、梅花、太乙固定的最后一局、最后一课、最后一项或最后一盘，目前并没有足够可靠的典籍依据可以把它们当成正式制度。这组文字更适合被理解为后人整理出的哲理文案，而不是传统术数的共同终章。

但这不代表它完全没有价值。相反，它碰到了一个术数真正重要的问题：当你已经看见了时势、吉凶、风险与可能，接下来究竟由谁决定？

答案仍然是人。

奇门可以帮你辨时与势，六壬可以提供事件结构的另一种观察，六爻可以看变化，梅花重取象，太乙有其推演大势的传统，《周易》更以变易为核心。这些方法的共同价值，不是替你交出一张不可违抗的判决书，而是增加你对局势的理解。

《周易》最后以“未济”作结，本身就很值得玩味。它没有把六十四卦收在一个“一切完成”的终点，而停在事情尚未完成、仍有后续变化的位置。这里是一种现代哲学上的阅读：世界没有真正静止的终局，人的处境也不会因为一次占问就永久定型。这是诠释，不是把新的词句冒充成《周易》原文。

所以，术数最好被当成镜，而不是命令。镜子可以让你看见自己现在站在哪里、前面有什么、哪一条路风险较高；但镜子不能替你走路。看见凶象，不等于只能恐惧；看见吉象，也不等于可以停止判断。真正成熟的用法，是知道条件之后仍然保留选择权。

所谓“问心”，若把它当成现代转译，可以是：先辨自己真正的动机。所谓“归真”，可以是：推演再多，最后仍回到已知事实。所谓“自省”，可以是：在怪罪环境以前先检查自己的决策。所谓“守静”，可以是：信息再多也不让心跟着每一个象起伏。所谓“无悔”，不是保证每次都选对，而是盘尽之后愿意承担自己的选择。所谓“诚正”，则可以理解成不欺骗自己，也不拿术数替欲望背书。

这样看，“问心、归真、自省、守静、无悔、诚正”仍然可以留下，只是要诚实标明：这是一套现代的哲学整理，不是古籍原有的六门术数终章。

术数的终点，不是得到一个可以停止思考的答案，而是看清之后仍能自己裁决。外在之象可以参考，最终之决仍在人。

用昭梧今天的话说：“术至于境，境止于人。”这不是古训，而是现代整理：知命而不认命，知势而仍自决。`,
    en: `A polished claim often circulates online: that Qimen Dunjia ends with a final configuration called “Question the Heart,” Da Liu Ren with a final lesson called “Return to Truth,” Liuyao (Six-Line divination) with a final line called “Self-Reflection,” Meihua Yishu (Plum Blossom Numerology) with “Keeping Still,” Taiyi Shenshu with “No Regret,” and the Book of Changes with a final hexagram called “Upright Sincerity.” As a piece of philosophy, the sequence is elegant. As historical or technical knowledge, however, it needs to be separated from what the classical systems actually say.

Two points are directly verifiable. The sixty-fourth and final hexagram of the Zhouyi is Wei Ji (未濟), “Before Completion,” not “Upright Sincerity.” Nor is there a formally named final yao called “Self-Reflection”; by the received hexagram sequence, the final yao is the top line of Wei Ji. For the other expressions, there is not sufficient reliable classical evidence to treat “Question the Heart,” “Return to Truth,” “Keeping Still,” or “No Regret” as fixed final technical terms of Qimen, Liu Ren, Meihua, or Taiyi. The six-part sequence is better understood as a modern philosophical arrangement than as a shared traditional ending.

That does not make the idea worthless. It points toward a more important question: once a method has shown you timing, risk, opportunity and possible outcomes, who makes the decision?

The person still does.

Traditional divination methods can offer structured ways of reading change. Their useful role is to increase understanding, not to hand down an unquestionable sentence. Qimen can help frame timing and strategic conditions; Liu Ren offers another way to examine event structure; Liuyao reads change; Meihua emphasizes image and correspondence; Taiyi has its own tradition of modelling larger trends; and the Zhouyi is built around change itself.

The Zhouyi ends with Wei Ji — not with complete closure, but with a situation still unfinished and capable of further change. The reading offered here is a modern philosophical one: circumstances remain dynamic, and one consultation does not permanently fix a person's life. That is interpretation, not a new quotation being presented as classical text.

Divination is therefore better used as a mirror than as a command. A mirror can show where you stand, what lies ahead and which path carries more risk, but it cannot walk for you. An unfavourable sign does not remove agency; a favourable sign does not remove the need for judgement.

If we keep the six modern phrases, they work best as reflective translations rather than claims about ancient terminology. “Question the Heart” can mean checking your real motive. “Return to Truth” can mean returning from speculation to verified facts. “Self-Reflection” can mean reviewing your own decisions before blaming circumstances. “Keeping Still” can mean not allowing every sign to move the mind. “No Regret” can mean accepting responsibility after making the best decision available. “Upright Sincerity” can mean refusing to deceive yourself or use divination to justify what you already want.

The point is not to obtain an answer that lets thinking stop. It is to see more clearly and then still decide for yourself.

In Zhaowu's modern phrasing: “Methods reach only as far as circumstances; circumstances end where human choice begins.” This is not a classical maxim. It is a contemporary formulation of the same position: know the pattern without surrendering to it; read the timing while keeping the right to choose.`,
  },
  illustrations: [
    {
      src: "/article-shushu-choice.svg",
      afterParagraph: 6,
      alt: {
        "zh-Hant": "昭梧觀世錄：術數照見局勢，最後仍由人作選擇",
        "zh-Hans": "昭梧观世录：术数照见局势，最后仍由人作选择",
        en: "Zhaowu illustration: divination may reveal conditions, while the final choice remains human",
      },
    },
  ],
};
