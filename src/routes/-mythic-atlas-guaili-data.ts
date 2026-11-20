import { l, type Localized } from "./-mythic-atlas-data";

export type GuailiVolume = { no: string; title: Localized; lead: Localized; text: Localized };
export type GuailiContinuation = { no: string; title: Localized; lead: Localized; text: Localized };
export type ZodiacPath = { earthly: Localized; shadow: Localized; beast: Localized; god: Localized; caveat: Localized };
export type ChronicleEvent = { year: Localized; name: Localized; detail: Localized };

export const GUAILI_COPY = {
  eyebrow: l("昭梧・幽明萬象錄｜七卷定稿", "昭梧・幽明万象录｜七卷定稿", "ZHAOWU · HIDDEN & MANIFEST · SEVEN VOLUMES"),
  title: l("三界異聞錄", "三界异闻录", "Tales of the Three Realms"),
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

// The second part follows narrative order: volumes 8–27, then the afterword.
// Volume 14 introduces a damaged fragment; volume 27 completes the fictional art.
export const GUAILI_PART_TWO: GuailiContinuation[] = [
  {
    no: "8",
    title: l("天條改制——靈炁收割令", "天条改制——灵炁收割令", "The New Decree"),
    lead: l("香火斷供後，天庭改以靈炁續命", "香火断供后，天庭改以灵炁续命", "Heaven turns to vital breath"),
    text: l("黃泉斷流後，天庭各部爭奪殘存權限。東皇太一舊署提出以靈炁替代香火的臨時法令，鎮魔司奉命下界抽取山川與眾生之炁。這不是三界一致承認的新天條，而是一場權力拉鋸，為後續異獸遭獵、地方勢力受雇立下制度背景。", "黄泉断流后，天庭各部争夺残存权限。东皇太一旧署提出以灵炁替代香火的临时法令，镇魔司奉命下界抽取山川与众生之炁。这不是三界一致承认的新天条，而是一场权力拉锯，为后续异兽遭猎、地方势力受雇立下制度背景。", "After the crossing fails, Heaven's offices compete for what authority remains. The old Eastern Emperor bureau proposes a temporary decree replacing offerings with vital breath and sends the Demon Suppression Office to extract it from living beings and the land. The decree is contested, not a universal law; it sets up the later beast hunts."),
  },
  {
    no: "9",
    title: l("瘟部暴走——十二流煞外泄", "瘟部暴走——十二流煞外泄", "The Twelve Currents Escape"),
    lead: l("抽取靈炁令瘟疫系統失衡", "抽取灵炁令瘟疫系统失衡", "Extraction destabilizes the plague offices"),
    text: l("鎮魔司濫用小說設定中的「天髓靈章」術式，令瘟部失衡。十二流煞從黃泉曆法的封存欄位逃逸，在不同月份引發疫災；鎮魔司一派趁亂販售假解藥。這是故事中的官僚腐敗，不是對真實宗教儀式或醫療的描述。", "镇魔司滥用小说设定中的「天髓灵章」术式，令瘟部失衡。十二流煞从黄泉历法的封存栏位逃逸，在不同月份引发疫灾；镇魔司一派趁乱贩售假解药。这是故事中的官僚腐败，不是对真实宗教仪式或医疗的描述。", "The Demon Suppression Office overuses the fictional marrow-script rite, destabilizing the plague bureau. Twelve Currents escape their sealed calendar entries and spread calamities across the months. A faction sells false cures. This is fictional corruption, not a claim about real religion or medicine."),
  },
  {
    no: "10",
    title: l("末世狂信——借名救世的教團", "末世狂信——借名救世的教团", "A Cult of Borrowed Hope"),
    lead: l("災民在假極樂中尋找出口", "灾民在假极乐中寻找出口", "Refugees seek escape in false paradise"),
    text: l("瘟疫與徵斂使民間失去依靠，一個自立教團借用彌勒未來降世的名號聚眾，以幻境與肉身歡宴招徠信徒。教團把「多欲魔王」等稱號包裝成救贖承諾，天狐聖姑的幻術則是本作角色能力。本卷寫冒名與操控，不把彌勒或佛教信仰本身定為反派。", "瘟疫与征敛使民间失去依靠，一个自立教团借用弥勒未来降世的名号聚众，以幻境与肉身欢宴招徕信徒。教团把「多欲魔王」等称号包装成救赎承诺，天狐圣姑的幻术则是本作角色能力。本卷写冒名与操控，不把弥勒或佛教信仰本身定为反派。", "Plague and extraction leave communities without support. A self-appointed sect gathers followers under a borrowed promise of Maitreya's future arrival, offering illusions and revels as escape. Its leaders turn titles such as Desire-Demon into salesmanship; the fox's glamour is an original ability. The target is impersonation, not Maitreya or Buddhist faith."),
  },
  {
    no: "11",
    title: l("佛國的算盤——阿修羅雇兵", "佛国的算盘——阿修罗雇兵", "The Buddhist Frontier's Bargain"),
    lead: l("平亂之名下，戰士承受代價", "平乱之名下，战士承受代价", "Soldiers bear the cost of intervention"),
    text: l("佛國一支邊境機構以鎮壓流煞、救援災區為名介入，雇用阿修羅戰士迎擊疫煞；後方官僚回收靈炁結晶，前線死傷者卻得不到補償與身份。故事批判的是具體制度，不把如來或佛教教義寫成命令屠害凡人的主使。", "佛国一支边境机构以镇压流煞、救援灾区为名介入，雇用阿修罗战士迎击疫煞；后方官僚回收灵炁结晶，前线死伤者却得不到补偿与身份。故事批判的是具体制度，不把如来或佛教教义写成命令屠害凡人的主使。", "A frontier office of the Buddhist realm intervenes in the name of containing the Currents, hiring asura fighters to face the plagues. Officials collect the vital crystals while the wounded receive neither fair compensation nor standing. The story critiques an institution, not the Buddha or Buddhist doctrine as a command to harm civilians."),
  },
  {
    no: "12",
    title: l("權力外包——西山蟒與五通假敕", "权力外包——西山蟒与五通假敕", "Counterfeit Gods"),
    lead: l("地方邪役借神名勒索村落", "地方邪役借神名勒索村落", "Local enforcers weaponize sacred names"),
    text: l("天庭一派無力維持地面秩序，縱容西山蟒與五通名下的地方勢力承接差事。惡役偽造太一神敕令，以「神婚獻祭」脅迫村落交出孩子煉丹。失職官吏選擇視而不見；責任落在具體施害者，不泛指真武本人或所有五通信眾。", "天庭一派无力维持地面秩序，纵容西山蟒与五通名下的地方势力承接差事。恶役伪造太一神敕令，以「神婚献祭」胁迫村落交出孩子炼丹。失职官吏选择视而不见；责任落在具体施害者，不泛指真武本人或所有五通信众。", "Unable to keep order, one Heavenly faction tolerates local operators associated with the West Mountain Serpent and the Wutong name. They forge Taiyi's decree and coerce villages into surrendering children for alchemy. Negligent officials look away; blame rests on specific perpetrators, not Zhenwu or all Wutong worshippers."),
  },
  {
    no: "13",
    title: l("龍族離心——水脈倒灌與慎郎之亂", "龙族离心——水脉倒灌与慎郎之乱", "The Flooding of the Waterways"),
    lead: l("靈炁枯竭使四海秩序鬆動", "灵炁枯竭使四海秩序松动", "A depleted world unsettles the seas"),
    text: l("長期抽取使江河乾涸、海脈失衡。部分龍族不再替天庭維持水系，底層蛟龍慎郎與螭龍乘亂起事，掀起倒灌並強擄人間血食。主角必須分清求生的抗命者與趁亂掠奪者；這是本作的水患因果，不是對所有龍族的定性。", "长期抽取使江河干涸、海脉失衡。部分龙族不再替天庭维持水系，底层蛟龙慎郎与螭龙乘乱起事，掀起倒灌并强掳人间血食。主角必须分清求生的抗命者与趁乱掠夺者；这是本作的水患因果，不是对所有龙族的定性。", "Extraction dries rivers and unsettles the sea channels. Some dragons withdraw from maintaining Heaven's water system; the lower-ranking flood dragon Shenlang and a chi dragon rebel, driving waters inland and taking humans as prey. The protagonist distinguishes desperate resistance from opportunistic predation. This is fiction, not a judgment on all dragons."),
  },
  {
    no: "14",
    title: l("底層黑夜——六甲神兵與隱地八化殘篇", "底层黑夜——六甲神兵与隐地八化残篇", "A Fragment of the Eight Transformations"),
    lead: l("主角初遇棄兵，只得禁術殘卷", "主角初遇弃兵，只得禁术残卷", "The protagonist finds abandoned soldiers and a fragment"),
    text: l("主角遇見被裁撤的六甲神兵，目睹一支被稱作「過山瑤五百伙子」的架空隊伍以命堵住黃泉裂隙，補給卻遭截留。此名不指現實瑤族社群。主角從殘卷辨出《隱地八化》線索，開始練習但未掌握全術；真正完成八術要到第二十七卷。", "主角遇见被裁撤的六甲神兵，目睹一支被称作「过山瑶五百伙子」的架空队伍以命堵住黄泉裂隙，补给却遭截留。此名不指现实瑶族社群。主角从残卷辨出《隐地八化》线索，开始练习但未掌握全术；真正完成八术要到第二十七卷。", "The protagonist encounters disbanded Six-Jia soldiers and a fictional unit called the Five Hundred Companions of the Crossing Yao, who risk their lives at the breach while supplies are diverted. The name does not refer to a real Yao community. A damaged scroll reveals clues to the Eight Transformations; training begins, but mastery waits until volume 27."),
  },
  {
    no: "15",
    title: l("黑暗降臨——靈幽宮的交易", "黑暗降临——灵幽宫的交易", "The Bargain at Lingyou Palace"),
    lead: l("魔主願牽制天庭，代價是放任裂隙", "魔主愿牵制天庭，代价是放任裂隙", "An offer against Heaven at a price"),
    text: l("靈幽宮的那育丑琰與五名魔帥趁諸方交戰入局。他們欲摧毀三界秩序，提出以魔瘟牽制天庭與佛國，交換主角放任裂隙擴大。主角拒絕盟約，轉而追查楊玉環殘魂與幽泉線索；魔主的立場與作為皆屬小說設定。", "灵幽宫的那育丑琰与五名魔帅趁诸方交战入局。他们欲摧毁三界秩序，提出以魔瘟牵制天庭与佛国，交换主角放任裂隙扩大。主角拒绝盟约，转而追查杨玉环残魂与幽泉线索；魔主的立场与作为皆属小说设定。", "Nayu Chouyan and five captains of Lingyou Palace enter as the factions clash. They offer to unleash a demon plague against Heaven and the Buddhist frontier if the protagonist lets the breach widen. The protagonist refuses and pursues clues to Yang Guifei's remnant soul and the dark spring. Their motives are fictional."),
  },
  {
    no: "16",
    title: l("大孤山暫營——五毒的血肉防線", "大孤山暂营——五毒的血肉防线", "A First Refuge at Mount Dagu"),
    lead: l("金花聖母先立臨時避難所", "金花圣母先立临时避难所", "Golden Flowers opens a provisional shelter"),
    text: l("主角帶無籍難民與染疫傷兵逃至大孤山。金花聖母開出臨時避難所，血結魔君與骷髏鬼王守住山道；五毒隊伍分工巡護與照料。此處只是脆弱的第一個落腳點，第二十六卷再將它擴成較完整的庇護網。", "主角带无籍难民与染疫伤兵逃至大孤山。金花圣母开出临时避难所，血结魔君与骷髅鬼王守住山道；五毒队伍分工巡护与照料。此处只是脆弱的第一个落脚点，第二十六卷再将它扩成较完整的庇护网。", "The protagonist brings unregistered refugees and infected wounded to Mount Dagu. Golden Flowers opens a provisional shelter as two guardians hold the pass and a five-venom team shares patrol and care. It is only a fragile foothold; volume 26 expands it into a wider refuge."),
  },
  {
    no: "17",
    title: l("獵場失控——生態崩潰的前兆", "猎场失控——生态崩溃的前兆", "The Hunting Ground Breaks"),
    lead: l("主角帶疑點逃出天庭，卷18展開", "主角带疑点逃出天庭，卷18展开", "Clues lead into volume 18"),
    text: l("主角潛入天庭異獸獵場，只找到偽鳳檔案遭竄改的疑點，尚未證明真相。獵場暴動後，主角帶虎千歲與幼年妖鳳逃向荒原；飛鈸追兵奉行冒用祇陀太子名號的偽令，不能據此指稱祇陀親自追殺。逃亡揭開第十八卷的生態災難，第十九卷續寫虎千歲，第二十卷才查明偽鳳工程。", "主角潜入天庭异兽猎场，只找到伪凤档案遭篡改的疑点，尚未证明真相。猎场暴动后，主角带虎千岁与幼年妖凤逃向荒原；飞钹追兵奉行冒用祇陀太子名号的伪令，不能据此指称祇陀亲自追杀。逃亡揭开第十八卷的生态灾难，第十九卷续写虎千岁，第二十卷才查明伪凤工程。", "The protagonist enters Heaven's beast preserve and finds signs of altered false-phoenix records, but no proof yet. After the preserve erupts, they flee with Tiger Qiansui and a young phoenix. Cymbal-bearing pursuers follow a forged order invoking Prince Jeta; it does not make him their commander. The escape opens volume 18's ecological crisis; volume 19 follows Qiansui, and volume 20 exposes the false-auspice scheme."),
  },
  {
    no: "18",
    title: l("祥瑞的墮落", "祥瑞的堕落", "When Auspices Fall"),
    lead: l("妖鳳妖麟與靈炁枯竭", "妖凤妖麟与灵炁枯竭", "Strange birds, qilin and a depleted world"),
    text: l(
      "天庭過度攫取山川靈炁，卻把生態異變歸罪於妖獸，藉「降妖」之名繼續收取牠們身上的殘餘力量。鷫鸘、發明、焦明、幽昌，以及角端、素冥、炎駒、獨狐，在此是昭梧小說設定中的受難者與盟友；八災的成因和牠們的分組均非古籍定論。主角循著異獸被獵的痕跡，發現「祥瑞」與「災異」可能只是天庭更改過的檔案標籤。",
      "天庭过度攫取山川灵炁，却把生态异变归罪于妖兽，借「降妖」之名继续收取它们身上的残余力量。鹔鹴、发明、焦明、幽昌，以及角端、素冥、炎驹、独狐，在此是昭梧小说设定中的受难者与盟友；八灾的成因和它们的分组均非古籍定论。主角循着异兽被猎的痕迹，发现「祥瑞」与「灾异」可能只是天庭更改过的档案标签。",
      "Heaven drains the world's vital breath and blames the resulting mutations on beasts, then hunts them for what power remains. The named birds and qilin-like beings become refugees and allies in this fiction; their grouping and the eight calamities are not a classical taxonomy. The protagonist discovers that 'auspice' and 'disaster' may be labels altered in Heaven's records."
    ),
  },
  {
    no: "19",
    title: l("大地的黑幫", "大地的黑帮", "The Earthbound Syndicate"),
    lead: l("虎王領地與求仙的代價", "虎王领地与求仙的代价", "A tiger lord and the price of ascension"),
    text: l(
      "無法入籍的妖修在山中自建秩序。虎王一面與地方官分利，一面收容弱小的精怪；虎千歲忍受蛻牙生角，盼望化龍後取得天庭名額，反被列入煉丹獵物。虎皮女的復仇與虎倀的勞役揭開這個庇護所的另一面：被放逐者也可能複製壓迫。這些人物關係是本作演繹，不是民俗傳說的固定譜系。",
      "无法入籍的妖修在山中自建秩序。虎王一面与地方官分利，一面收容弱小的精怪；虎千岁忍受蜕牙生角，盼望化龙后取得天庭名额，反被列入炼丹猎物。虎皮女的复仇与虎伥的劳役揭开这个庇护所的另一面：被放逐者也可能复制压迫。这些人物关系是本作演绎，不是民俗传说的固定谱系。",
      "Unregistered spirits govern their own mountain refuge. Its tiger lord both bargains with officials and shelters smaller beings. A younger tiger endures a painful transformation in hope of a celestial appointment, only to be marked as alchemical prey. Vengeful spirits and captive ghosts reveal that the excluded can reproduce the oppression they fled. These relationships belong to this story."
    ),
  },
  {
    no: "20",
    title: l("偽鳳與假象", "伪凤与假象", "False Phoenixes"),
    lead: l("把災區裝扮成祥瑞", "把灾区装扮成祥瑞", "A spectacle staged over catastrophe"),
    text: l(
      "天庭向受災之地放出華麗的鳥群，對外稱為祥瑞，對內卻讓牠們承受病氣並回收香火。被稱作「偽鳳」的鸑鷟、定甲等名號在此只作待考的創作線索，不把不同古籍祥禽混成同一物種。主角追查鳥群的去向，才看見一套掩飾第十八卷生態災難的宣傳工程。",
      "天庭向受灾之地放出华丽的鸟群，对外称为祥瑞，对内却让它们承受病气并回收香火。被称作「伪凤」的鸑鷟、定甲等名号在此只作待考的创作线索，不把不同古籍祥禽混成同一物种。主角追查鸟群的去向，才看见一套掩饰第十八卷生态灾难的宣传工程。",
      "Heaven releases ornate birds over stricken districts, calls them auspicious and quietly uses them to absorb disease while collecting offerings. Their names remain provisional creative references, not a unified species from the classics. Following the birds reveals a spectacle designed to conceal the ecological disaster of volume 18."
    ),
  },
  {
    no: "21",
    title: l("萬獸朝蒼", "万兽朝苍", "The Procession of Beasts"),
    lead: l("百官與異獸的鏡像", "百官与异兽的镜像", "A procession that mirrors the court"),
    text: l(
      "天庭閱兵把異獸排成文官、武將、貪官、酷吏與佞臣的隊列。主角在金光背後看見被拔去羽毛、強作祥瑞的幼鳥與虎千歲，遂斬開鎖鏈。獸群奔逃時，儀仗和軍隊一同失序；這場政治寓言以獸形映照官場，並非歷史動物分類。",
      "天庭阅兵把异兽排成文官、武将、贪官、酷吏与佞臣的队列。主角在金光背后看见被拔去羽毛、强作祥瑞的幼鸟与虎千岁，遂斩开锁链。兽群奔逃时，仪仗和军队一同失序；这场政治寓言以兽形映照官场，并非历史动物分类。",
      "Heaven arranges beasts into a parade of ministers, generals, profiteers and enforcers. Behind the glitter, the protagonist finds young creatures mutilated to resemble auspicious signs and breaks their chains. As the procession scatters, the army's authority crumbles with its pageantry. The animal offices are a political allegory."
    ),
  },
  {
    no: "22",
    title: l("佛國疑案", "佛国疑案", "A Case at the Buddhist Frontier"),
    lead: l("借用名號的異端特遣傳聞", "借用名号的异端特遣传闻", "A fictional clandestine unit"),
    text: l(
      "一支自稱奉命維持秩序的隊伍在裂隙邊緣出沒，飛鈸、鐵頭與火氣等稱號是本作的戲劇化角色名。有人把祇陀太子的名字寫進密令，主角卻發現署名與傳聞互相矛盾，不能以此指認歷史或佛教傳統中的祇陀太子，更不能把佛陀與觀音寫成此案的幕後加害者。這卷追問的是借神聖名義行事的偽令與歸責。",
      "一支自称奉命维持秩序的队伍在裂隙边缘出没，飞钹、铁头与火气等称号是本作的戏剧化角色名。有人把祇陀太子的名字写进密令，主角却发现署名与传闻互相矛盾，不能以此指认历史或佛教传统中的祇陀太子，更不能把佛陀与观音写成此案的幕后加害者。这卷追问的是借神圣名义行事的伪令与归责。",
      "A clandestine group claims a sacred mandate at the breach. Its weapon-bearing figures are fictional characters. Orders invoke Prince Jeta, but the signatures contradict the rumours: this does not identify the prince of Buddhist tradition, nor implicate the Buddha or Guanyin. The mystery concerns forged authority and accountability."
    ),
  },
  {
    no: "23",
    title: l("靈幽魔主", "灵幽魔主", "Lord of Lingyou"),
    lead: l("第三方勢力提出的危險交易", "第三方势力提出的危险交易", "A dangerous bargain with a third power"),
    text: l(
      "那育丑琰及五名魔帥據守靈幽宮，不服天庭，也不願收容無籍者。他們許諾牽制天兵，條件卻是放任裂隙繼續擴張。主角不得不衡量：借混亂反抗編制，會否讓亡魂失去最後的歸路？魔主名號與部屬編組沿用待考素材，具體陣營、動機與交易皆為昭梧演繹。",
      "那育丑琰及五名魔帅据守灵幽宫，不服天庭，也不愿收容无籍者。他们许诺牵制天兵，条件却是放任裂隙继续扩张。主角不得不衡量：借混乱反抗编制，会否让亡魂失去最后的归路？魔主名号与部属编组沿用待考素材，具体阵营、动机与交易皆为昭梧演绎。",
      "Nayu Chouyan and five captains defy Heaven but will not shelter the unregistered. They offer to hold back its forces if the breach is left to widen. The protagonist must decide whether resistance through chaos will destroy the souls' last path home. Names remain provisional references; this faction and bargain are original fiction."
    ),
  },
  {
    no: "24",
    title: l("神聖的恐怖", "神圣的恐怖", "Terror in Sacred Dress"),
    lead: l("西山蟒與五通神的假敕", "西山蟒与五通神的假敕", "A serpent's counterfeit decree"),
    text: l(
      "西山蟒藉「神婚」謊稱天命，逼迫村落獻出孩子，石將軍等惡役則假借五通神之名威嚇索取香火。主角毀去假敕並救人，村民卻仍害怕違逆上天而受罰。這是對制度恐懼的架空敘事；五通信仰、東皇太一及原稿借用的人物名號，不能因此被認定曾組成這個犯罪集團。",
      "西山蟒借「神婚」谎称天命，逼迫村落献出孩子，石将军等恶役则假借五通神之名威吓索取香火。主角毁去假敕并救人，村民却仍害怕违逆上天而受罚。这是对制度恐惧的架空叙事；五通信仰、东皇太一及原稿借用的人物名号，不能因此被认定曾组成这个犯罪集团。",
      "A serpent invents a divine marriage decree to demand children from a village. Enforcers exploit the Wutong name to seize offerings. Even after the protagonist destroys the counterfeit order and rescues the children, the villagers fear Heaven's punishment. This is fiction about institutional fear, not a claim about real traditions or historical figures."
    ),
  },
  {
    no: "25",
    title: l("地底的狂潮", "地底的狂潮", "The Tide Beneath"),
    lead: l("鼠王與煉丹廢料", "鼠王与炼丹废料", "The rat king and alchemical waste"),
    text: l(
      "黃泉斷流後，死者無處可歸，鼠群在埋骨地受怨氣與棄置丹渣侵染。鼠王所到之處，鼠妖成群；主角在牠腹中發現天庭煉丹的殘料，循此查到災害源頭。鼠尿增殖與天狗一吠破煞都是此作的怪談機制，不是生物學、醫學或古籍知識。",
      "黄泉断流后，死者无处可归，鼠群在埋骨地受怨气与弃置丹渣侵染。鼠王所到之处，鼠妖成群；主角在它腹中发现天庭炼丹的残料，循此查到灾害源头。鼠尿增殖与天狗一吠破煞都是此作的怪谈机制，不是生物学、医学或古籍知识。",
      "With the crossing broken, the dead have nowhere to go. Rats among the burial grounds are changed by resentment and discarded alchemical residue. Inside the rat king, the protagonist finds waste that leads back to Heaven. The swarm's uncanny reproduction and a hound's power to scatter it are story devices, not biology or ancient doctrine."
    ),
  },
  {
    no: "26",
    title: l("五毒仙班", "五毒仙班", "The Venomous Refuge"),
    lead: l("金花聖母的大孤山庇護所", "金花圣母的大孤山庇护所", "Golden Flowers shelters the abandoned"),
    text: l(
      "此處承接第十六卷的大孤山臨時營地：更多被天庭與陰司遺下的人陸續抵達，金花聖母收容傷者，血結魔君與骷髏鬼王協助守護，脆弱落腳點逐漸成為較完整的庇護網。蜈蚣、蛇虺、蠍、蛤蚧與蟾蜍組成小說中的五毒醫隊：巡護、辨毒、製藥、續命與止痛只是故事分工，不提供真實醫療方法，也不是通行的民俗五毒名單。這處庇護所讓主角看見，崩壞的編制之外仍有人選擇照顧無籍者。",
      "此处承接第十六卷的大孤山临时营地：更多被天庭与阴司遗下的人陆续抵达，金花圣母收容伤者，血结魔君与骷髅鬼王协助守护，脆弱落脚点逐渐成为较完整的庇护网。蜈蚣、蛇虺、蝎、蛤蚧与蟾蜍组成小说中的五毒医队：巡护、辨毒、制药、续命与止痛只是故事分工，不提供真实医疗方法，也不是通行的民俗五毒名单。这处庇护所让主角看见，崩坏的编制之外仍有人选择照顾无籍者。",
      "This continues the provisional camp founded in volume 16: more people abandoned by Heaven and the underworld arrive, and Golden Flowers with the two guardians turns the fragile foothold into a wider refuge. Centipede, serpent, scorpion, gecko and toad form a fictional healing team. Their roles are neither medical advice nor a standard folk list of five venoms. The refuge shows that care can survive beyond the failed registers."
    ),
  },
  {
    no: "27",
    title: l("隱景八化——游走於虛無的暗影行者", "隐景八化——游走于虚无的暗影行者", "The Shadow Walker"),
    lead: l("殘卷至此合一，主角完成八術", "残卷至此合一，主角完成八术", "The fragments unite; the protagonist completes the eight arts"),
    text: l("第二十六卷後，主角合勘殘卷、口訣與實戰線索，才完成小說化的《隱景八化》。藏形匿影、乘虛御空、隱淪飛霄構成潛行與突防；出有入無、解形遁變、飛靈八方被演繹為穿梭、化散與分身；回晨轉玄、隱景舞天則被演繹為短暫回溯與扭曲光景。這些具體效果是本作創作，不等同古籍原義。主角再潛入太一宮，追查並破壞偽鳳工程；飛鈸追兵依第二十二卷揭出的冒名偽令行動，祇陀太子不是幕後主使。", "第二十六卷后，主角合勘残卷、口诀与实战线索，才完成小说化的《隐景八化》。藏形匿影、乘虚御空、隐沦飞霄构成潜行与突防；出有入无、解形遁变、飞灵八方被演绎为穿梭、化散与分身；回晨转玄、隐景舞天则被演绎为短暂回溯与扭曲光景。这些具体效果是本作创作，不等同古籍原义。主角再潜入太一宫，追查并破坏伪凤工程；飞钹追兵依第二十二卷揭出的冒名伪令行动，祇陀太子不是幕后主使。", "After volume 26, the protagonist combines the damaged scroll, oral clues and field experience to complete a fictionalized Eight Transformations. Concealment, flight and swift passage enable stealth; appearing from nowhere, dissolving form and multiplying become fictional traversal, dispersal and doubles; turning the morning back and dancing through hidden light become a brief rewind and warped scenery. These effects are inventions, not claims about the source text. The protagonist returns to Taiyi Palace to disrupt the false-phoenix scheme. The cymbal-bearing pursuers act under the forged order uncovered in volume 22; Prince Jeta is not behind it."),
  },
  {
    no: "終",
    title: l("災異編年・終章補記", "灾异编年・终章补记", "Afterword to the Calamity Chronicle"),
    lead: l("神籍成灰，輪迴仍未修復", "神籍成灰，轮回仍未修复", "The ledgers burn; rebirth is not restored"),
    text: l(
      "元年無籍亡魂滯留，三年五毒八災並起，五年封印破裂；十年神籍焚毀後，天庭失去號令，黃泉卻沒有因此恢復通行。第二部的異獸、村落、山中勢力與庇護所沿同一條裂隙互相牽連。原稿曾將蓐收與「石言、木冰」的句子錯置為古籍原文，此處不沿用那些引文；這條編年是昭梧的小說時間線，不是古史。",
      "元年无籍亡魂滞留，三年五毒八灾并起，五年封印破裂；十年神籍焚毁后，天庭失去号令，黄泉却没有因此恢复通行。第二部的异兽、村落、山中势力与庇护所沿同一条裂隙互相牵连。原稿曾将蓐收与「石言、木冰」的句子错置为古籍原文，此处不沿用那些引文；这条编年是昭梧的小说时间线，不是古史。",
      "Unregistered souls wait in year one; calamities spread in year three; seals fail in year five. In year ten the celestial ledgers burn, yet the crossing remains broken. Beasts, villages, mountain factions and the refuge are bound by that breach. Misattributed classical quotations in the supplied draft are omitted. This chronology is original fiction, not ancient history."
    ),
  },
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
