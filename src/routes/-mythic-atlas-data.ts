import type { Locale } from "@/lib/i18n";

export type Localized = { hant: string; hans: string; en: string };
export type SourceKind = "tradition" | "modern" | "story";
export type Side = "order" | "shadow";
export type Member = { name: Localized; role: Localized; sourceKind: SourceKind; source: Localized };
export type Branch = { id: string; side: Side; title: Localized; subtitle: Localized; image: number; members: Member[] };

export const l = (hant: string, hans: string, en: string): Localized => ({ hant, hans, en });
export const tr = (value: Localized, locale: Locale) => locale === "en" ? value.en : locale === "zh-Hans" ? value.hans : value.hant;

export const COPY = {
  kicker: l("昭梧異聞錄 · 原創神話宇宙", "昭梧异闻录 · 原创神话宇宙", "ZHAOWU MYTHIC ARCHIVE · AN ORIGINAL UNIVERSE"),
  title: l("幽明萬象錄", "幽明万象录", "The Chronicle of Hidden and Manifest Worlds"),
  subtitle: l("三界異聞 · 生死、神怪與觀心之書", "三界异闻 · 生死、神怪与观心之书", "Three Realms · A Book of Afterlife, Myth and Inner Seeing"),
  intro: l("三界有律，萬類有名。黃泉只是入口：從天庭、封疆、幽冥與山海異類，到人如何理解死亡、記憶、選擇與自身，《幽明萬象錄》把古籍神話、民間信仰、原創敘事與現代觀心分層收在同一部異聞之書。", "三界有律，万类有名。黄泉只是入口：从天庭、封疆、幽冥与山海异类，到人如何理解死亡、记忆、选择与自身，《幽明万象录》把古籍神话、民间信仰、原创叙事与现代观心分层收在同一部异闻之书。", "The Yellow Springs are only the threshold. The Chronicle of Hidden and Manifest Worlds gathers heaven, the underworld, strange beings, afterlife traditions and modern reflections on perception and choice, while keeping historical sources, living traditions, fiction and contemporary interpretation clearly separated."),
  notice: l("創作聲明：人物來源與本作劇情分層標示；宗教人物皆為文學性演繹，不代表任何教義。十二幅插畫均為 STONE 原創重構，取法古畫構圖與氣韻，不是原作複製。", "创作声明：人物来源与本作剧情分层标示；宗教人物皆为文学性演绎，不代表任何教义。十二幅插画均为 STONE 原创重构，取法古画构图与气韵，不是原作复制。", "Creative note: sources and story inventions are labelled separately. Religious figures are literary interpretations, not statements of doctrine. All twelve illustrations are original STONE reconstructions inspired by historical composition and atmosphere, not reproductions."),
  back: l("返回昭梧", "返回昭梧", "Back to ZHAOWU"),
  begin: l("展開世界觀", "展开世界观", "Enter the world"),
  contents: l("卷目", "卷目", "Contents"),
  world: l("壹 · 三界與兩序", "壹 · 三界与两序", "I · Three Realms, Two Orders"),
  atlas: l("貳 · 八脈眾生圖譜", "贰 · 八脉众生图谱", "II · Atlas of Eight Lineages"),
  chronicle: l("參 · 幽明四紀", "叁 · 幽明四纪", "III · Four Chronicles of the Hidden Realms"),
  paintings: l("肆 · 十二圖錄", "肆 · 十二图录", "IV · Twelve Plates"),
  observation: l("伍 · 觀心篇", "伍 · 观心篇", "V · Inner Seeing"),
  sources: l("陸 · 來源與界線", "陆 · 来源与界线", "VI · Sources and Boundaries"),
  atlasLead: l("八大支系、三十五位角色。搜尋姓名或職司，也可依陣營與來源層級篩選。", "八大支系、三十五位角色。搜索姓名或职司，也可依阵营与来源层级筛选。", "Eight lineages and thirty-five figures. Search by name or role, then filter by allegiance and source layer."),
  search: l("搜尋人物、職司或來源", "搜索人物、职司或来源", "Search figures, roles or sources"),
  all: l("全部", "全部", "All"), order: l("正序", "正序", "Keepers of order"), shadow: l("旁門", "旁门", "Unorthodox paths"),
  empty: l("沒有符合條件的人物，請清除部分篩選。", "没有符合条件的人物，请清除部分筛选。", "No figure matches these filters. Clear one or more filters."),
  figures: l("位人物", "位人物", "figures"), plate: l("STONE 原創重構", "STONE 原创重构", "STONE original reconstruction"),
  imageNotice: l("十二圖均以 9:16 手機閱讀重新構圖；圖檔右下角保留永久 STONE 署名，頁面另標示完整原創聲明。", "十二图均以 9:16 手机阅读重新构图；图档右下角保留永久 STONE 署名，页面另标示完整原创声明。", "All twelve plates were recomposed for 9:16 mobile reading. Each file carries a permanent STONE mark and a full originality label on the page."),
  selectPlate: l("選擇圖版", "选择图版", "Choose plate"), inspiredBy: l("取法", "取法", "Inspired by"), sourceLegend: l("來源分層", "来源分层", "Source layers"),
  methods: l("本作不把後世附會寫成古籍原文，也不把原創聯盟冒充宗教傳統。角色的歷史來源與《幽明萬象錄》中的立場分開處理；無法確定的民間名號只標為傳承線索，不製造假引文。", "本作不把后世附会写成古籍原文，也不把原创联盟冒充宗教传统。角色的历史来源与《幽明万象录》中的立场分开处理；无法确定的民间名号只标为传承线索，不制造假引文。", "Later accretions are not presented as classical quotations, and invented alliances are not passed off as religious tradition. A figure's historical provenance is kept separate from their role in this story; uncertain folk titles are treated as leads, never fabricated citations."),
} as const;

export const SOURCE_LABELS: Record<SourceKind, Localized> = {
  tradition: l("古籍／宗教傳統", "古籍／宗教传统", "Classical / religious tradition"),
  modern: l("近現代二創線索", "近现代二创线索", "Modern adaptation thread"),
  story: l("《幽明萬象錄》原創", "《幽明万象录》原创", "Original to this chronicle"),
};

export const REALMS = [
  { mark: "天", title: l("天界", "天界", "Heaven"), text: l("以神職、星宿與敕令維持秩序；能定名，未必能理解眾生。", "以神职、星宿与敕令维持秩序；能定名，未必能理解众生。", "Divine offices, constellations and decrees sustain order. They may name all beings without understanding them.") },
  { mark: "人", title: l("人間", "人间", "The living world"), text: l("王朝、香火與山川封疆交疊之地，也是每一次異變最先留下傷痕的地方。", "王朝、香火与山川封疆交叠之地，也是每一次异变最先留下伤痕的地方。", "Dynasty, devotion and sacred terrain overlap here. Every rupture leaves its first scar among the living.") },
  { mark: "泉", title: l("黃泉", "黄泉", "Yellow Springs"), text: l("亡魂被記名、裁定與引渡之所。空白不是遺漏，而是某種力量正在抹除存在。", "亡魂被记名、裁定与引渡之所。空白不是遗漏，而是某种力量正在抹除存在。", "The dead are registered, judged and guided onward. A blank is not an omission—it is the erasure of existence.") },
];

export const ORDERS = [
  { side: "order" as Side, seal: "正", title: l("正序 · 維繫有名之世", "正序 · 维系有名之世", "Order · Preserve the named world"), text: l("天界、人間封疆、幽冥官署與神獸圖騰並不總是同心，卻都依賴名冊、敕令與疆界。", "天界、人间封疆、幽冥官署与神兽图腾并不总是同心，却都依赖名册、敕令与疆界。", "Heaven, earthly wardens, underworld offices and sacred beasts rarely agree, but all depend on registers, decrees and boundaries.") },
  { side: "shadow" as Side, seal: "旁", title: l("旁門 · 追索無名之力", "旁门 · 追索无名之力", "Unorthodox · Seek the power of the unnamed"), text: l("上古災異、自然精怪、外道魔門與異域暗面各懷目的；裂隙讓被壓在秩序之外的名字重新現身。", "上古灾异、自然精怪、外道魔门与异域暗面各怀目的；裂隙让被压在秩序之外的名字重新现身。", "Ancient calamities, wild spirits, heterodox powers and foreign shadows pursue different ends. The breach restores names buried outside order.") },
];

const m = (name: Localized, role: Localized, sourceKind: SourceKind, source: Localized): Member => ({ name, role, sourceKind, source });

export const BRANCHES: Branch[] = [
  { id: "celestial", side: "order", image: 3, title: l("天界高層", "天界高层", "Celestial Court"), subtitle: l("以神權與星命維持天律", "以神权与星命维持天律", "Keepers of celestial law and stellar fate"), members: [
    m(l("東皇太一", "东皇太一", "Donghuang Taiyi"), l("古老天序的象徵；在裂隙前主張先定名、後問因。", "古老天序的象征；在裂隙前主张先定名、后问因。", "An emblem of ancient celestial order who would name the breach before asking its cause."), "tradition", l("《楚辭·九歌》傳統；本作職司為改編", "《楚辞·九歌》传统；本作职司为改编", "Chuci, Nine Songs tradition; story office adapted")),
    m(l("天帝", "天帝", "Celestial Sovereign"), l("諸天敕令的最高名位，真身與意志始終不直接顯現。", "诸天敕令的最高名位，真身与意志始终不直接显现。", "The highest title behind celestial decrees, whose person and will never appear directly."), "tradition", l("跨典籍的上帝／天帝觀念；本作重新整合", "跨典籍的上帝／天帝观念；本作重新整合", "Cross-textual concepts of the heavenly sovereign, recomposed here")),
    m(l("如來佛祖", "如来佛祖", "The Tathagata"), l("不入陣營爭衡，只在眾生執著將成災時留下警語。", "不入阵营争衡，只在众生执着将成灾时留下警语。", "Beyond factional struggle, offering warning when attachment ripens into catastrophe."), "tradition", l("佛教傳統；劇情關係為文學演繹", "佛教传统；剧情关系为文学演绎", "Buddhist tradition; story relations are literary")),
    m(l("觀音菩薩", "观音菩萨", "Guanyin"), l("聽見被名冊抹去者的聲音，成為兩序之間唯一仍可通行的慈航。", "听见被名册抹去者的声音，成为两序之间唯一仍可通行的慈航。", "Hears those erased from the ledgers and becomes the sole merciful passage between the two orders."), "tradition", l("佛教與漢地信仰傳統；情節為本作演繹", "佛教与汉地信仰传统；情节为本作演绎", "Buddhist and Chinese devotional traditions; plot adapted")),
  ] },
  { id: "wardens", side: "order", image: 4, title: l("人間封疆", "人间封疆", "Earthly Wardens"), subtitle: l("鎮山、護國、搜捕越界之物", "镇山、护国、搜捕越界之物", "Guardians of peaks, states and contested borders"), members: [
    m(l("崇恩聖帝", "崇恩圣帝", "Chong'en Sacred Emperor"), l("掌東南一線香火與海疆，最早察覺無燈之夜。", "掌东南一线香火与海疆，最早察觉无灯之夜。", "Holds a coastal devotional frontier and first notices the nights without lanterns."), "modern", l("民間名號線索待考；本作職司原創", "民间名号线索待考；本作职司原创", "Folk-title lead requiring verification; story office original")),
    m(l("二郎神", "二郎神", "Erlang Shen"), l("奉命搜山，卻在追捕中發現越界者未必皆為惡。", "奉命搜山，却在追捕中发现越界者未必皆为恶。", "Sent to search the mountains, only to learn that not every border-crosser is malign."), "tradition", l("二郎信仰與搜山敘事傳統；本作情節改編", "二郎信仰与搜山叙事传统；本作情节改编", "Erlang devotional and mountain-search traditions; plot adapted")),
    m(l("真武大帝", "真武大帝", "Zhenwu"), l("坐鎮北方水火之界，守著一條天庭從未登錄的舊路。", "坐镇北方水火之界，守着一条天庭从未登录的旧路。", "Guards the northern threshold of water and fire—and an old road heaven never registered."), "tradition", l("道教真武信仰；秘密舊路為本作設定", "道教真武信仰；秘密旧路为本作设定", "Daoist Zhenwu tradition; the hidden road is original")),
  ] },
  { id: "underworld", side: "order", image: 5, title: l("幽冥秩序", "幽冥秩序", "Underworld Offices"), subtitle: l("記名、審判與輪迴引渡", "记名、审判与轮回引渡", "Registration, judgment and passage onward"), members: [
    m(l("九天監生司", "九天监生司", "Bureau of Celestial Births"), l("核對生籍與死簿之間的缺口；每一頁空白都指向尚未出生的人。", "核对生籍与死簿之间的缺口；每一页空白都指向尚未出生的人。", "Compares registers of birth and death; each blank points toward someone not yet born."), "tradition", l("道教監生信仰線索；官署運作為本作重構", "道教监生信仰线索；官署运作为本作重构", "Daoist birth-guardian tradition; bureau mechanics reconstructed")),
    m(l("后土娘娘", "后土娘娘", "Houtu"), l("守住亡魂歸屬，拒絕用焚毀名冊換取表面的秩序。", "守住亡魂归属，拒绝用焚毁名册换取表面的秩序。", "Defends the dead's right to belong and refuses to burn the ledgers for superficial order."), "tradition", l("后土信仰傳統；幽冥主線為文學演繹", "后土信仰传统；幽冥主线为文学演绎", "Houtu tradition; underworld storyline is literary")),
    m(l("十殿閻羅", "十殿阎罗", "Ten Kings of Hell"), l("十殿各執一案，因同一亡魂出現十種互相矛盾的前世而停審。", "十殿各执一案，因同一亡魂出现十种互相矛盾的前世而停审。", "Ten courts suspend judgment when one soul arrives with ten contradictory past lives."), "tradition", l("十王信仰與圖像傳統；案件為本作原創", "十王信仰与图像传统；案件为本作原创", "Ten Kings tradition and imagery; the case is original")),
  ] },
  { id: "totems", side: "order", image: 6, title: l("神獸圖騰", "神兽图腾", "Sacred Beasts"), subtitle: l("五蟲之長與天地氣象", "五虫之长与天地气象", "The five creature kinds and the breath of the cosmos"), members: [
    m(l("五蟲體系", "五虫体系", "Five Creature Kinds"), l("羽、毛、鱗、介、倮各有其長；裂隙使龍鳳麟龜與人不再承認同一套秩序。", "羽、毛、鳞、介、倮各有其长；裂隙使龙凤麟龟与人不再承认同一套秩序。", "Feathered, furred, scaled, shelled and bare beings each have a sovereign; the breach breaks their common order."), "tradition", l("《大戴禮記·易本命》五蟲觀念；衝突為本作推演", "《大戴礼记·易本命》五虫观念；冲突为本作推演", "Five-kind scheme in Da Dai Liji; conflict extrapolated for this story")),
  ] },
  { id: "calamities", side: "shadow", image: 7, title: l("上古災異", "上古灾异", "Ancient Calamities"), subtitle: l("被治水、征伐與正史壓回地底的舊名", "被治水、征伐与正史压回地底的旧名", "Old names buried by flood control, conquest and official history"), members: [
    m(l("共工", "共工", "Gonggong"), l("要讓傾斜的天地回到災變之前，代價是現世重新被洪水丈量。", "要让倾斜的天地回到灾变之前，代价是现世重新被洪水丈量。", "Would restore the cosmos before its tilting, even if the living world must be measured again by flood."), "tradition", l("上古神話傳統；復世目的為本作設定", "上古神话传统；复世目的为本作设定", "Ancient mythic traditions; restoration motive is original")),
    m(l("相柳", "相柳", "Xiangliu"), l("九首各記得一種敗亡版本，誰也不能證明哪一個才是真史。", "九首各记得一种败亡版本，谁也不能证明哪一个才是真史。", "Nine heads remember nine versions of defeat, none provably the true history."), "tradition", l("《山海經》與後世傳統；九重記憶為本作設定", "《山海经》与后世传统；九重记忆为本作设定", "Shanhaijing and later traditions; ninefold memory is original")),
    m(l("旱魃", "旱魃", "Drought Demon"), l("所過無雨，卻能曬出被水淹沒的古城與失名者。", "所过无雨，却能晒出被水淹没的古城与失名者。", "Rain dies in her wake, yet drowned cities and erased names rise into view."), "tradition", l("旱魃神話傳統；顯城能力為本作演繹", "旱魃神话传统；显城能力为本作演绎", "Drought-demon traditions; city-revealing power adapted")),
    m(l("丹朱", "丹朱", "Danzhu"), l("拒絕只以敗子之名留在正史，企圖奪回被改寫的命數。", "拒绝只以败子之名留在正史，企图夺回被改写的命数。", "Refuses to survive only as a failed son in official history and seeks his rewritten fate."), "tradition", l("古史傳說人物；命數主線為本作演繹", "古史传说人物；命数主线为本作演绎", "Figure of early historical legend; fate arc is original")),
    m(l("妖鳳", "妖凤", "Calamity Phoenix"), l("不是祥瑞墮落，而是被天界拒絕命名的另一支羽族之長。", "不是祥瑞堕落，而是被天界拒绝命名的另一支羽族之长。", "Not a fallen auspicious bird, but a sovereign of feathered beings heaven refused to name."), "story", l("由五蟲與鳳凰意象延伸的原創角色", "由五虫与凤凰意象延伸的原创角色", "Original figure extrapolated from five-kind and phoenix imagery")),
    m(l("妖麟", "妖麟", "Calamity Qilin"), l("以不祥承擔被排除的罪名，角上刻滿遭刪去的族譜。", "以不祥承担被排除的罪名，角上刻满遭删去的族谱。", "Bears the accusation of ill omen, erased genealogies carved into its horn."), "story", l("由麒麟祥瑞觀念反向創作", "由麒麟祥瑞观念反向创作", "Original inversion of qilin symbolism")),
    m(l("四方巫妖", "四方巫妖", "Witch-Demons of Four Quarters"), l("分守四處古祭場，以失傳的名諱交換災異記憶。", "分守四处古祭场，以失传的名讳交换灾异记忆。", "Guard four abandoned ritual grounds, trading lost names for memories of catastrophe."), "story", l("《幽明萬象錄》原創群像", "《幽明万象录》原创群像", "Original collective created for this chronicle")),
  ] },
  { id: "wild", side: "shadow", image: 8, title: l("自然精怪", "自然精怪", "Wild Spirits"), subtitle: l("香火之外，自有山川草木的生死", "香火之外，自有山川草木的生死", "Beyond worship, landscape and living things keep their own cycle"), members: [
    m(l("東陵聖母", "东陵圣母", "Matriarch of the Eastern Mound"), l("收留被廟祀與族譜同時遺忘的女魂，守一座不受冊封的祠。", "收留被庙祀与族谱同时遗忘的女魂，守一座不受册封的祠。", "Shelters women forgotten by shrine and genealogy in a sanctuary no decree recognizes."), "modern", l("民間／近現代敘事線索；本作重新塑形", "民间／近现代叙事线索；本作重新塑形", "Folk or modern narrative lead; reshaped for this story")),
    m(l("金花聖母", "金花圣母", "Golden Flower Matriarch"), l("掌五毒與藥性，認為毒是萬物拒絕被吞食的語言。", "掌五毒与药性，认为毒是万物拒绝被吞食的语言。", "Keeps poison and medicine, holding poison to be nature's language of refusal."), "modern", l("金花信仰線索與五毒母題；關係為本作重構", "金花信仰线索与五毒母题；关系为本作重构", "Golden Flower and Five Poisons motifs; relationship reconstructed")),
    m(l("狐妖一脈", "狐妖一脉", "Fox Lineage"), l("替無名者借來面貌與身份，代價是逐漸忘記自己的第一張臉。", "替无名者借来面貌与身份，代价是逐渐忘记自己的第一张脸。", "Lends faces to the nameless, slowly forgetting its own first face."), "tradition", l("狐魅敘事傳統；借名規則為本作原創", "狐魅叙事传统；借名规则为本作原创", "Fox-spirit traditions; name-lending rule is original")),
    m(l("虎倀", "虎伥", "Tiger Thralls"), l("既是受害者也是引路者，只有帶來下一人才能暫時取回人聲。", "既是受害者也是引路者，只有带来下一人才能暂时取回人声。", "Victims and guides who regain a human voice only by delivering another traveler."), "tradition", l("為虎作倀的民間敘事；聲音規則為本作設定", "为虎作伥的民间叙事；声音规则为本作设定", "Tiger-thrall folklore; voice rule is original")),
    m(l("雄王", "雄王", "King of Beasts"), l("統領山獸卻拒受祥瑞名號，要把封禪所奪的山路還給群獸。", "统领山兽却拒受祥瑞名号，要把封禅所夺的山路还给群兽。", "Rules mountain beasts but refuses an auspicious title, returning sacred roads to the wild."), "story", l("《幽明萬象錄》原創角色", "《幽明万象录》原创角色", "Original figure created for this chronicle")),
    m(l("鼠王", "鼠王", "Rat King"), l("走遍城牆、糧倉與墓穴，掌握三界最細小也最真實的通道。", "走遍城墙、粮仓与墓穴，掌握三界最细小也最真实的通道。", "Knows the smallest passages through walls, granaries and tombs."), "modern", l("動物王母題；本作角色化", "动物王母题；本作角色化", "Animal-king motif; characterized for this story")),
    m(l("萬獸朝蒼·萬鳥朝昭", "万兽朝苍·万鸟朝昭", "Beasts to Cang · Birds to Zhao"), l("兩場同日發生的異兆：獸向北伏地，鳥向東銜火。", "两场同日发生的异兆：兽向北伏地，鸟向东衔火。", "Twin omens: beasts kneel northward while birds carry fire east."), "story", l("《幽明萬象錄》原創群像與異象", "《幽明万象录》原创群像与异象", "Original collective omen")),
  ] },
  { id: "heterodox", side: "shadow", image: 9, title: l("外道魔門", "外道魔门", "Heterodox Powers"), subtitle: l("以慾念、禁法與假名開門", "以欲念、禁法与假名开门", "Doors opened through desire, forbidden methods and false names"), members: [
    m(l("波旬", "波旬", "Mara"), l("不奪性命，只讓每個人相信自己的執著就是唯一真理。", "不夺性命，只让每个人相信自己的执着就是唯一真理。", "Takes no life, merely persuading each person that attachment is the only truth."), "tradition", l("佛教魔羅傳統；本作情節為文學演繹", "佛教魔罗传统；本作情节为文学演绎", "Buddhist Mara tradition; literary story treatment")),
    m(l("朗達瑪王", "朗达玛王", "King Langdarma"), l("歷史人物的幽暗傳說在此化成一面鏡，照見政治如何利用信仰之名。", "历史人物的幽暗传说在此化成一面镜，照见政治如何利用信仰之名。", "Dark legends around a historical ruler become a mirror for politics in religion's name."), "tradition", l("歷史人物與後世敘事；超自然角色為本作演繹", "历史人物与后世叙事；超自然角色为本作演绎", "Historical figure and later narratives; supernatural role is literary")),
    m(l("十二流煞", "十二流煞", "Twelve Currents of Calamity"), l("每月吞去一種人間記憶，十二月滿便能讓一個朝代從未存在。", "每月吞去一种人间记忆，十二月满便能让一个朝代从未存在。", "Each moon devours one memory; after twelve, a dynasty may never have existed."), "story", l("《幽明萬象錄》原創設定", "《幽明万象录》原创设定", "Original concept created for this chronicle")),
    m(l("五通神", "五通神", "Five Powers"), l("用捷徑實現所求，再把被省去的代價移到無辜者身上。", "用捷径实现所求，再把被省去的代价移到无辜者身上。", "Grants desires by shortcut, transferring every avoided cost onto the innocent."), "tradition", l("五通信仰與志怪傳統；代價機制為本作設定", "五通信仰与志怪传统；代价机制为本作设定", "Five Powers traditions; cost mechanic is original")),
    m(l("金剛禪邪法", "金刚禅邪法", "Corrupted Vajra Method"), l("不是宗派，而是一套把修行者姓名逐筆剝離的禁法。", "不是宗派，而是一套把修行者姓名逐笔剥离的禁法。", "Not a school, but a forbidden method stripping a practitioner's name stroke by stroke."), "story", l("虛構邪法；不指涉真實佛教宗派", "虚构邪法；不指涉真实佛教宗派", "Fictional method; not a real Buddhist school")),
    m(l("祇陀太子", "祇陀太子", "Prince Jeta"), l("借用古老名字的假身；真正身份是外道線的核心疑案。", "借用古老名字的假身；真正身份是外道线的核心疑案。", "A false body borrowing an ancient name; its identity is the central mystery."), "story", l("借名式原創角色；與佛典人物不作同一認定", "借名式原创角色；与佛典人物不作同一认定", "Original name-borrowing figure; not identified with the Buddhist person")),
  ] },
  { id: "foreign", side: "shadow", image: 10, title: l("異域暗面", "异域暗面", "Foreign Shadows"), subtitle: l("海路、北冥與未被中土圖譜收納的神名", "海路、北冥与未被中土图谱收纳的神名", "Sea routes, northern darkness and divine names beyond the central atlas"), members: [
    m(l("八幡大菩薩", "八幡大菩萨", "Hachiman Daibosatsu"), l("本作不把信仰等同侵略，而寫人如何借神名行事。", "本作不把信仰等同侵略，而写人如何借神名行事。", "The story does not equate faith with invasion, but asks how people act under sacred names."), "tradition", l("日本八幡信仰；海戰關係為文學演繹", "日本八幡信仰；海战关系为文学演绎", "Japanese Hachiman tradition; naval-war relation is literary")),
    m(l("玄冥", "玄冥", "Xuanming"), l("北方冬水之名，在本作化為封住海下舊門的寒神。", "北方冬水之名，在本作化为封住海下旧门的寒神。", "A name of northern winter waters, shaped here as the cold divinity sealing a door beneath the sea."), "tradition", l("古籍神名與方位觀念；守門職司為本作演繹", "古籍神名与方位观念；守门职司为本作演绎", "Classical divine name; gatekeeping office adapted")),
    m(l("燭龍", "烛龙", "Torch Dragon"), l("一目為晝、一闔為夜；裂隙讓祂看見不屬於任何年代的第十三個時辰。", "一目为昼、一阖为夜；裂隙让祂看见不属于任何年代的第十三个时辰。", "Its gaze makes day and its closing eye makes night; the breach reveals a thirteenth hour."), "tradition", l("《山海經》等燭龍傳統；第十三時為本作設定", "《山海经》等烛龙传统；第十三时为本作设定", "Torch Dragon traditions including Shanhaijing; thirteenth hour is original")),
    m(l("混沌", "混沌", "Hundun"), l("不是最終魔王，而是一切分類失效後留下的狀態。", "不是最终魔王，而是一切分类失效后留下的状态。", "Not a final villain, but the condition left when every distinction fails."), "tradition", l("古籍混沌母題；終局意義為本作重構", "古籍混沌母题；终局意义为本作重构", "Classical Hundun motif; end-state meaning reconstructed")),
  ] },
];

export const CHRONICLES = [
  { no: "一", title: l("空頁", "空页", "The Blank Page"), lead: l("黃泉沒有漏記一個亡魂，而是三界同時失去對他的記憶。", "黄泉没有漏记一个亡魂，而是三界同时失去对他的记忆。", "The underworld has not misplaced a soul; all three realms have forgotten the person at once."), text: l("后土封存死簿，九天監生司卻在生籍中發現相同空白。第一個謎不是『誰死了』，而是『誰正要出生』。", "后土封存死簿，九天监生司却在生籍中发现相同空白。第一个谜不是“谁死了”，而是“谁正要出生”。", "Houtu seals the death ledger, while the birth bureau discovers the same blank. The first mystery is not who died, but who is about to be born.") },
  { no: "二", title: l("搜山", "搜山", "Search the Mountain"), lead: l("二郎神追查越界異獸，足印卻在廢壇前轉向黃泉。", "二郎神追查越界异兽，足印却在废坛前转向黄泉。", "Erlang tracks a border-crossing beast, but its prints turn toward Yellow Springs at a ruined altar."), text: l("逃亡者不是要侵入人間，而是想把一個被抹去的名字送回家。是否繼續奉令，成為正序內部第一道裂痕。", "逃亡者不是要侵入人间，而是想把一个被抹去的名字送回家。是否继续奉令，成为正序内部第一道裂痕。", "The fugitive is not invading the living world, but carrying an erased name home. Obedience becomes the first rupture within order.") },
  { no: "三", title: l("海上無燈", "海上无灯", "No Lanterns at Sea"), lead: l("東南海隅三夜不見漁火，霧裡卻有亡魂敲船。", "东南海隅三夜不见渔火，雾里却有亡魂敲船。", "For three nights no fishing lights appear on the coast, yet the dead knock on hulls from the mist."), text: l("真正開門的不是異域神祇，而是有人用兩地亡者的名字做了同一把鑰匙。", "真正开门的不是异域神祇，而是有人用两地亡者的名字做了同一把钥匙。", "No foreign god opened the gate; someone forged a single key from the names of both lands' dead.") },
  { no: "四", title: l("第十三時", "第十三时", "The Thirteenth Hour"), lead: l("燭龍睜眼為晝、闔眼為夜——唯有裂隙中的一個時辰不受其管轄。", "烛龙睁眼为昼、阖眼为夜——唯有裂隙中的一个时辰不受其管辖。", "The Torch Dragon opens its eye for day and closes it for night—except for one hour inside the breach."), text: l("五星與二十八宿開始錯移，名冊空白連成一幅從未存在的星圖。裂隙原是被秩序捨棄之物共同形成的影子。", "五星与二十八宿开始错移，名册空白连成一幅从未存在的星图。裂隙原是被秩序舍弃之物共同形成的影子。", "Planets and mansions drift while blank pages form an impossible star chart. The breach is the shared shadow of all that order discarded.") },
];

export const OBSERVATION_CHAPTERS = [
  {
    no: "一",
    title: l("聽其言，也觀其行", "听其言，也观其行", "Hear the words, then watch the pattern"),
    lead: l("所謂「聞其頻」，更可靠的理解不是讀取神秘頻率，而是聽見語言背後的動機、情緒與長期一致性。", "所谓“闻其频”，更可靠的理解不是读取神秘频率，而是听见语言背后的动机、情绪与长期一致性。", "What spiritual language calls a person's “frequency” is better treated as motive, emotional tone and long-term consistency rather than a measurable mystical signal."),
    text: l("一句「我是為你好」可能是真心，也可能帶著控制。不要只憑一句話定性一個人；看他是否尊重你的選擇、承擔自己的責任，以及言語和行為能否長期對得上。", "一句“我是为你好”可能是真心，也可能带着控制。不要只凭一句话定性一个人；看他是否尊重你的选择、承担自己的责任，以及言语和行为能否长期对得上。", "“I am doing this for your own good” may be care or control. Do not decide from one sentence alone. Watch whether the person respects choice, carries responsibility and behaves consistently over time.")
  },
  {
    no: "二",
    title: l("不迷頭銜，察其相處", "不迷头衔，察其相处", "Look past status to how someone relates"),
    lead: l("職位、財富與名片是社會資訊，不是人格證明。", "职位、财富与名片是社会信息，不是人格证明。", "Titles, wealth and status are social information, not proof of character."),
    text: l("與其把「磁場」當成客觀能量，不如看一個人是否穩定、誠實、有邊界感，如何對待弱者與沒有利益關係的人。真正值得信任的訊號，通常藏在反覆出現的小事裡。", "与其把“磁场”当成客观能量，不如看一个人是否稳定、诚实、有边界感，如何对待弱者与没有利益关系的人。真正值得信任的信号，通常藏在反复出现的小事里。", "Instead of treating an “energy field” as an objective fact, look for stability, honesty, boundaries and how someone treats people from whom they have nothing to gain. Reliable signals usually live in repeated small acts.")
  },
  {
    no: "三",
    title: l("相信直覺，也讓事實校正", "相信直觉，也让事实校正", "Let intuition alert you, then let evidence correct it"),
    lead: l("直覺可以是第一個警鈴，但不應取代判斷。", "直觉可以是第一个警铃，但不应取代判断。", "Intuition can be the first alert, but it should not replace judgement."),
    text: l("我們會在很短時間內讀到語氣、表情、節奏與矛盾，但直覺也會受過去經驗、偏見和當下情緒影響。五分鐘可以提醒你慢下來，不能證明你已經看透一個人。", "我们会在很短时间内读到语气、表情、节奏与矛盾，但直觉也会受过去经验、偏见和当下情绪影响。五分钟可以提醒你慢下来，不能证明你已经看透一个人。", "We can notice tone, expression, rhythm and contradiction very quickly, but intuition is also shaped by memory, bias and mood. Five minutes can tell you to slow down; it cannot prove you have seen through a person.")
  },
  {
    no: "四",
    title: l("所謂升維，是看見更多層", "所谓升维，是看见更多层", "Higher perspective means seeing more layers"),
    lead: l("三維、四維、五維在這裡只作認知隱喻，不是可證明的靈性等級。", "三维、四维、五维在这里只作认知隐喻，不是可证明的灵性等级。", "Here, 3D, 4D and 5D are metaphors for perspective, not verified spiritual ranks."),
    text: l("只看事件，是第一層；再看時間、因果與關係動力，是第二層；再看不同選擇、代價與可能路徑，是第三層。真正的提升不是判斷得更快，而是同時容納更多證據，不再被單一視角綁住。", "只看事件，是第一层；再看时间、因果与关系动力，是第二层；再看不同选择、代价与可能路径，是第三层。真正的提升不是判断得更快，而是同时容纳更多证据，不再被单一视角绑住。", "One layer sees the event. Another sees time, causes and relationship dynamics. A further layer sees alternative choices, costs and possible paths. Growth is not faster judgement; it is the ability to hold more evidence without being trapped by one viewpoint.")
  },
  {
    no: "五",
    title: l("分辨之後，仍能接納", "分辨之后，仍能接纳", "Discernment without contempt"),
    lead: l("看清差異，不等於把人分成高頻與低頻。", "看清差异，不等于把人分成高频与低频。", "Seeing differences does not require ranking people as high- or low-frequency."),
    text: l("成熟的分辨，是知道誰適合靠近、誰需要保持距離，同時不把不適合自己的人貶低成較低等的人。允許別人走自己的路，也允許自己退出消耗。", "成熟的分辨，是知道谁适合靠近、谁需要保持距离，同时不把不适合自己的人贬低成较低等的人。允许别人走自己的路，也允许自己退出消耗。", "Mature discernment means knowing who can come closer and where distance is needed, without turning incompatibility into a hierarchy of human worth. Let others walk their path, and let yourself leave what repeatedly drains you.")
  },
] as const;

export const ARTWORKS = [
  { file: "01-skeleton-puppet.png", title: l("骨偶問名", "骨偶问名", "The Skeleton Asks Its Name"), source: l("李嵩《骷髏幻戲圖》", "李嵩《骷髅幻戏图》", "Li Song, Skeleton Fantasy Show"), note: l("保留生死同場、傀儡與旁觀者的核心關係，重畫為幽明序章。", "保留生死同场、傀儡与旁观者的核心关系，重画为幽明序章。", "Recomposes life, death, puppet and witness as the chronicle's prologue.") },
  { file: "02-t-shaped-silk.png", title: l("三界帛書", "三界帛书", "Banner of Three Realms"), source: l("馬王堆 T 形帛畫", "马王堆 T 形帛画", "Mawangdui T-shaped silk banner"), note: l("沿用天、人、地縱向分層的觀看方式，改寫為本作宇宙圖。", "沿用天、人、地纵向分层的观看方式，改写为本作宇宙图。", "Adapts its vertical heaven–human–earth reading into this world's cosmogram.") },
  { file: "03-celestial-court.png", title: l("諸天朝序", "诸天朝序", "Procession of Celestial Order"), source: l("永樂宮《朝元圖》", "永乐宫《朝元图》", "Yongle Palace, Chaoyuan Tu"), note: l("取法神班朝列與雲氣節奏，人物、旌幡與隊列皆重新設計。", "取法神班朝列与云气节奏，人物、旌幡与队列皆重新设计。", "Draws on ranked divine processions and cloud rhythm; figures and banners are newly designed.") },
  { file: "04-guan-yu-captive.png", title: l("封疆擒將", "封疆擒将", "The Warden Captures a General"), source: l("商喜《關羽擒將圖》", "商喜《关羽擒将图》", "Shang Xi, Guan Yu Captures a General"), note: l("借鑑主將端坐與俘將受審的三角構圖，改為搜山封疆場面。", "借鉴主将端坐与俘将受审的三角构图，改为搜山封疆场面。", "Reworks the seated commander and captive triangle into a mountain-warden scene.") },
  { file: "05-ten-kings.png", title: l("幽司停判", "幽司停判", "Judgment Suspended"), source: l("陸信忠《十王圖》", "陆信忠《十王图》", "Lu Xinzhong, Ten Kings of Hell"), note: l("延續公堂、案牘與鏡鑑意象，描繪十殿因矛盾前世而停審。", "延续公堂、案牍与镜鉴意象，描绘十殿因矛盾前世而停审。", "Carries court, ledger and mirror imagery into a judgment halted by contradictory lives.") },
  { file: "06-nine-dragons.png", title: l("九龍裂水", "九龙裂水", "Nine Dragons Divide the Waters"), source: l("陳容《九龍圖》", "陈容《九龙图》", "Chen Rong, Nine Dragons"), note: l("以墨龍、雲水和飛白為骨，重新安排九龍圍繞裂隙的動勢。", "以墨龙、云水和飞白为骨，重新安排九龙围绕裂隙的动势。", "Uses ink dragons, vapor and flying-white energy in a new nine-dragon composition.") },
  { file: "07-shanhaijing-atlas.png", title: l("災異山海", "灾异山海", "Calamities of Mountain and Sea"), source: l("明刻本《山海經圖》", "明刻本《山海经图》", "Ming woodblock Shanhaijing illustrations"), note: l("取法異獸並置與圖譜式觀看，以礦物色重構上古災異群像。", "取法异兽并置与图谱式观看，以矿物色重构上古灾异群像。", "Adapts catalogued strange beasts into a mineral-pigment assembly of calamities.") },
  { file: "08-ghostly-amusements.png", title: l("雨中鬼趣", "雨中鬼趣", "Ghostly Amusements in Rain"), source: l("羅聘《鬼趣圖》", "罗聘《鬼趣图》", "Luo Ping, Ghost Amusement Scrolls"), note: l("保留淡墨、空境與似真似幻的人影，重畫為無名魂的相逢。", "保留淡墨、空境与似真似幻的人影，重画为无名魂的相逢。", "Keeps pale ink, emptiness and uncertain figures, reframed as nameless souls.") },
  { file: "09-uncovering-the-bowl.png", title: l("揭缽見天", "揭钵见天", "Lifting the Bowl to Heaven"), source: l("《揭缽圖》母題", "《揭钵图》母题", "The Lifting the Bowl pictorial motif"), note: l("取法高僧、覆缽與空中眾形的張力，改寫為破除假名的儀式。", "取法高僧、覆钵与空中众形的张力，改写为破除假名的仪式。", "Reworks monk, bowl and airborne beings into a rite that breaks false names.") },
  { file: "10-coastal-invasion.png", title: l("海疆無燈", "海疆无灯", "The Unlit Coast"), source: l("《倭寇圖卷》類海防圖像", "《倭寇图卷》类海防图像", "Coastal-defense scroll traditions"), note: l("借鑑長卷式登岸、追逐與海防空間，人物與事件全部另行創作。", "借鉴长卷式登岸、追逐与海防空间，人物与事件全部另行创作。", "Adapts scroll-like landing and coastal space; people and events are newly created.") },
  { file: "11-searching-the-mountain.png", title: l("灌口搜山", "灌口搜山", "Search at Guankou"), source: l("《搜山圖》傳統", "《搜山图》传统", "Searching the Mountain pictorial tradition"), note: l("以二郎、獵隊與山中異類的多層追逐，重構命令與慈悲的衝突。", "以二郎、猎队与山中异类的多层追逐，重构命令与慈悲的冲突。", "Recasts Erlang, hunters and mountain beings as a conflict between command and mercy.") },
  { file: "12-five-planets-28-mansions.png", title: l("星宿錯位", "星宿错位", "Constellations Adrift"), source: l("《五星二十八宿神形圖》傳統", "《五星二十八宿神形图》传统", "Five Planets and Twenty-Eight Mansions tradition"), note: l("取法星神群像與雲中分區，不逐一摹寫原作神形，另構終卷星圖。", "取法星神群像与云中分区，不逐一摹写原作神形，另构终卷星图。", "Adapts astral assemblies without copying individual divine forms.") },
];
