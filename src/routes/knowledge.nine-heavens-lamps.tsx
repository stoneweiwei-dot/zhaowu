import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/knowledge/nine-heavens-lamps")({ component: LampsParable });
type Copy = [string, string, string];
const t = (locale: Locale, value: Copy) => value[locale === "en" ? 2 : locale === "zh-Hans" ? 1 : 0];

const CHAPTERS: {
  image: string;
  title: Copy;
  subtitle: Copy;
  alt: Copy;
  paragraphs: Copy[];
}[] = [
  {
    image: "/articles/lamps-parable-01.svg",
    title: ["青燈相續", "青灯相续", "The Second Flame"],
    subtitle: ["殿中第一問", "殿中第一问", "The first question"],
    alt: ["九重雲殿前，青燈將盡而紫青新燈初燃的山水意象圖", "九重云殿前，青灯将尽而紫青新灯初燃的山水意象图", "A fading blue lamp and a newborn violet flame amid a celestial palace"],
    paragraphs: [
      ["傳說九重天外有一座古殿，殿中沒有神像，只有九萬九千九百九十九盞燈。每盞燈的光都不同：有的如金，有的如雪，有的幽藍而顫動。", "传说九重天外有一座古殿，殿中没有神像，只有九万九千九百九十九盏灯。每盏灯的光都不同：有的如金，有的如雪，有的幽蓝而颤动。", "Beyond the ninth heaven stood a palace with no idols, only ninety-nine thousand nine hundred and ninety-nine lamps. Each bore its own light: gold, snow-white, or trembling blue."],
      ["少年來拜掌燈老人為師。老人不問姓名來歷，只交給他一盞將熄的青燈：「替我守著它。」少年守了七日七夜；第八日，火焰終於滅了。", "少年来拜掌灯老人为师。老人不问姓名来历，只交给他一盏将熄的青灯：“替我守着它。”少年守了七日七夜；第八日，火焰终于灭了。", "A young seeker came to study with the keeper. Without asking his name, the old man handed him a fading blue lamp: 'Keep watch over it.' Seven nights passed. On the eighth day, it went out."],
      ["老人讓他到東殿看看。那裡不知何時多了一盞青紫色的新燈。少年驚問：「這就是原來那盞嗎？」老人說：「不是。」少年又問：「那原來的火去了哪裡？」老人答：「新的火，因舊的火留下的種種條件而生。」", "老人让他到东殿看看。那里不知何时多了一盏青紫色的新灯。少年惊问：“这就是原来那盏吗？”老人说：“不是。”少年又问：“那原来的火去了哪里？”老人答：“新的火，因旧的火留下的种种条件而生。”", "The keeper sent him to the eastern hall, where a new blue-violet flame now burned. 'Is this the first lamp?' the boy asked. 'No.' 'Then where did its flame go?' 'The new flame arose through conditions the old one helped leave behind.'"]
    ]
  },
  {
    image: "/articles/lamps-parable-02.svg",
    title: ["黑焰與白燈", "黑焰与白灯", "The Dark Flame and the White Lamp"],
    subtitle: ["殿中第二問", "殿中第二问", "The second question"],
    alt: ["古橋兩端，一盞焦黑殘燈與一盞潔白蓮形瓷燈，細光相連", "古桥两端，一盏焦黑残灯与一盏洁白莲形瓷灯，细光相连", "A burnt lamp and a pale lotus lamp at opposite ends of a stone bridge"],
    paragraphs: [
      ["少年在殿中住了三百年。他發現每盞燈都牽動著附近的燈，有的讓別人明亮，有的使別人黯淡；但偶然的寒風也會熄滅好燈，細心的照料也能救回弱火。", "少年在殿中住了三百年。他发现每盏灯都牵动着附近的灯，有的让别人明亮，有的使别人黯淡；但偶然的寒风也会熄灭好灯，细心的照料也能救回弱火。", "Three hundred years passed. He saw how the lamps affected one another. Some strengthened nearby flames, others weakened them; yet sudden cold could extinguish a gentle lamp, and careful tending could rescue a fragile one."],
      ["他開始記錄燈火的顏色、時日、傷害與恩惠，想替每盞燈算出應得的結局。一天他追查一盞曾燒壞無數燈罩的黑焰，卻發現它留下的條件，經過多代變化，與今日一盞極溫柔的白燈相連。", "他开始记录灯火的颜色、时日、伤害与恩惠，想替每盏灯算出应得的结局。一天他追查一盏曾烧坏无数灯罩的黑焰，却发现它留下的条件，经过多代变化，与今日一盏极温柔的白灯相连。", "He kept a ledger of colors, injuries and kindnesses, hoping to calculate each lamp's deserved fate. Tracing a destructive black flame through countless changes, he found connections leading to a white lamp that now comforted others."],
      ["「白燈是不是黑焰？它是否應當償還舊火的罪？」少年問。老人說：「承接，不等於重複。你若堅稱它們同一，便忽略變化；你若說它們毫無關係，便忽略條件。你想審判之前，先找出那個從未改變的主人。」", "“白灯是不是黑焰？它是否应当偿还旧火的罪？”少年问。老人说：“承接，不等于重复。你若坚称它们同一，便忽略变化；你若说它们毫无关系，便忽略条件。你想审判之前，先找出那个从未改变的主人。”", "'Is the white lamp the black flame? Must it repay the past?' The keeper replied, 'Inheritance is not repetition. Call them identical and you deny change; call them unrelated and you deny conditions. Before passing judgment, show me the owner who never changes.'"]
    ]
  },
  {
    image: "/articles/lamps-parable-03.svg",
    title: ["風與燈芯", "风与灯芯", "Wind, Oil and Wick"],
    subtitle: ["殿中第三問", "殿中第三问", "The third question"],
    alt: ["翠竹臨水樓臺，風動帳幔，桌上油燈搖晃而有人伸手遮風", "翠竹临水楼台，风动帐幔，桌上油灯摇晃而有人伸手遮风", "Wind moving bamboo and curtains around an oil lamp in a riverside pavilion"],
    paragraphs: [
      ["又過五百年，少年見柔和的燈早早熄滅，暴烈的火卻長久不滅，終於忍不住質問：「這座殿究竟有沒有公道？」老人將一盞燈放到窗邊，風進來，火焰搖晃。", "又过五百年，少年见柔和的灯早早熄灭，暴烈的火却长久不灭，终于忍不住质问：“这座殿究竟有没有公道？”老人将一盏灯放到窗边，风进来，火焰摇晃。", "Five hundred more years passed. The seeker saw gentle lights vanish early while harsher ones endured. 'Is there justice in this hall?' he cried. The keeper placed a lamp by an open window, where the wind made it flicker."],
      ["老人關窗，火穩了；剪短燈芯，火又變小。「你已看見風、油、燈芯、燈罩與人的手共同影響它。為什麼看見眾生受苦，你便只願意找一個原因？」", "老人关窗，火稳了；剪短灯芯，火又变小。“你已看见风、油、灯芯、灯罩与人的手共同影响它。为什么看见众生受苦，你便只愿意找一个原因？”", "He closed the window and the flame steadied; shortened the wick and it shrank. 'You can see how wind, oil, wick, shelter and human hands all matter. Why, when a person suffers, do you insist on only one cause?'"],
      ["「有些痛苦關乎選擇，有些來自他人，有些出於疾病與環境；你不能見人受苦，便斷定他必曾作惡。」少年默然，第一次撕掉了自己寫下的判詞。", "“有些痛苦关乎选择，有些来自他人，有些出于疾病与环境；你不能见人受苦，便断定他必曾作恶。”少年默然，第一次撕掉了自己写下的判词。", "'Some suffering is shaped by choices, some by other people, illness or circumstance. You cannot infer hidden wrongdoing merely because someone hurts.' For the first time, the seeker tore a verdict from his ledger."]
    ]
  },
  {
    image: "/articles/lamps-parable-04.svg",
    title: ["無人掌燈", "无人掌灯", "No Eternal Lamp-Keeper"],
    subtitle: ["最後的問答", "最后的问答", "The final exchange"],
    alt: ["山寺破曉，一位白衣修行者在舊燈旁放開手，蓮瓣向晨光飄去", "山寺破晓，一位白衣修行者在旧灯旁放开手，莲瓣向晨光飘去", "A white-robed practitioner releases their grip on a lamp at mountain dawn"],
    paragraphs: [
      ["後來，一位女子來問：「怎樣讓我的燈永遠不滅？」她整夜添油護火，既不敢睡，也不敢離去。老人問：「這一夜，你曾真正欣賞燈光嗎？你守的是光，還是失去光的恐懼？」", "后来，一位女子来问：“怎样让我的灯永远不灭？”她整夜添油护火，既不敢睡，也不敢离去。老人问：“这一夜，你曾真正欣赏灯光吗？你守的是光，还是失去光的恐惧？”", "Then a woman came asking how to keep her lamp burning forever. She spent the night adding oil, too frightened to sleep or leave. 'Did you enjoy its light at all?' the keeper asked. 'Are you guarding the flame, or your fear of losing it?'"],
      ["女子放下油壺，仍細心照料燈火，卻不再命令它永遠屬於自己。燈沒有變成永恆，心中的恐懼卻漸漸安靜。少年見此，忽然低頭看見自己的胸前也有一道微光，隨每一次呼吸、記憶與念頭而變。", "女子放下油壶，仍细心照料灯火，却不再命令它永远属于自己。灯没有变成永恒，心中的恐惧却渐渐安静。少年见此，忽然低头看见自己的胸前也有一道微光，随每一次呼吸、记忆与念头而变。", "She put down the oil jug but continued to care for the lamp, no longer demanding that it belong to her forever. The flame was still mortal, but her fear quieted. The seeker saw a light within his own chest, changing with every breath, memory and thought."],
      ["「那究竟是誰一直承受這些變化？」他抬頭問，老人已不見。空殿只留一句話：「不是同一盞燈，亦非毫無關聯；沒有永恆不變的主人，卻有相續不斷的條件。」少年這才明白，自己一直身在火中，從未站在火外。", "“那究竟是谁一直承受这些变化？”他抬头问，老人已不见。空殿只留一句话：“不是同一盏灯，亦非毫无关联；没有永恒不变的主人，却有相续不断的条件。”少年这才明白，自己一直身在火中，从未站在火外。", "'Then who has been undergoing all these changes?' He looked up, but the keeper was gone. On the wall remained the words: 'Neither the same flame nor utterly unrelated; no unchanging owner, yet conditions continue.' He had never stood outside the fire."],
      ["原來他尋找了千年的，並非哪一盞燈的前世，而是那個被他堅信必須永遠存在的「我」。", "原来他寻找了千年的，并非哪一盏灯的前世，而是那个被他坚信必须永远存在的“我”。", "What he had sought for a thousand years was not a flame's former life, but the permanent 'I' he assumed must exist."]
    ]
  }
];

const ANALYSIS: { title: Copy; paragraphs: Copy[] }[] = [
  {
    title: ["一、非一非異：如何理解相續", "一、非一非异：如何理解相续", "1. Neither identical nor unrelated"],
    paragraphs: [
      ["《相應部》SN 12.17、SN 12.46 討論造業者與受果者是否完全同一或完全不同，兩種極端都不足以理解因果。寓言用兩盞燈提示：後起現象能承接先前條件，卻不必假設有不變的實體被搬運。", "《相应部》SN 12.17、SN 12.46 讨论造业者与受果者是否完全同一或完全不同，两种极端都不足以理解因果。寓言用两盏灯提示：后起现象能承接先前条件，却不必假设有不变的实体被搬运。", "SN 12.17 and SN 12.46 reject both a permanently identical doer-and-experiencer and a wholly unrelated pair. The two lamps depict a causal continuity without a substance migrating unchanged."]
    ]
  },
  {
    title: ["二、業與多因：不是神明的帳本", "二、业与多因：不是神明的账本", "2. Karma is not divine bookkeeping"],
    paragraphs: [
      ["在佛教語境，業首先與有意志的行為有關，並不是任何不幸都由「前世做錯事」單獨決定。風、油、燈芯象徵多重條件；不能拿業報說法責備受害者，亦不能將複雜社會問題化成道德懲罰。", "在佛教语境，业首先与有意志的行为有关，并不是任何不幸都由“前世做错事”单独决定。风、油、灯芯象征多重条件；不能拿业报说法责备受害者，亦不能将复杂社会问题化成道德惩罚。", "Karma primarily concerns intentional action in Buddhist contexts. It is not a universal ledger proving that anyone who suffers deserves it. Wind, oil and wick represent the complexity of conditions and the danger of blaming victims."]
    ]
  },
  {
    title: ["三、無我與緣起性空", "三、无我与缘起性空", "3. Non-self, dependent origination and emptiness"],
    paragraphs: [
      ["無我不等於「人不存在」；它反對的是獨立、永恆不變的自我。中觀的空性進一步討論一切法不具獨立自性。燈仍然照明，也依條件變化；說它沒有自性，並不是說火焰從未存在。", "无我不等于“人不存在”；它反对的是独立、永恒不变的自我。中观的空性进一步讨论一切法不具独立自性。灯仍然照明，也依条件变化；说它没有自性，并不是说火焰从未存在。", "Non-self does not mean that persons are unreal in every sense; it denies an independent, immutable ego. Madhyamaka extends this critique to intrinsic nature in all phenomena: a lamp can still illuminate even though its existence depends on conditions."]
    ]
  },
  {
    title: ["四、解脫：照顧而不佔有", "四、解脱：照顾而不占有", "4. Freedom without possession"],
    paragraphs: [
      ["女子並非熄燈或拒絕責任；她仍照料它，只是不再要求它永遠不變。這對應佛教對貪愛、執取與苦的分析。寓言是文學說明，不是佛典逐字翻譯；輪迴與跨世業報仍屬宗教哲學主張，不能當作現代科學已證實的事實。", "女子并非熄灯或拒绝责任；她仍照料它，只是不再要求它永远不变。这对应佛教对贪爱、执取与苦的分析。寓言是文学说明，不是佛典逐字翻译；轮回与跨世业报仍属宗教哲学主张，不能当作现代科学已证实的事实。", "The woman neither abandons the lamp nor claims immortality for it. She continues to care without clinging. The parable is a literary interpretation of Buddhist ideas, not a direct scripture translation; claims about rebirth across lives are not independently established scientific facts."]
    ]
  }
];

function LampsParable() {
  const { locale } = useI18n();
  return (
    <main className="mx-auto max-w-3xl pb-20">
      <header className="mx-auto px-5 pb-9 pt-12 sm:pt-16">
        <p className="text-xs tracking-[0.22em] text-cinnabar">ZHAOWU · STONE 原創 · {t(locale, ["玄學寓言", "玄学寓言", "PHILOSOPHICAL PARABLE"])}</p>
        <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-5xl">{t(locale, ["九重天外，無人掌燈", "九重天外，无人掌灯", "Beyond Nine Heavens, No Keeper of the Lamp"])}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-ink-soft">{t(locale, ["四段故事、四幅畫。直到結尾，才揭開少年尋找千年的答案。", "四段故事、四幅画。直到结尾，才揭开少年寻找千年的答案。", "Four illustrated chapters. The secret the seeker has pursued for a thousand years is disclosed only at the end."])}</p>
      </header>
      <div className="space-y-16 sm:space-y-24">
        {CHAPTERS.map((chapter,index)=>(
          <article key={chapter.image} aria-labelledby={`lamp-chapter-${index}`}>
            <figure className="mx-auto max-w-[560px]">
              <img src={chapter.image} alt={t(locale,chapter.alt)} width={1080} height={1920} loading={index===0?"eager":"lazy"} decoding="async" className="block aspect-[9/16] h-auto w-full object-contain"/>
              <figcaption className="px-5 pt-2 text-xs tracking-[0.08em] text-ink-soft">{t(locale, ["圖境", "图境", "Scene"])} {String(index+1).padStart(2,"0")} · STONE 原創</figcaption>
            </figure>
            <div className="mx-auto max-w-2xl px-5 pt-8 sm:pt-10">
              <p className="text-xs tracking-[0.22em] text-cinnabar">{t(locale,chapter.subtitle)}</p>
              <h2 id={`lamp-chapter-${index}`} className="mt-2 font-display text-2xl leading-snug text-ink sm:text-3xl">{t(locale,chapter.title)}</h2>
              <div className="mt-6 space-y-5 text-[16px] leading-[2] text-ink-soft">
                {chapter.paragraphs.map((p,j)=><p key={j}>{t(locale,p)}</p>)}
              </div>
            </div>
          </article>
        ))}
      </div>
      <section className="mx-auto max-w-2xl px-5 pt-24" aria-labelledby="concept-reveal">
        <p className="text-xs tracking-[0.22em] text-cinnabar">{t(locale, ["謎底 · 研究札記", "谜底 · 研究札记", "REVEAL · RESEARCH NOTE"])}</p>
        <h2 id="concept-reveal" className="mt-3 font-display text-3xl text-ink">{t(locale, ["緣起、無我與業果相續", "缘起、无我与业果相续", "Dependent Origination, Non-self and Karma"])}</h2>
        <p className="mt-5 text-base leading-8 text-ink-soft">{t(locale, ["這篇寓言真正追問的是：若不存在恆常不變的靈魂，何以仍有因果與相續？故事不是要證明靈魂存在或輪迴可測量，而是讓讀者辨認「同一」和「斷滅」之外的第三種思考方式。", "这篇寓言真正追问的是：若不存在恒常不变的灵魂，何以仍有因果与相续？故事不是要证明灵魂存在或轮回可测量，而是让读者辨认“同一”和“断灭”之外的第三种思考方式。", "The underlying question is how causality and continuity can be understood without an eternal soul. The story does not prove the existence of souls or empirical rebirth; it explores a middle path between absolute sameness and total discontinuity."])}</p>
        <div className="mt-10 space-y-9">
          {ANALYSIS.map((section,i)=><section key={i}><h3 className="font-display text-xl text-ink">{t(locale,section.title)}</h3>{section.paragraphs.map((p,j)=><p key={j} className="mt-3 text-[15px] leading-8 text-ink-soft">{t(locale,p)}</p>)}</section>)}
        </div>
        <div className="mt-11 border-t border-ink/15 pt-7 text-sm leading-8 text-ink-soft">
          <h3 className="font-display text-lg text-ink">{t(locale, ["來源與界線", "来源与界线", "Sources and limits"])}</h3>
          <p className="mt-3">{t(locale, ["典籍、現代哲學研究與本篇文學創作互不混同。參考下列可核對來源。", "典籍、现代哲学研究与本篇文学创作互不混同。参考下列可核对来源。", "The parable, canonical scripture and scholarly interpretations are distinct. Consult the linked references."])}</p>
          <ul className="mt-2 list-disc pl-5">
            <li><a href="https://suttacentral.net/sn12.17/en/bodhi" rel="noopener noreferrer" target="_blank" className="underline underline-offset-4">SN 12.17 · Acelakassapasutta</a></li>
            <li><a href="https://suttacentral.net/sn12.46/en/sujato" rel="noopener noreferrer" target="_blank" className="underline underline-offset-4">SN 12.46 · Aññatarabrāhmaṇasutta</a></li>
            <li><a href="https://plato.stanford.edu/entries/nagarjuna/" rel="noopener noreferrer" target="_blank" className="underline underline-offset-4">Stanford Encyclopedia of Philosophy · Nāgārjuna</a></li>
          </ul>
        </div>
        <nav className="mt-12"><Link to="/knowledge" className="underline underline-offset-4 text-ink">{t(locale, ["返回昭梧知識庫", "返回昭梧知识库", "Back to ZHAOWU Knowledge"])}</Link></nav>
      </section>
    </main>
  );
}
