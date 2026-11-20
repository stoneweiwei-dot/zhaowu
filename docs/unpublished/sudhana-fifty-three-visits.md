# 暫緩發布的原創文章｜善財童子五十三參（2026-10-28）

- **狀態：BLOCKED，不是已發布文章。** 原畫 WebP 二進位分段 part0（315000 bytes）和 part1（314444 bytes）沒有進入 Git；圖片不能被驗證或組裝。此情況不應阻擋昭梧其他已完成的站點修正上線。
- **完整原文保留如下，原始檔來源：** `src/lib/life-view-long-form/sudhana-fifty-three-visits.ts`。沒有刪除文章內容；暫移出公開長文索引，等待原圖真正接入後恢復。
- **原始圖片：** 用戶生成的 `善財童子五十三參_求法之路.png`，941×1672，PNG SHA-256 `8cfda368d41ea235504e865a715cdc48b5b651017cbbc0269c83e40238cff278`。
- **原圖 WebP：** 941×1672，629444 bytes，SHA-256 `67b9dc2f5883dae28819151ab33de66d55f14dfdcb61bbec5b8f07894042490c`。
- **Git 仍保留組裝程式：** `scripts/assemble-sudhana-art.mjs`，恢復時須將精確校驗通過的原始二進位分段加入 `art-source/`，再把文章移回 `src/lib/life-view-long-form/`、重新加入 `src/lib/life-view-long-form.ts` 和影像 manifest，並恢復 prebuild 組裝。
- **原 manifest 紀錄（保留）：**

~~~~json
{
  "src": "/articles/sudhana-fifty-three-visits-stone-original.webp",
  "article": "sudhana-fifty-three-visits",
  "kind": "painting",
  "source": "stone-original",
  "status": "approved",
  "note": "2026-10-28 STONE 原創《善財童子五十三參》圖鑑，原始 PNG 941×1672；供站內閱讀的 WebP 維持 941×1672 全幅畫面。原始 PNG SHA-256 8cfda368d41ea235504e865a715cdc48b5b651017cbbc0269c83e40238cff278，WebP SHA-256 67b9dc2f5883dae28819151ab33de66d55f14dfdcb61bbec5b8f07894042490c。原圖來源為本對話生成的同一視覺畫面，未以幾何 SVG 代替。"
}
~~~~

## 完整原始文章（勿替換為假圖）

~~~~typescript
import type { LifeViewArticle } from "@/lib/life-view";

/** Cultural essay: the iconographic illustration is a modern original, not a historical manuscript or a verbatim sutra illustration. */
export const SUDHANA_FIFTY_THREE_VISITS_ARTICLE: LifeViewArticle = {
  id: "sudhana-fifty-three-visits-vasumitra-king",
  publishedAt: "2026-10-28",
  title: {
    "zh-Hant": "善財童子五十三參：在欲望與威怒之中求智慧",
    "zh-Hans": "善财童子五十三参：在欲望与威怒之中求智慧",
    en: "Sudhana’s Fifty-Three Visits: Learning Beyond Appearances",
  },
  summary: {
    "zh-Hant": "從《華嚴經》〈入法界品〉的善財求法、婆須蜜多女與甘露火王，理解善知識、離貪與方便示現。附 STONE 原創古典圖鑑及經文與詮釋的區別。",
    "zh-Hans": "从《华严经》〈入法界品〉的善财求法、婆须蜜多女与甘露火王，理解善知识、离贪与方便示现。附 STONE 原创古典图鉴，并区分经文与现代诠释。",
    en: "A cultural reading of Sudhana's pilgrimage in the Avatamsaka Sutra, with Vasumitra and King Anala, distinguishing scriptural narratives from modern interpretation and including original STONE art.",
  },
  body: {
    "zh-Hant": `《華嚴經》〈入法界品〉以善財童子求訪善知識的旅程，展開一幅眾生與修行交織的世界。傳統以「五十三參」稱這段歷程：善財在文殊師利菩薩的啟發下發菩提心，逐一請教不同身份與處境的善知識，最後見普賢菩薩，將求法之路導向廣大的菩薩行。

一、善知識，不只是一種外貌

善知識不必只有出家僧人，也可能是長者、居士、醫者、商人、國王或女性。重點在其所教能否令人增長智慧與慈悲，而不是單靠服飾、職業或社會地位下判斷。五十三參的「參」是參訪求教，並不表示每一次相遇都應在現實生活中模仿其行為。

二、婆須蜜多女：在欲中示現離貪

婆須蜜多女（亦有音譯差異）是這部經中極具辨識度的善知識之一。經典敘述她以姿容及與眾生的接觸，令相應眾生離開貪欲的束縛；其法門常譯作「離貪欲際解脫門」一類名稱。將她直接等同現代意義的「妓女」，或說她與男性發生性行為來讓對方在欲望頂點開悟，都是過度簡化，後者更不應當作逐字經文事實。

此故事的思想張力在於：菩薩的教化，不以世俗表面分類為唯一尺度；然而，這並不是把慾望行為本身宣告成解脫保證。

三、甘露火王：極端威怒與方便示現

另一位特殊善知識是甘露火王，也常以不同譯名稱呼。他在經典敘事中顯示嚴酷的刑罰場面，使善財一度生起疑惑；隨後故事揭示這是為攝受特定眾生而示現的不可思議方便。閱讀時要區分「經中的示現」與「現實中可被正當化的傷害」。菩薩方便之說不構成任何國王、老師或宗教人物可以施暴、虐待或侵犯他人的理由。

四、為何善財仍然恭敬求法？

善財面對外相不同的善知識，保持恭敬、求問與辨察，所學的並非「不分善惡」，而是不要只被第一眼的印象困住。佛教中的方便須以智慧、慈悲、不傷害等更廣的倫理脈絡理解；不能因一人自稱度化，就免除其行為的責任。

五、從經典到今日

我們可以從這則故事帶走三個問題：我是否只看身份而忽略真正能教我的人？我是否把欲望、憤怒或權威包裝為智慧？我是否能兼有開放學習的心，與拒絕傷害的清醒界線？

真正值得學的，不是照著極端場景去做，而是在複雜的人間保持辨別：敬重智慧，不神化外相；理解方便，不取消倫理。

典籍與圖像註記：主要故事出自《大方廣佛華嚴經》〈入法界品〉，不同漢譯本在名稱及敘事細節上可能不同。「五十三參」是傳統通稱。本文為文化闡釋而非逐字經文；旁附《善財童子五十三參・求法之路》是 STONE 原創 9:16 主題圖鑑，不是佛經古畫原件。圖中人物造型、場景及簡化法門文字屬藝術表達。

昭梧 ZHAOWU｜STONE 原創`,
    "zh-Hans": `《华严经》〈入法界品〉记述善财童子在文殊师利菩萨启发下发菩提心、遍访善知识的旅程，传统称为“五十三参”。最后见普贤菩萨，将求法与菩萨行相贯通。

一、善知识不只看身份

善知识可以是僧人、长者、商人、国王，也可以是女性。衡量的重点不是职业与装束，而是所教是否有助于智慧与慈悲。参访是求教，并不等于在现实中模仿经文中的一切场景。

二、婆须蜜多女：离贪的启示

婆须蜜多女是这段故事中特别醒目的善知识。经中以姿容及与众生的接触来表现使相应众生远离贪著的解脱法门，常见译名为“离贪欲际解脱门”。直接将她定义为现代职业意义的“妓女”，或者声称经文明确描绘以实际性行为在欲望极点使人开悟，均过于简化；后者不能当作经文逐字事实。故事强调的是解脱贪著，不是欲望本身必然带来开悟。

三、甘露火王：威怒与示现

甘露火王在经中展现严厉刑罚，使善财产生疑虑。叙事随后说明这些景象属于针对特定众生的方便示现。这是经典里的宗教叙事，不能成为现实中伤害、虐待、暴力或侵犯他人的借口。

四、恭敬并不等于放弃判断

善财愿意向外相特殊的老师求教，提醒读者不要只凭第一印象否定他人。但方便必须放在慈悲、智慧及伦理边界的脉络中理解，不能由自称“度化”者自行豁免伤害责任。

五、现代意义

不要只按身份判断谁值得学习；不要把欲望或威权浪漫化；保持开放求教，也保持识别危险与拒绝伤害的能力。这才是“五十三参”可供当代思考的价值。

典籍与图像说明：故事源于《大方广佛华严经》〈入法界品〉，各汉译本细节可能不同。“五十三参”为传统通称。本文是现代解读，并非逐字经文；所附图鉴为 STONE 原创 9:16 艺术作品，并非古代佛经插图。昭梧 ZHAOWU｜STONE 原创`,
    en: `The “fifty-three visits” is the traditional name for Sudhana’s journey through the Gandavyuha, the Entry into the Dharma Realm chapter of the Avatamsaka Sutra. Inspired by Manjusri, Sudhana seeks spiritual friends from diverse walks of life. His journey ultimately leads to Samantabhadra and the expansive practice of the bodhisattva.

1. Spiritual friends beyond status

A spiritual friend may be a monastic, merchant, elder, ruler, or woman. Their significance comes from the wisdom and compassion they can teach, not from occupational labels or appearances. Seeking guidance does not require imitating every circumstance in a sacred narrative.

2. Vasumitra and freedom from attachment

Vasumitra is one of the journey’s striking spiritual friends. The sutra describes her beauty and forms of contact as means by which receptive beings are freed from attachment. The teaching is often called liberation from the limits of desire. Labelling her simply a “prostitute” in a modern occupational sense is reductive; the claim that the scripture describes sexual intercourse producing enlightenment at the peak of arousal should not be passed off as a verbatim scriptural fact. The theme is release from grasping, not a claim that sexual desire automatically brings awakening.

3. King Anala and the spectacle of punishment

King Anala, whose Chinese translated name is commonly Ganluohuo Wang, appears amid startling scenes of punishment. Sudhana is troubled by what he sees, and the narrative subsequently frames the appearances as skilful manifestations suited to particular beings. This scriptural device must never be used to excuse real-world violence, abuse, or coercion.

4. Respect does not cancel discernment

Sudhana’s willingness to learn from unconventional teachers challenges prejudice. Yet skillful means is intelligible only alongside compassion, wisdom, and moral responsibility. Someone claiming to be a spiritual guide has no blanket exemption from accountability.

5. Reading it today

We can learn without judging everyone by status; resist romanticising desire or authoritarian force; and remain open to insight while maintaining clear boundaries against harm.

Source and artwork note: The narrative is based on the Entry into the Dharma Realm chapter of the Avatamsaka Sutra. Details and names differ among Chinese translations. “Fifty-three visits” is a traditional designation. This essay is a cultural interpretation rather than an exact quotation. The accompanying vertical visual atlas is contemporary STONE Original artwork, not a historical sutra illustration. ZHAOWU | STONE Original`,
  },
  illustrations: [{
    src: "/articles/sudhana-fifty-three-visits-stone-original.webp",
    afterParagraph: 1,
    alt: {
      "zh-Hant": "STONE 原創《善財童子五十三參》9:16 直幅圖鑑，婆須蜜多女、甘露火王與善財童子求法場景",
      "zh-Hans": "STONE 原创《善财童子五十三参》9:16 竖幅图鉴，婆须蜜多女、甘露火王与善财童子求法场景",
      en: "STONE Original vertical illustrated atlas showing Vasumitra, King Anala and Sudhana on his pilgrimage",
    },
    display: "portrait",
  }],
};

~~~~
