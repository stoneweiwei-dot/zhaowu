import type { Locale } from "@/lib/i18n";
import { l, tr } from "./-mythic-atlas-data";

const BORROW_STAR_COPY = {
  eyebrow: l("黃泉異聞 · 原創支線", "黄泉异闻 · 原创支线", "YELLOW SPRINGS TALES · ORIGINAL SIDE STORY"),
  title: l("借星", "借星", "Borrowed Star"),
  lead: l(
    "不改《黃泉四紀》主線，記一則發生在黃泉、天界與人間倒影交界的無名異聞：一枚墜落的星，讓兩個本不該相見的人沿著光、渡水、穿界而行。",
    "不改《黄泉四纪》主线，记一则发生在黄泉、天界与人间倒影交界的无名异闻：一枚坠落的星，让两个本不该相见的人沿着光、渡水、穿界而行。",
    "A side tale outside the Four Chronicles: at the reflected border of Yellow Springs, heaven and the living world, a fallen star draws two people who should never meet across light, water and worlds."
  ),
  note: l(
    "九頁《借星》系列畫作｜本版由同系列合輯整理成九幅直式圖像，非九張獨立生成原畫；每幕附故事文字。",
    "九页《借星》系列画作｜本版由同系列合辑整理成九幅竖式图像，并非九张独立生成原画；每幕附故事文字。",
    "Nine illustrated Borrowed Star scenes, adapted from the approved series contact sheet rather than nine separately generated original paintings."
  ),
};

const BORROW_STAR_PAGES = [
  {
    file: "/mythic-atlas/borrow-star/01-falling-star.webp",
    title: l("壹 · 墜星", "壹 · 坠星", "I · Falling Star"),
    text: l("山谷月夜，黑衣少年撿到一枚不會熄滅的星。它在掌心呼吸，像在等待有人認出它。", "山谷月夜，黑衣少年捡到一枚不会熄灭的星。它在掌心呼吸，像在等待有人认出它。", "On a moonlit mountain night, a young man in black finds a star that refuses to die. It breathes in his palm, waiting to be recognised."),
  },
  {
    file: "/mythic-atlas/borrow-star/02-follow-the-light.webp",
    title: l("貳 · 追光", "贰 · 追光", "II · Follow the Light"),
    text: l("星芒化成一線微金，指向一座只存在於水中倒影的山；他因此離開原路。", "星芒化成一线微金，指向一座只存在于水中倒影的山；他因此离开原路。", "The star becomes a thin golden thread pointing to a mountain visible only in reflection. He leaves the known road."),
  },
  {
    file: "/mythic-atlas/borrow-star/03-reflection-mountain.webp",
    title: l("參 · 倒影山", "叁 · 倒影山", "III · Mountain in Reflection"),
    text: l("他觸到水面，才發現倒影不是影子。水下另有一重天境，白衣人第一次出現在彼端。", "他触到水面，才发现倒影不是影子。水下另有一重天境，白衣人第一次出现在彼端。", "He touches the water and learns the reflection is no reflection. Another heaven lies below, where a man in white first appears."),
  },
  {
    file: "/mythic-atlas/borrow-star/04-heaven-gate.webp",
    title: l("肆 · 天門影", "肆 · 天门影", "IV · Shadow of Heaven's Gate"),
    text: l("守星之人立於天門，只能看見人間那點失落的光；兩界相望，誰也不能先跨過界線。", "守星之人立于天门，只能看见人间那点失落的光；两界相望，谁也不能先跨过界线。", "The keeper of stars stands at Heaven's Gate, able only to see the lost light below. Across two worlds, neither may cross first."),
  },
  {
    file: "/mythic-atlas/borrow-star/05-lone-boat.webp",
    title: l("伍 · 孤舟渡", "伍 · 孤舟渡", "V · The Lone Crossing"),
    text: l("黑衣少年乘一葉孤舟逆星河而上。燈火與群山向後退去，遠方天門卻愈來愈近。", "黑衣少年乘一叶孤舟逆星河而上。灯火与群山向后退去，远方天门却越来越近。", "He rows a lone boat against the river of stars. Lanterns and mountains recede as Heaven's Gate draws near."),
  },
  {
    file: "/mythic-atlas/borrow-star/06-enter-water.webp",
    title: l("陸 · 入水", "陆 · 入水", "VI · Beneath the Water"),
    text: l("他主動沉入鏡面，穿過倒置山門與水下光廊。從這一刻起，他已不完全屬於人間。", "他主动沉入镜面，穿过倒置山门与水下光廊。从这一刻起，他已不完全属于人间。", "He descends through the mirror, passing inverted gates and submerged corridors of light. From then on, he no longer belongs wholly to the living world."),
  },
  {
    file: "/mythic-atlas/borrow-star/07-star-palace.webp",
    title: l("柒 · 星宮", "柒 · 星宫", "VII · Palace of Stars"),
    text: l("兩人隔著最後一層透明界幕伸手。失落之星懸在指尖之間，替彼此照出真實的輪廓。", "两人隔着最后一层透明界幕伸手。失落之星悬在指尖之间，替彼此照出真实的轮廓。", "They reach across the final transparent veil. The lost star hangs between their fingertips, revealing each to the other."),
  },
  {
    file: "/mythic-atlas/borrow-star/08-meeting.webp",
    title: l("捌 · 相逢", "捌 · 相逢", "VIII · Meeting"),
    text: l("星光先越過界線，兩隻手才真正相觸。沒有誓言，只有整片冷色山河短暫亮成溫白。", "星光先越过界线，两只手才真正相触。没有誓言，只有整片冷色山河短暂亮成温白。", "Starlight crosses first; only then do their hands meet. No vow is spoken. The cold landscape briefly turns warm white."),
  },
  {
    file: "/mythic-atlas/borrow-star/09-star-returns.webp",
    title: l("玖 · 星歸", "玖 · 星归", "IX · The Star Returns"),
    text: l("天將亮，星被送回天穹，少年也回到最初的崖邊。晨霧散後，天空多出一顆只在他抬頭時發亮的星。", "天将亮，星被送回天穹，少年也回到最初的崖边。晨雾散后，天空多出一颗只在他抬头时发亮的星。", "At dawn the star returns to the sky and the traveller to his first cliff. When the mist clears, one new star shines only when he looks up."),
  },
] as const;

export function BorrowStarInterlude({ locale }: { locale: Locale }) {
  return <section className="hq-section hq-borrow-star" id="borrow-star">
    <div className="hq-section-heading">
      <span>{tr(BORROW_STAR_COPY.eyebrow, locale)}</span>
      <h2>{tr(BORROW_STAR_COPY.title, locale)}</h2>
      <p>{tr(BORROW_STAR_COPY.lead, locale)}</p>
      <p className="hq-borrow-star-note">{tr(BORROW_STAR_COPY.note, locale)}</p>
    </div>
    <div className="hq-borrow-star-pages">
      {BORROW_STAR_PAGES.map((page, index) => <figure className="hq-borrow-star-page" key={page.file}>
        <div className="hq-image-frame">
          <img
            src={page.file}
            alt={tr(page.title, locale)}
            width={540}
            height={960}
            loading={index < 2 ? "eager" : "lazy"}
          />
          <span className="hq-original-mark">STONE 原創</span>
        </div>
        <figcaption>
          <strong>{tr(page.title, locale)}</strong>
          <p>{tr(page.text, locale)}</p>
          <small>{tr(l("《幽明萬象錄》原創支線", "《幽明万象录》原创支线", "Original chronicle side story"), locale)}</small>
        </figcaption>
      </figure>)}
    </div>
  </section>;
}
