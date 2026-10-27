import { l, type Localized } from "./-mythic-atlas-data";

export type GuailiVolume = { no: string; title: Localized; lead: Localized; text: Localized };
export type ZodiacPath = { earthly: Localized; shadow: Localized; beast: Localized; god: Localized; caveat: Localized };
export type ChronicleEvent = { year: Localized; name: Localized; detail: Localized };

export const GUAILI_COPY = {
  eyebrow: l("昭梧・黃泉紀｜七卷定稿", "昭梧・黄泉纪｜七卷定稿", "ZHAOWU · YELLOW SPRINGS · SEVEN VOLUMES"),
  title: l("怪力亂神", "怪力乱神", "Strange Powers, Unquiet Gods"),
  subtitle: l("黃泉空了，編制崩解。", "黄泉空了，编制崩解。", "The Yellow Springs stand empty. The divine registers fall."),
  intro: l(
    "舊神入籍，山川受封，亡魂逐一登冊。當無名者再無歸處，天庭與幽冥共同建立的秩序終於從第一張廢籍開始崩裂。七卷故事以神話重新審視一個問題：被制度排除的存在，是否就不值得存在？",
    "旧神入籍，山川受封，亡魂逐一登册。当无名者再无归处，天庭与幽冥共同建立的秩序终于从第一张废籍开始崩裂。七卷故事以神话重新审视一个问题：被制度排除的存在，是否就不值得存在？",
    "Old gods were registered, landscapes invested with offices and every soul entered into a ledger. When the unnamed lose their place, the order shared by Heaven and the underworld fractures. Seven volumes ask whether a being denied recognition also loses the right to exist."
  ),
  principle: l("正統不是血統，是編制。", "正统不是血统，是编制。", "Legitimacy is an appointment, not a bloodline."),
  sourceNotice: l(
    "閱讀界線：以下是昭梧的架空敘事與資料導覽，不是中國古代宗教的單一正典。古籍、民俗、現代二創線索與本作改寫須分層；未考定的名號與神獸對應保持待核。",
    "阅读界线：以下是昭梧的架空叙事与资料导览，不是中国古代宗教的单一正典。古籍、民俗、现代二创线索与本作改写须分层；未考定的名号与神兽对应保持待核。",
    "Reading boundary: this is an original fictional reconstruction, not a canonical history of Chinese religion. Classical texts, folk traditions, modern adaptations and inventions are distinguished; uncertain names and beast correspondences remain provisional."
  ),
  volumes: l("七卷原書", "七卷原书", "The Seven Volumes"),
  volumesLead: l("從左道名錄到三界終局，依原始素材保留七卷順序。卷伍、卷陸仍為擴充索引，不冒稱已完成逐條考據。", "从左道名录到三界终局，依原始素材保留七卷顺序。卷伍、卷陆仍为扩充索引，不冒称已完成逐条考据。", "The seven-volume sequence is preserved. Volumes five and six are reference indexes, not falsely presented as fully sourced critical editions."),
  zodiac: l("十二地支・四態雙軌", "十二地支・四态双轨", "Twelve Branches · Four Aspects"),
  zodiacLead: l("每支分凡體、幽冥凶煞、神獸究極、神格／權能映射。四態是敘事對照，不代表原典中的物種進化、神祇親屬或修煉階級。", "每支分凡体、幽冥凶煞、神兽究极、神格／权能映射。四态是叙事对照，不代表原典中的物种进化、神祇亲属或修炼阶级。", "Each branch offers mortal, calamity, mythic-beast and divine-authority aspects. These are literary correspondences, not documented biological or religious evolutions."),
  ordinary: l("凡體", "凡体", "Mortal"),
  shadow: l("幽冥凶煞", "幽冥凶煞", "Underworld calamity"),
  beast: l("神獸究極", "神兽究极", "Mythic beast"),
  god: l("神格／權能", "神格／权能", "Divine authority"),
  modern: l("十二流煞", "十二流煞", "Twelve Currents of Calamity"),
  modernLead: l("沿用原始母本十二名號，不使用其他現代作品的組織名稱；名號只作待考／創作索引，不冒稱均見於古籍。", "沿用原始母本十二名号，不使用其他现代作品的组织名称；名号只作待考／创作索引，不冒称均见于古籍。", "The twelve supplied names are preserved as an attribution-pending creative index; they are not claimed as ancient canonical titles."),
  chronology: l("大裂隙・十年編年", "大裂隙・十年编年", "A Decade of the Great Breach"),
  chronologyLead: l("元年失序、三年災興、五年破封、十年焚籍。八災於此並起，但不代表八位災主已完成考據或定名。", "元年失序、三年灾兴、五年破封、十年焚籍。八灾于此并起，但不代表八位灾主已完成考据或定名。", "Year one: broken registers. Year three: calamities. Year five: failed seals. Year ten: the final burning. The eight phenomena are not eight historically verified deities."),
  eight: l("八災現象（編輯分類）", "八灾现象（编辑分类）", "Eight Calamities · Editorial Classes"),
  ending: l("終卷｜戶口本的灰燼", "终卷｜户口本的灰烬", "Final Volume · Ashes of the Register"),
  ending1: l(
    "神籍將燃的那一夜，並無一位魔王獨自站上天門。二郎仍在搜山，真武諸司各守殘陣；金花聖母以五毒瘴氣護住大孤山的無籍亡魂。那些被稱作妖邪的存在，並沒有共同的意志。",
    "神籍将燃的那一夜，并无一位魔王独自站上天门。二郎仍在搜山，真武诸司各守残阵；金花圣母以五毒瘴气护住大孤山的无籍亡魂。那些被称作妖邪的存在，并没有共同的意志。",
    "On the night the divine registers caught fire, no single demon king stood at Heaven's Gate. Erlang still searched the mountains; Zhenwu's offices guarded their failing seals. The Lady of Golden Flowers sheltered unregistered souls behind her poisonous mists. Those called monsters never shared a single will."
  ),
  ending2: l(
    "十殿聯絡中斷，往生臺無法引渡。天庭的敕令不再能辨認每一個名字，連受封諸神亦失去賴以執法的共同法度。八災並起，神與妖各自求存；香火與編制的舊日交換，終於無法維持。",
    "十殿联络中断，往生台无法引渡。天庭的敕令不再能辨认每一个名字，连受封诸神亦失去赖以执法的共同法度。八灾并起，神与妖各自求存；香火与编制的旧日交换，终于无法维持。",
    "The Ten Courts fell silent and souls could not cross. Heaven's orders no longer recognized every name; even officially invested gods lost the laws by which they acted. Eight calamities gathered. Gods and spirits struggled to endure, and the old exchange between worship and office finally failed."
  ),
  ending3: l(
    "最後一張戶口本化為灰燼。這不是萬物獲救的那一刻：輪迴未復，災厄未止，山河仍在劫後尋路。神話的終結，不是世上沒有了神，而是任何一部名冊都不再有資格決定眾生是否值得存在。",
    "最后一张户口本化为灰烬。这不是万物获救的那一刻：轮回未复，灾厄未止，山河仍在劫后寻路。神话的终结，不是世上没有了神，而是任何一部名册都不再有资格决定众生是否值得存在。",
    "The last register turned to ash. No one had been saved by the fire: rebirth remained broken, calamities endured and the land still searched for a way forward. Myth did not end because gods ceased to exist. It ended because no ledger could any longer decide whether a being deserved to exist."
  ),
  finalQuote: l("黃泉空了，輪迴路斷。人間的故事，才真正開始。", "黄泉空了，轮回路断。人间的故事，才真正开始。", "The Yellow Springs stand empty; rebirth is broken. The human story has only begun."),
  method: l("考據與創作邊界", "考据与创作边界", "Source and Fiction Boundaries"),
  methodText: l(
    "《山海經》與《楚辭》提供部分神靈、異獸意象；《長恨歌》的尋覓與《左傳》的災異記載是文學起點。『楊玉環為兩序系統漏洞』『周禮構成國土結界』『四籍』『十年黃泉曆』『十二地支四態』均為本作設定。原母本中蓐收及『石言，木冰，天作孽也』的引文混接已標記，不能當作原典照引。",
    "《山海经》与《楚辞》提供部分神灵、异兽意象；《长恨歌》的寻觅与《左传》的灾异记载是文学起点。『杨玉环为两序系统漏洞』『周礼构成国土结界』『四籍』『十年黄泉历』『十二地支四态』均为本作设定。原母本中蓐收及『石言，木冰，天作孽也』的引文混接已标记，不能当作原典照引。",
    "The Shanhaijing and Chuci provide some divine and creature motifs; the Changhen ge and Zuozhuan supply literary questions. Yang Guifei as a system anomaly, the ritual barrier, four registers, the ten-year Yellow Springs calendar and zodiac aspects are inventions. Two conflated classical quotations in the supplied source are flagged, not repeated as authentic."
  ),
  unresolved: l("待考項目：東陵聖母與杜姜的同一性、部分五通神下屬、八災完整人格名冊、跨文化神獸與神格對應、現代二創著作權來源。原素材的卷伍／卷陸為摘要，不能虛構缺失的完整數百條條目。", "待考项目：东陵圣母与杜姜的同一性、部分五通神下属、八灾完整人格名册、跨文化神兽与神格对应、现代二创著作权来源。原素材的卷伍／卷陆为摘要，不能虚构缺失的完整数百条条目。", "Pending verification: identities and subordinate names, the complete eight calamity figures, cross-cultural correspondences and modern adaptation rights. Volumes five and six are summaries; missing hundreds of entries must not be invented."),
} as const;

export const GUAILI_VOLUMES: GuailiVolume[] = [
  {no:"壹",title:l("左道旁門與圖像神譜","左道旁门与图像神谱","Images and Unorthodox Lineages"),lead:l("骷髏幻戲、四方絕境與正旁兩序。","骷髅幻戏、四方绝境与正旁两序。","The skeleton puppet, four frontiers and contested authority."),text:l("以李嵩《骷髏幻戲圖》為生死開篇，整理東陵聖母、五通神、十二流煞、金花聖母、青丘狐族、山海災獸、異域信仰，以及五嶽、觀音、真武、二郎與幽冥諸司。這些群體不是單一善惡陣營。","以李嵩《骷髅幻戏图》为生死开篇，整理东陵圣母、五通神、十二流煞、金花圣母、青丘狐族、山海灾兽、异域信仰，以及五岳、观音、真武、二郎与幽冥诸司。这些群体不是单一善恶阵营。","A visual register of Dongling, the Wutong traditions, Twelve Currents, Golden Flowers, fox lineages, anomalous beasts, cross-border worship and the courts of Heaven. They are not a single moral faction.")},
  {no:"貳",title:l("黃泉與輪迴的兩序碰撞","黄泉与轮回的两序碰撞","Two Orders of Death"),lead:l("上窮碧落下黃泉，兩處茫茫皆不見。","上穷碧落下黄泉，两处茫茫皆不见。","The search reaches Heaven and the Yellow Springs."),text:l("本土地下亡魂觀與佛教六道輪迴並置。《長恨歌》的尋覓在本作中被重構為楊玉環失去歸籍的第一個異常；不是原詩所作的制度解釋，也不能將她妖魔化。","本土地下亡魂观与佛教六道轮回并置。《长恨歌》的寻觅在本作中被重构为杨玉环失去归籍的第一个异常；不是原诗所作的制度解释，也不能将她妖魔化。","Different traditions of the afterlife intersect. The search for Yang Guifei is reimagined as the first registration anomaly, a fictional reading of the poem, not its historical conclusion.")},
  {no:"參",title:l("神籍、角色檔案與編制","神籍、角色档案与编制","Registers and Character Dossiers"),lead:l("一人一籍，一神一權；沒有名字者無法歸檔。","一人一籍，一神一权；没有名字者无法归档。","An office for every god, a ledger for every soul."),text:l("四層資訊各自記錄：可考古籍、民俗流變、現代二創線索與昭梧原創。金花聖母守護無籍殘魂；祇陀太子不作反派，朗達瑪王不被直接定為魔王，八幡大菩薩不當作邪神。","四层信息各自记录：可考古籍、民俗流变、现代二创线索与昭梧原创。金花圣母守护无籍残魂；祇陀太子不作反派，朗达玛王不被直接定为魔王，八幡大菩萨不当作邪神。","Provenance is separate from invention. Golden Flowers shelters unregistered souls; Jetavana's donor is not a villain, Langdarma is not reduced to a demon and Hachiman is not labelled an evil god.")},
  {no:"肆",title:l("《長恨歌》與第一道大裂隙","《长恨歌》与第一道大裂隙","The First Breach"),lead:l("失蹤並非死亡，而是舊制度無法收納。","失踪并非死亡，而是旧制度无法收纳。","Disappearance is a failure of classification."),text:l("兩個文明對靈魂與死亡的解釋互不完全相容。楊玉環被賦予『兩套制度都不能安置』的小說命運，成為神籍失效的前兆；天庭仍把編外者視作不可記錄之物。","两个文明对灵魂与死亡的解释互不完全相容。杨玉环被赋予『两套制度都不能安置』的小说命运，成为神籍失效的前兆；天庭仍把编外者视作不可记录之物。","Two incompatible systems fail to classify one missing soul. This original narrative turns the incident into a warning of the divine registers' eventual collapse.")},
  {no:"伍",title:l("左道術法・擴充名錄","左道术法・扩充名录","Unorthodox Arts · Reference Index"),lead:l("貓鬼、蠱毒、厭勝、扶乩與走陰。","猫鬼、蛊毒、厌胜、扶乩与走阴。","Spirit rites, curses and border-crossing arts."),text:l("母本列出貓鬼、蠱毒、厭勝、履璧、差神、扶乩、詛咒、調禽、造畜、幻伎、走陰、趕屍、梵杖等擴充方向。本卷目前為索引，不是逐條有出處的完整百科。","母本列出猫鬼、蛊毒、厌胜、履璧、差神、扶乩、诅咒、调禽、造畜、幻伎、走阴、赶尸、梵杖等扩充方向。本卷目前为索引，不是逐条有出处的完整百科。","A working index of thirteen named practices from the owner's source. Individual provenance and folklore remain to be researched; they are not presented as verified ancient entries.")},
  {no:"陸",title:l("正統神譜與官僚機器","正统神谱与官僚机器","The Bureaucracy of Heaven"),lead:l("敕封、香火、官署與搜山執法。","敕封、香火、官署与搜山执法。","Investiture, devotion and coercive authority."),text:l("五嶽七十五司、真武伏魔院六雷八煞、二郎灌口草頭神與十殿等，構成敘事中的官僚對照。具體數目、隸屬與跨朝代機構不得一概視為古代通行神譜；本卷目前亦為考證待補索引。","五岳七十五司、真武伏魔院六雷八煞、二郎灌口草头神与十殿等，构成叙事中的官僚对照。具体数目、隶属与跨朝代机构不得一概视为古代通行神谱；本卷目前亦为考证待补索引。","The Five Peaks, Zhenwu, Erlang and the Ten Courts illustrate institutional mythmaking. Numbers and chains of command differ by tradition and require specific sourcing; this volume remains a reference index.")},
  {no:"柒",title:l("災異編年・八災並起","灾异编年・八灾并起","Chronicle of Eight Calamities"),lead:l("元年失籍，十年焚籍；黃泉未復。","元年失籍，十年焚籍；黄泉未复。","Year one loses the records; year ten burns them."),text:l("亥月彘瘟、子月骨噬、酉月血雞與黑煞業火麟等災相推進大裂隙。黃泉曆十年，東皇舊檔成灰，玉皇天庭失去共同號令。沒有救世主；焚籍之後輪迴尚未修復，這是本書保留的黑暗終局。","亥月彘瘟、子月骨噬、酉月血鸡与黑煞业火麟等灾相推进大裂隙。黄泉历十年，东皇旧档成灰，玉皇天庭失去共同号令。没有救世主；焚籍之后轮回尚未修复，这是本书保留的黑暗终局。","Calamities hasten the breach. By year ten the celestial registers burn and Heaven loses its shared authority. No saviour repairs rebirth; the deliberately unresolved ending remains.")},
];

export const GUAILI_ZODIAC: ZodiacPath[] = [
 {earthly:l("子・鼠","子・鼠","Zi · Rat"),shadow:l("子月・骨噬","子月・骨噬","Bone Gnawer"),beast:l("吐寶鼠／吐寶獴","吐宝鼠／吐宝獴","Treasure Mongoose (rat iconography)"),god:l("虛日鼠","虚日鼠","Xu Sun Rat"),caveat:l("吐寶獴在佛教圖像中多為獴，非鼠類血統。","吐宝獴在佛教图像中多为獴，非鼠类血统。","The treasure mongoose is not biologically a rat.")},
 {earthly:l("丑・牛","丑・牛","Chou · Ox"),shadow:l("牛煞瘟瘴","牛煞瘟瘴","Ox Plague"),beast:l("夔牛","夔牛","Kui Thunder Beast"),god:l("平天大聖","平天大圣","Great Sage Equal to Heaven"),caveat:l("平天大聖為後世小說中的牛魔王稱號。","平天大圣为后世小说中的牛魔王称号。","A later literary title associated with the Bull Demon King.")},
 {earthly:l("寅・虎","寅・虎","Yin · Tiger"),shadow:l("虎嘯倀鬼","虎啸伥鬼","Tiger's Ghosts"),beast:l("監兵白虎","监兵白虎","White Tiger"),god:l("陸吾","陆吾","Luwu"),caveat:l("陸吾虎身人面，此處是崑崙權能映射。","陆吾虎身人面，此处是昆仑权能映射。","Luwu is a Kunlun authority association, not a tiger's descendant.")},
 {earthly:l("卯・兔","卯・兔","Mao · Rabbit"),shadow:l("玉兔心魔","玉兔心魔","Moon Rabbit Delusion"),beast:l("訛獸","讹兽","Yanshou / Deceptive Beast"),god:l("太陰玉兔","太阴玉兔","Lunar Rabbit"),caveat:l("訛獸與玉兔不是同一神獸的原典演化。","讹兽与玉兔不是同一神兽的原典演化。","The deceiving beast and Moon Rabbit are separate motifs.")},
 {earthly:l("辰・龍","辰・龙","Chen · Dragon"),shadow:l("屍龍旱魃","尸龙旱魃","Corpse Dragon / Drought"),beast:l("應龍","应龙","Yinglong"),god:l("燭龍","烛龙","Torch Dragon"),caveat:l("燭龍是時序神靈，不是應龍的終階形態。","烛龙是时序神灵，不是应龙的终阶形态。","The Torch Dragon is a distinct deity, not Yinglong's final stage.")},
 {earthly:l("巳・蛇","巳・蛇","Si · Snake"),shadow:l("蛇魅劇毒","蛇魅剧毒","Venomous Serpent"),beast:l("騰蛇","腾蛇","Flying Serpent"),god:l("女媧","女娲","Nüwa · Creation"),caveat:l("女媧以人首蛇身形象作象徵映射，非蛇類進化。","女娲以人首蛇身形象作象征映射，非蛇类进化。","Nüwa's serpentine iconography is symbolic, never a snake evolution.")},
 {earthly:l("午・馬","午・马","Wu · Horse"),shadow:l("熾馬焦土","炽马焦土","Scorched Horse"),beast:l("八駿／吉量","八骏／吉量","Eight Steeds / Jiliang"),god:l("河圖龍馬","河图龙马","River Chart Dragon-Horse"),caveat:l("原母本把吉量置於未羊；《山海經》稱其為文馬，故校訂至午。","原母本把吉量置于未羊；《山海经》称其为文马，故校订至午。","Jiliang was under Sheep in the supplied draft; its text describes a horse.")},
 {earthly:l("未・羊","未・羊","Wei · Sheep"),shadow:l("羊骨邪飢荒","羊骨邪饥荒","Bone Famine"),beast:l("羬羊","羬羊","Xianyang"),god:l("獬豸・辨邪法度","獬豸・辨邪法度","Xiezhi · Judgement"),caveat:l("獬豸也有牛形記載；配予未羊是本作形貌與法度的映射，非古籍固定地支。","獬豸也有牛形记载；配予未羊是本作形貌与法度的映射，非古籍固定地支。","Xiezhi also has ox-like depictions; this Wei association is an original symbolic placement.")},
 {earthly:l("申・猴","申・猴","Shen · Monkey"),shadow:l("石猴煞","石猴煞","Stone Monkey Wrath"),beast:l("無支祁","无支祁","Wuzhiqi"),god:l("鬥戰勝佛","斗战胜佛","Victorious Fighting Buddha"),caveat:l("鬥戰勝佛為小說敘事中的果位，不是所有猴靈的終點。","斗战胜佛为小说叙事中的果位，不是所有猴灵的终点。","A literary enlightenment title, not a species-wide end state.")},
 {earthly:l("酉・雞","酉・鸡","You · Rooster"),shadow:l("血雞啼血","血鸡啼血","Blood Rooster"),beast:l("重明鳥","重明鸟","Chongming Bird"),god:l("鳳凰","凤凰","Phoenix · Five Virtues"),caveat:l("重明鳥、鳳凰為不同祥禽；此處只映射德性。","重明鸟、凤凰为不同祥禽；此处只映射德性。","Separate auspicious birds linked by symbolism, not lineage.")},
 {earthly:l("戌・狗","戌・狗","Xu · Dog"),shadow:l("犬噬吞月","犬噬吞月","Moon-Devouring Hound"),beast:l("哮天犬","哮天犬","Xiaotian Hound"),god:l("麒麟・護界守誓","麒麟・护界守誓","Qilin · Oathbound Guardian"),caveat:l("戌狗與麒麟是本作的仁德守護象徵配對；古籍無犬族演化為麒麟的依據。","戌狗与麒麟是本作的仁德守护象征配对；古籍无犬族演化为麒麟的依据。","The dog–qilin pairing is original symbolism, not a documented lineage.")},
 {earthly:l("亥・豬","亥・猪","Hai · Boar"),shadow:l("彘瘟穢土","彘瘟秽土","Boar Pestilence"),beast:l("當康","当康","Dangkang"),god:l("天蓬元帥","天蓬元帅","Marshal Tianpeng"),caveat:l("天蓬的星神職司與豬形小說角色，須分時代處理。","天蓬的星神职司与猪形小说角色，须分时代处理。","Astral marshal and pig-form literary figure come from different layers.")},
];

export const GUAILI_TWELVE = ["同爐","儀光","祝骨","強郎","文卿","退奇","銅聾","耆耆","赤伯","東僧","天賊","是誰"] as const;
export const GUAILI_ARTS = ["貓鬼","蠱毒","厭勝","履璧","差神","扶乩","詛咒","調禽","造畜","幻伎","走陰","趕屍","梵杖"] as const;
export const GUAILI_HOUSES = [
 l("東陵系：東陵聖母（杜姜身份待考）；獨孤陀、盤三妹、張麗華、嚴道育、呂用之等列名均須各自核對。", "东陵系：东陵圣母（杜姜身份待考）；独孤陀、盘三妹、张丽华、严道育、吕用之等列名均须各自核对。", "Dongling: its identification with Du Jiang, and alleged retainers, all require separate evidence."),
 l("四方絕境（轉述候選）：東長人、南王虺、西赤蟻、北逴龍；不能冒稱四向組合是《楚辭》原文。", "四方绝境（转述候选）：东长人、南王虺、西赤蚁、北逴龙；不能冒称四向组合是《楚辞》原文。", "The four directions—Giant, Wanghui, Red Ant and Long Dragon—are retold motifs, not a verified Chuci quotation."),
 l("五通神與巫妖線索：石將軍、棱睜鬼、兔兒爺、西山蟒、狼毒女、妲己、天狗、鬼車、山魈、木客、妖狐；陣營編組為二創素材。", "五通神与巫妖线索：石将军、棱睁鬼、兔儿爷、西山蟒、狼毒女、妲己、天狗、鬼车、山魈、木客、妖狐；阵营编组为二创素材。", "Wutong and spirit index: Stone General, Tengu, Nine-Headed Bird, mountain sprites, fox spirits and other names; faction membership is adaptation material."),
 l("天帝魔主候選：那育丑琰、巴元丑伯、負天擔石、反山六目、監丑朗馥、橫天擔力；神號及隸屬待考。", "天帝魔主候选：那育丑琰、巴元丑伯、负天担石、反山六目、监丑朗馥、横天担力；神号及隶属待考。", "Demon-lord group: Nayu Chouyan and five supplied subordinate titles remain attribution-pending."),
 l("山海異獸：狴犴、窮奇、檮杌、饕餮；妖麟角端、素冥、炎駒、獨狐；妖鳳鷫鸘、發明、焦明、幽昌。", "山海异兽：狴犴、穷奇、梼杌、饕餮；妖麟角端、素冥、炎驹、独狐；妖凤鹔鹴、发明、焦明、幽昌。", "Mountain and Sea index: Bian, Qiongqi, Taowu, Taotie and the submitted strange qilin and phoenix-like titles."),
 l("自然精怪：虎倀、雄王（獼猴國）、鼠王；雁門老白狐聖姑、青丘九尾與軒轅墳狐族。", "自然精怪：虎伥、雄王（猕猴国）、鼠王；雁门老白狐圣姑、青丘九尾与轩辕坟狐族。", "Wild spirits include tiger ghosts, a monkey king, a rat king and fox groups associated with Yanmen, Qingqiu and Xuanyuan."),
 l("大孤山守界：金花聖母、血結魔君、骷髏鬼王及蜈蚣、蛇、蠍、蛤蚧、蟾蜍；金花護魂是昭梧原創，不是民俗原典。", "大孤山守界：金花圣母、血结魔君、骷髅鬼王及蜈蚣、蛇、蝎、蛤蚧、蟾蜍；金花护魂是昭梧原创，不是民俗原典。", "Golden Flowers, Blood-Knot Lord, Skeleton King and five venomous beings guard the mountain; her sheltering of souls is an original plot."),
 l("古神與海疆：玄冥、燭龍、混沌、十六路混沌祖神；八幡大菩薩、大黑天、熊野權現等跨文化信仰須獨立考證。", "古神与海疆：玄冥、烛龙、混沌、十六路混沌祖神；八幡大菩萨、大黑天、熊野权现等跨文化信仰须独立考证。", "Xuanming, Torch Dragon and chaos traditions appear beside Hachiman, Daikokuten and Kumano; cross-cultural traditions are not demonized."),
 l("外道與歷史分層：波旬、朗達瑪王、祇陀太子、外道六師、金剛禪；其中歷史人物與佛教人物不能被統稱為反派。", "外道与历史分层：波旬、朗达玛王、祇陀太子、外道六师、金刚禅；其中历史人物与佛教人物不能被统称为反派。", "Mara, Langdarma, Prince Jeta and other traditions require individual historical treatment rather than blanket villain roles."),
 l("正統機構：五嶽諸司、觀音相關護法系統、灌口梅山七聖與草頭神、真武伏魔院、九天監生司及十殿；職司和人數跨時代待考。", "正统机构：五岳诸司、观音相关护法系统、灌口梅山七圣与草头神、真武伏魔院、九天监生司及十殿；职司和人数跨时代待考。", "The Five Peaks, Guanyin's protectors, Erlang's forces, Zhenwu, the natal-protection offices and Ten Courts form the institutional study; counts and titles vary."),
] as const;
export const GUAILI_YEARS: ChronicleEvent[] = [
 {year:l("元年","元年","Year 1"),name:l("黃泉空懸","黄泉空悬","The Empty Register"),detail:l("往生臺前滯留亡魂超過三百萬；十殿判牘失聯，黃泉無法再為無籍者安排歸處。","往生台前滞留亡魂超过三百万；十殿判牍失联，黄泉无法再为无籍者安排归处。","Millions wait at the crossing. The Ten Courts fall silent, unable to assign the unregistered a destination.")},
 {year:l("三年","三年","Year 3"),name:l("五毒八災並起","五毒八灾并起","Calamities Unbound"),detail:l("亥月彘瘟與子月骨噬破界，酉月血雞使井水泛赤。十二流煞活動，人間搜山與伏魔諸司疲於奔命。","亥月彘瘟与子月骨噬破界，酉月血鸡使井水泛赤。十二流煞活动，人间搜山与伏魔诸司疲于奔命。","Boar pestilence, Bone Gnawer and Blood Rooster emerge as the divine enforcers struggle to keep the peace.")},
 {year:l("五年","五年","Year 5"),name:l("禮崩與破封","礼崩与破封","Seals Fail"),detail:l("周禮結界在小說設定中失去效力；《搜山圖》現裂、黑煞業火麟破封，伏魔院濁氣倒灌。金花聖母仍守護無籍殘魂。","周礼结界在小说设定中失去效力；《搜山图》现裂、黑煞业火麟破封，伏魔院浊气倒灌。金花圣母仍守护无籍残魂。","Ritual barriers fail, the Black-Fire Qilin escapes and the demon-subduing courts are breached. Golden Flowers still shelters the unnamed.")},
 {year:l("十年","十年","Year 10"),name:l("神籍焚毀","神籍焚毁","Ashes of Heaven"),detail:l("東皇舊檔成灰、玉皇號令失效。舊編制瓦解，八災並未立刻消失，輪迴也沒有自動恢復；全書在未獲救的三界中結束。","东皇旧档成灰、玉皇号令失效。旧编制瓦解，八灾并未立刻消失，轮回也没有自动恢复；全书在未获救的三界中结束。","Heaven's registers burn and authority collapses. The calamities persist and rebirth remains broken; the story ends without a miraculous rescue.")},
];
export const GUAILI_EIGHT = [
 l("疫｜瘟瘴與傳染","疫｜瘟瘴与传染","Pestilence"),l("荒｜饑饉與失所","荒｜饥馑与失所","Famine"),
 l("旱｜旱魃與枯竭","旱｜旱魃与枯竭","Drought"),l("洪｜共工與相柳水患意象","洪｜共工与相柳水患意象","Flood"),
 l("焚｜業火與妖麟","焚｜业火与妖麟","Conflagration"),l("兵｜山河兵亂","兵｜山河兵乱","War"),
 l("魘｜幽冥侵夢","魇｜幽冥侵梦","Nightmare"),l("裂｜三界法則崩離","裂｜三界法则崩离","Rupture"),
] as const;
