import type { LifeViewArticle } from "@/lib/life-view";
import hant01 from "../../../content/articles-zh-Hant/01-southern-hemisphere-bazi.md?raw";
import hant02 from "../../../content/articles-zh-Hant/02-shushu-ends-in-choice.md?raw";
import hant03 from "../../../content/articles-zh-Hant/03-seven-killings-tiger.md?raw";
import hant04 from "../../../content/articles-zh-Hant/04-strength-overdrive-five-elements.md?raw";
import hant05 from "../../../content/articles-zh-Hant/05-ten-gods-relationship-friction.md?raw";
import hant06 from "../../../content/articles-zh-Hant/06-money-needs-order-not-anxiety.md?raw";
import hant07 from "../../../content/articles-zh-Hant/07-annual-cycle-reading-with-care.md?raw";
import hant08 from "../../../content/articles-zh-Hant/08-inner-fengshui-mind-speech-action.md?raw";
import hant09 from "../../../content/articles-zh-Hant/09-emotional-intelligence-four-practices.md?raw";
import hant10 from "../../../content/articles-zh-Hant/10-love-reveals-the-unfinished-self.md?raw";
import hant11 from "../../../content/articles-zh-Hant/11-after-miracles-practice.md?raw";
import hans01 from "../../../content/articles-zh-Hans/01-southern-hemisphere-bazi.md?raw";
import hans02 from "../../../content/articles-zh-Hans/02-shushu-ends-in-choice.md?raw";
import hans03 from "../../../content/articles-zh-Hans/03-seven-killings-tiger.md?raw";
import hans04 from "../../../content/articles-zh-Hans/04-strength-overdrive-five-elements.md?raw";
import hans05 from "../../../content/articles-zh-Hans/05-ten-gods-relationship-friction.md?raw";
import hans06 from "../../../content/articles-zh-Hans/06-money-needs-order-not-anxiety.md?raw";
import hans07 from "../../../content/articles-zh-Hans/07-annual-cycle-reading-with-care.md?raw";
import hans08 from "../../../content/articles-zh-Hans/08-inner-fengshui-mind-speech-action.md?raw";
import hans09 from "../../../content/articles-zh-Hans/09-emotional-intelligence-four-practices.md?raw";
import hans10 from "../../../content/articles-zh-Hans/10-love-reveals-the-unfinished-self.md?raw";
import hans11 from "../../../content/articles-zh-Hans/11-after-miracles-practice.md?raw";
import en01 from "../../../content/articles-en/01-southern-hemisphere-bazi.md?raw";
import en02 from "../../../content/articles-en/02-shushu-ends-in-choice.md?raw";
import en03 from "../../../content/articles-en/03-seven-killings-tiger.md?raw";
import en04 from "../../../content/articles-en/04-strength-overdrive-five-elements.md?raw";
import en05 from "../../../content/articles-en/05-ten-gods-relationship-friction.md?raw";
import en06 from "../../../content/articles-en/06-money-needs-order-not-anxiety.md?raw";
import en07 from "../../../content/articles-en/07-annual-cycle-reading-with-care.md?raw";
import en08 from "../../../content/articles-en/08-inner-fengshui-mind-speech-action.md?raw";
import en09 from "../../../content/articles-en/09-emotional-intelligence-four-practices.md?raw";
import en10 from "../../../content/articles-en/10-love-reveals-the-unfinished-self.md?raw";
import en11 from "../../../content/articles-en/11-after-miracles-practice.md?raw";

const source = [
  ["southern-hemisphere-bazi-reading", "南半球排八字，節氣能不能直接反過來看？", "南半球排八字，节气能不能直接反过来看？", "Southern Hemisphere BaZi: Should the Solar Terms Be Reversed?", hant01, hans01, en01],
  ["shushu-ends-in-choice", "術數的最後，不是問天，而是決於人", "术数的最后，不是问天，而是决于人", "Divination Ultimately Returns to Human Choice", hant02, hans02, en02],
  ["seven-killings-tiger", "七殺不是凶星：壓力，怎麼變成可用的力量", "七杀不是凶星：压力，怎么变成可用的力量", "Seven Killings Is Not an Evil Star: Turning Pressure into Strength", hant03, hans03, en03],
  ["strength-overdrive-five-elements", "你不是缺什麼，是力量還沒用對地方", "你不是缺什么，是力量还没用对地方", "You May Not Lack Anything; Your Strength May Be Misapplied", hant04, hans04, en04],
  ["ten-gods-relationship-friction", "十神看關係：先看結構，再談合不合", "十神看关系：先看结构，再谈合不合", "Ten Gods and Relationships: Read the Structure First", hant05, hans05, en05],
  ["money-needs-order-not-anxiety", "求財先分三層：命局、環境、現金流", "求财先分三层：命局、环境、现金流", "Wealth Needs Three Layers: Chart, Environment and Cash Flow", hant06, hans06, en06],
  ["annual-cycle-reading-with-care", "流年怎麼讀：先分開規則和傳聞", "流年怎么读：先分开规则和传闻", "Reading Annual Cycles: Separate Rules from Rumours", hant07, hans07, en07],
  ["inner-fengshui-mind-speech-action", "真正的風水，先在自己身上", "真正的风水，先在自己身上", "The First Feng Shui Is Within Yourself", hant08, hans08, en08],
  ["emotional-intelligence-four-practices", "情緒有度：升起之後，還有第二個選擇", "情绪有度：升起之后，还有第二个选择", "Emotional Balance: A Second Choice After Feelings Arise", hant09, hans09, en09],
  ["love-reveals-the-unfinished-self", "愛會照人：關係裡，怎麼不把自己弄丟", "爱会照人：关系里，怎么不把自己弄丢", "Love Reveals Us: Staying Yourself in Relationships", hant10, hans10, en10],
  ["after-miracles-practice", "沒有神蹟之後，人怎麼修行", "没有神迹之后，人怎么修行", "Practice After Miracles: How Do We Live?", hant11, hans11, en11],
] as const;

function body(markdown: string) {
  return markdown.replace(/^---[\s\S]*?---\s*/, "").replace(/^# .*\n+/, "").trim();
}

export const MERGED_ELEVEN_ARTICLES: LifeViewArticle[] = source.map(([id, hant, hans, en, bodyHant, bodyHans, bodyEn], index) => ({
  id,
  publishedAt: "2026-11-16",
  title: { "zh-Hant": hant, "zh-Hans": hans, en },
  summary: { "zh-Hant": `${hant}｜昭梧觀世錄長篇文章。`, "zh-Hans": `${hans}｜昭梧观世录长篇文章。`, en: `${en}. A long-form ZHAOWU essay.` },
  body: { "zh-Hant": body(bodyHant), "zh-Hans": body(bodyHans), en: body(bodyEn) },
  ...(index === 0 ? {} : {}),
}));
