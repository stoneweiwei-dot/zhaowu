export type CapabilityStatus = "active" | "partial" | "planned" | "research" | "symbolic" | "private" | "fun";
export type CapabilityPriority = "P0" | "P1" | "P2" | "LOW" | "BOUNDARY";
export type LocalizedText = readonly [hant: string, hans: string, en: string];

export type SystemCapability = {
  id: string;
  priority: CapabilityPriority;
  status: CapabilityStatus;
  title: LocalizedText;
  summary: LocalizedText;
  implementation: LocalizedText;
  route?: string;
  evidence: "A/B/C/D governance" | "deterministic + evidence trace" | "independent supporting layer" | "cultural / symbolic" | "research only" | "fun only" | "private archive";
};

export type SystemBoundary = {
  id: string;
  title: LocalizedText;
  rule: LocalizedText;
};

/**
 * Canonical runtime map for the 2026-09-15 system synchronization.
 *
 * Important: this registry records BOTH implemented capabilities and research/planned
 * work. `status` is authoritative; entries marked partial/planned/research MUST NOT
 * be presented as completed calculation engines.
 */
export const SYSTEM_CAPABILITIES: readonly SystemCapability[] = [
  {
    id: "evidence-governance",
    priority: "P0",
    status: "active",
    title: ["全站證據／可信度治理層", "全站证据／可信度治理层", "Evidence & confidence governance"],
    summary: ["所有命理結論都要分清證據等級、反證、資料不足與象徵敘事。", "所有命理结论都要分清证据等级、反证、资料不足与象征叙事。", "Every metaphysics claim must expose evidence class, counter-evidence, missing inputs and symbolic limits."],
    implementation: ["目前的報告都會標明依據強弱與資料缺口；八字主判仍只依子平法一套規則。", "目前的报告都会标明依据强弱与资料缺口；八字主判仍只依子平法一套规则。", "Current reports already show how strong each piece of evidence is and what is missing; the main BaZi reading still follows a single Zi Ping rule set."],
    evidence: "A/B/C/D governance",
  },
  {
    id: "core-variable-lock",
    priority: "P0",
    status: "partial",
    title: ["核心變量鎖定＋矛盾檢測", "核心变量锁定＋矛盾检测", "Core-variable lock & contradiction detection"],
    summary: ["先鎖月令、從化、寒暖燥濕、格局、病、藥與承載，後段不得靜默改口。", "先锁月令、从化、寒暖燥湿、格局、病、药与承载，后段不得静默改口。", "Lock season, transformation, climate, structure, disease/remedy and load-bearing before downstream interpretation."],
    implementation: ["每個判斷階段都會先確認結論，後面的段落不得悄悄改口；我們仍在把更多已確認的結果整理成可檢查的紀錄。", "每个判断阶段都会先确认结论，后面的段落不得悄悄改口；我们仍在把更多已确认的结果整理成可检查的记录。", "Each stage of the reading confirms its conclusion before moving on, and later sections may not quietly change it. We are still turning more of these confirmed results into records that can be checked."],
    evidence: "deterministic + evidence trace",
  },
  {
    id: "vedic-jyotish",
    priority: "P0",
    status: "partial",
    title: ["獨立印度吠陀占星 Jyotish", "独立印度吠陀占星 Jyotish", "Independent Jyotish"],
    summary: ["D1 為根；Bhava、Moon Chart、Dasha、Transit 與專項 Vargas 各自有明確角色。", "D1 为根；Bhava、Moon Chart、Dasha、Transit 与专项 Vargas 各自有明确角色。", "D1 is the root; Bhava, Moon Chart, Dasha, Transit and relevant Vargas each have a distinct role."],
    implementation: ["解讀規則已就位，D60 只在出生時間精確到分鐘時才採用；D1、D9 與大運（Dasha）的完整計算在通過核對前，不會顯示任何推測出來的盤。", "解读规则已就位，D60 只在出生时间精确到分钟时才采用；D1、D9 与大运（Dasha）的完整计算在通过核对前，不会显示任何推测出来的盘。", "The interpretation rules are in place, and D60 is used only when the birth time is accurate to the minute. Until the full D1, D9 and Dasha calculations pass our checks, no estimated chart is shown."],
    route: "/indian-astrology",
    evidence: "independent supporting layer",
  },
  {
    id: "dharma-one-palm",
    priority: "P0",
    status: "partial",
    title: ["達摩一掌經／前世今生文化層", "达摩一掌经／前世今生文化层", "Dharma One-Palm cultural layer"],
    summary: ["四世、星曜、六道與習氣用作文化因果敘事：前世因、今生果、來世願。", "四世、星曜、六道与习气用作文化因果叙事：前世因、今生果、来世愿。", "Four-life, star and six-realm symbolism is used as a cultural karma narrative: past cause, present result, future intention."],
    implementation: ["現行入口保留；D60 不得嵌回此頁。其象徵結論不能冒充已證實的前世歷史。", "现行入口保留；D60 不得嵌回此页。其象征结论不能冒充已证实的前世历史。", "The current route remains; D60 stays out of this page, and symbolic readings never become factual reincarnation claims."],
    route: "/yizhangjing",
    evidence: "cultural / symbolic",
  },
  {
    id: "cross-system-synthesis",
    priority: "P0",
    status: "planned",
    title: ["跨系統綜合報告", "跨系统综合报告", "Cross-system synthesis"],
    summary: ["同一生辰比較八字、紫微、七政、西占、吠陀與一掌經，但只標共同指向、補充、衝突與不可比較。", "同一生辰比较八字、紫微、七政、西占、吠陀与一掌经，但只标共同指向、补充、冲突与不可比较。", "Compare systems from the same birth record using agreement, added signal, conflict and non-comparability — never forced consensus."],
    implementation: ["各系統的專卷已可單獨閱讀；把它們放在一起比較的綜合頁仍在製作中。", "各系统的专卷已可单独阅读；把它们放在一起比较的综合页仍在制作中。", "Each system can already be read on its own; a page that compares them side by side is still being built."],
    evidence: "independent supporting layer",
  },
  {
    id: "birth-time-rectification",
    priority: "P1",
    status: "planned",
    title: ["30 題考時定刻工作台", "30 题考时定刻工作台", "30-question birth-time rectification workbench"],
    summary: ["是／否題用候選時刻、區分力、支持與反證矩陣比較最佳與次佳時刻。", "是／否题用候选时刻、区分力、支持与反证矩阵比较最佳与次佳时刻。", "Yes/no questions compare candidate times with discrimination, support and refutation matrices."],
    implementation: ["方法已整理成研究框架；正式上線時，不會用 D60 倒推出生分鐘，以免循環論證。", "方法已整理成研究框架；正式上线时，不会用 D60 倒推出生分钟，以免循环论证。", "The method is written up as a research framework. When it goes live, it will never use D60 to work backwards to a birth minute, which would be circular."],
    evidence: "research only",
  },
  {
    id: "bazi-relation-resolver-v2",
    priority: "P1",
    status: "partial",
    title: ["八字地支關係判讀", "八字地支关系判读", "BaZi branch relations"],
    summary: ["同時出現合、沖、刑、害、破、三合／三會時，以月令、透干、根氣、位置、病藥與歲運裁決真正主導關係。", "同时出现合、冲、刑、害、破、三合／三会时，以月令、透干、根气、位置、病药与岁运裁决真正主导关系。", "When multiple branch relations coexist, season, exposed stems, roots, position, disease/remedy and timing determine which relation is effective."],
    implementation: ["目前已能辨識各種地支關係、四庫與病藥；哪一種關係真正起作用的判斷仍在加強，但不會退回死背口訣的固定排序。", "目前已能辨识各种地支关系、四库与病药；哪一种关系真正起作用的判断仍在加强，但不会退回死背口诀的固定排序。", "The engine already recognises branch relations, the four storage branches and imbalance-and-remedy patterns. Deciding which relation actually takes effect is still being refined, without falling back on a fixed rote order."],
    evidence: "deterministic + evidence trace",
  },
  {
    id: "daily-almanac-sacred-calendar",
    priority: "P1",
    status: "partial",
    title: ["每日黃曆＋宗教聖日層", "每日黄历＋宗教圣日层", "Daily almanac & sacred-day layer"],
    summary: ["傳統日曆資料與個人流日必須分層；宗教聖誕、成道等只在可核來源下展示。", "传统日历资料与个人流日必须分层；宗教圣诞、成道等只在可核来源下展示。", "Traditional calendar data and personal daily timing stay separate; sacred observances require traceable sources."],
    implementation: ["首頁已有今日指引／黃曆基礎與五行穿衣；更完整建除、值日與聖日資料仍按來源逐步補強。", "首页已有今日指引／黄历基础与五行穿衣；更完整建除、值日与圣日资料仍按来源逐步补强。", "The homepage already has a daily guide/almanac base and five-element clothing; fuller sourced calendar data remains incremental."],
    evidence: "deterministic + evidence trace",
  },
  {
    id: "report-share-cards",
    priority: "P1",
    status: "active",
    title: ["報告 → 9:16 分享卡", "报告 → 9:16 分享卡", "Report → 9:16 share cards"],
    summary: ["把結論與重點轉成手機直式卡；文字層由程式排版，不依賴 AI 在圖內拼中文字。", "把结论与重点转成手机直式卡；文字层由程序排版，不依赖 AI 在图内拼中文。", "Convert report highlights into phone-first vertical cards with programmatic text layout."],
    implementation: ["報告分享卡已可使用；畫面沿用各文化原本的視覺風格，並保留 STONE 原創署名。", "报告分享卡已可使用；画面沿用各文化原本的视觉风格，并保留 STONE 原创署名。", "Report share cards are available, drawing on each tradition’s own visual style and carrying the STONE Original mark."],
    evidence: "deterministic + evidence trace",
  },
  {
    id: "metaphysics-source-library",
    priority: "P1",
    status: "partial",
    title: ["命理知識來源庫", "命理知识来源库", "Metaphysics source library"],
    summary: ["每條規則都要註明出處、版本、流派、可信度，以及是否已被新版取代；古籍原文與今人整理不可混為一談。", "每条规则都要注明出处、版本、流派、可信度，以及是否已被新版取代；古籍原文与今人整理不可混为一谈。", "Rules need source, version, school, confidence and supersession metadata; classical text and modern summaries must stay distinct."],
    implementation: ["已有收錄規範、古籍資料與部分知識文章；之後只會逐筆加入查得到出處的內容，不整批搬入舊資料。", "已有收录规范、古籍资料与部分知识文章；之后只会逐笔加入查得到出处的内容，不整批搬入旧资料。", "Sourcing rules, classical references and some knowledge articles are in place. New material is added one sourced item at a time, never in bulk from old notes."],
    route: "/knowledge",
    evidence: "A/B/C/D governance",
  },
  {
    id: "fengshui-form",
    priority: "P1",
    status: "research",
    title: ["形勢風水模組", "形势风水模块", "Form-school Feng Shui module"],
    summary: ["平面圖、照片與朝向可作形勢研究；資料不足時就不下判斷，並與八字、玄空分開。", "平面图、照片与朝向可作形势研究；资料不足时就不下判断，并与八字、玄空分开。", "Floor plans, photos and orientation can support form-school research. If information is missing, no judgement is made, and it stays separate from BaZi and Xuan Kong."],
    implementation: ["目前仍是研究方向；在有可核對的計算方式之前，不提供正式的風水判斷。", "目前仍是研究方向；在有可核对的计算方式之前，不提供正式的风水判断。", "This is still a research direction; no formal Feng Shui reading is offered until there is a method that can be checked."],
    evidence: "research only",
  },
  {
    id: "genealogy-name-culture",
    priority: "P2",
    status: "private",
    title: ["宗族族譜＋姓名文化檔案", "宗族族谱＋姓名文化档案", "Genealogy & name-culture archive"],
    summary: ["族譜影像、世系、輩字、姓名字源分開標證據，不把私人宗族資料泛化成算命規則。", "族谱影像、世系、辈字、姓名字源分开标证据，不把私人宗族资料泛化成算命规则。", "Genealogy images, lineage, generation names and character etymology keep separate evidence trails and never become generic fortune rules."],
    implementation: ["高品質個案可進 STONE LAB／私人文化檔案；未授權的家族資料不公開。", "高质量个案可进 STONE LAB／私人文化档案；未授权的家族资料不公开。", "High-quality cases may live in STONE LAB/private archives; unapproved family information is not published."],
    evidence: "private archive",
  },
  {
    id: "sixty-jiazi-encyclopedia",
    priority: "P2",
    status: "planned",
    title: ["六十甲子日柱百科", "六十甲子日柱百科", "Sixty Jiazi day-pillar encyclopedia"],
    summary: ["做可瀏覽教學與插畫，但每頁明示：單柱只是局部象義，完整論命仍看四柱全局。", "做可浏览教学与插画，但每页明示：单柱只是局部象义，完整论命仍看四柱全局。", "Build browsable educational pages and illustrations with an explicit rule: one pillar is partial symbolism, not a full chart judgement."],
    implementation: ["適合知識內容；不得讓日柱標籤回頭搶走子平主判。", "适合知识内容；不得让日柱标签回头抢走子平主判。", "Suitable as knowledge content; day-pillar labels never override full Zi Ping analysis."],
    evidence: "cultural / symbolic",
  },
  {
    id: "five-element-music",
    priority: "LOW",
    status: "fun",
    title: ["五行 × 音樂／聲音偏好", "五行 × 音乐／声音偏好", "Five elements × music/sound"],
    summary: ["音色、樂器、節奏可作生活象意與趣味探索，不能反證命局一定正確。", "音色、乐器、节奏可作生活象意与趣味探索，不能反证命局一定正确。", "Timbre, instruments and rhythm may be used for lifestyle symbolism and play, never as proof that a chart is correct."],
    implementation: ["只留在生活象意／趣味層，不進正式取用與應期。", "只留在生活象意／趣味层，不进正式取用与应期。", "Kept in lifestyle/fun layers, never formal useful-element or timing judgement."],
    evidence: "fun only",
  },
  {
    id: "fun-symbolic-tools",
    priority: "P2",
    status: "fun",
    title: ["Love Type／寵物命名／守護獸等趣味工具", "Love Type／宠物命名／守护兽等趣味工具", "Love Type, pet naming & guardian-animal tools"],
    summary: ["自評、命名與原型工具可以擴展，但必須和正式命盤結果清楚分區。", "自评、命名与原型工具可以扩展，但必须和正式命盘结果清楚分区。", "Self-assessment, naming and archetype tools may expand, but stay visibly separate from formal chart results."],
    implementation: ["現行趣味測驗已有獨立入口；後續新增也沿用『不冒充命盤』契約。", "现行趣味测验已有独立入口；后续新增也沿用“不冒充命盘”契约。", "Fun tests already have a separate entry point; future additions keep the same no-chart-impersonation contract."],
    route: "/fun-tests",
    evidence: "fun only",
  },
] as const;

export const SYSTEM_BOUNDARIES: readonly SystemBoundary[] = [
  {
    id: "symbolic-only",
    title: ["超自然身份只准象徵層", "超自然身份只准象征层", "Supernatural identity stays symbolic"],
    rule: ["Starseed、仙緣、童子、通靈、雙生火焰與具體前世身份只能作文化／心理／藝術敘事，不進主判。", "Starseed、仙缘、童子、通灵、双生火焰与具体前世身份只能作文化／心理／艺术叙事，不进主判。", "Starseed, immortal-lineage, child-spirit, mediumship, twin-flame and specific past-life identities are cultural/psychological/artistic narratives only."],
  },
  {
    id: "experimental-only",
    title: ["爭議模型只進研究室", "争议模型只进研究室", "Contested models stay experimental"],
    rule: ["南北半球改四時、12 宮／海王星靈擾、五行之外『月行』等只可做研究假設，不用於正式判讀。", "南北半球改四时、12 宫／海王星灵扰、五行之外“月行”等只可做研究假设，不用于正式判读。", "Hemisphere season remapping, 12th-house/Neptune spirit-interference claims and a proposed lunar sixth element remain research hypotheses, not used in live readings."],
  },
  {
    id: "d60-gate",
    title: ["D60 需精確到分鐘", "D60 需精确到分钟", "D60 needs an exact birth minute"],
    rule: ["D60 只在精確出生分鐘下提高權重；±2 分鐘敏感時降為弱旁證，且永遠不能用 D60 循環反推出生時間。", "D60 只在精确出生分钟下提高权重；±2 分钟敏感时降为弱旁证，且永远不能用 D60 循环反推出生时间。", "D60 gains weight only with a precise birth minute; ±2-minute instability downgrades it, and D60 must never circularly rectify birth time."],
  },
  {
    id: "calculation-truth",
    title: ["計算真相與解釋真相分離", "计算真相与解释真相分离", "Calculation truth is separate from interpretation truth"],
    rule: ["新的研究資料只能影響解讀；若沒有固定的計算方法、清楚的來源與核對範例，就不能說盤已經算出來。", "新的研究资料只能影响解读；若没有固定的计算方法、清楚的来源与核对范例，就不能说盘已经算出来。", "New research can only change how a chart is interpreted. Without a fixed calculation method, clear sources and worked examples to check against, the site must not say a chart has been calculated."],
  },
] as const;

export const SYSTEM_CAPABILITY_SYNC = {
  syncedAt: "2026-09-15T11:24:00+10:00",
  source: "2026-09-15 prior-conversation system review",
  capabilityCount: SYSTEM_CAPABILITIES.length,
  boundaryCount: SYSTEM_BOUNDARIES.length,
  canonicalDoctrine: "STONE-R6.2.1-CURRENT-MASTER",
} as const;
