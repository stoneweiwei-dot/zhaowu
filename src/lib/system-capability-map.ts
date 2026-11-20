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
    implementation: ["現行報告已有 evidence governance；R6.2.1 仍是唯一子平主判入口。", "现行报告已有 evidence governance；R6.2.1 仍是唯一子平主判入口。", "The current report stack already has evidence governance; R6.2.1 remains the sole Zi Ping primary judgement."],
    evidence: "A/B/C/D governance",
  },
  {
    id: "core-variable-lock",
    priority: "P0",
    status: "partial",
    title: ["核心變量鎖定＋矛盾檢測", "核心变量锁定＋矛盾检测", "Core-variable lock & contradiction detection"],
    summary: ["先鎖月令、從化、寒暖燥濕、格局、病、藥與承載，後段不得靜默改口。", "先锁月令、从化、寒暖燥湿、格局、病、药与承载，后段不得静默改口。", "Lock season, transformation, climate, structure, disease/remedy and load-bearing before downstream interpretation."],
    implementation: ["R6.2.1 已要求 Stage Checkpoint／No Silent Reinterpretation；仍持續把鎖定結果下沉為更多結構化 runtime evidence。", "R6.2.1 已要求 Stage Checkpoint／No Silent Reinterpretation；仍持续把锁定结果下沉为更多结构化 runtime evidence。", "R6.2.1 already mandates checkpoints and no silent reinterpretation; more runtime state is still being structured."],
    evidence: "deterministic + evidence trace",
  },
  {
    id: "vedic-jyotish",
    priority: "P0",
    status: "partial",
    title: ["獨立印度吠陀占星 Jyotish", "独立印度吠陀占星 Jyotish", "Independent Jyotish"],
    summary: ["D1 為根；Bhava、Moon Chart、Dasha、Transit 與專項 Vargas 各自有明確角色。", "D1 为根；Bhava、Moon Chart、Dasha、Transit 与专项 Vargas 各自有明确角色。", "D1 is the root; Bhava, Moon Chart, Dasha, Transit and relevant Vargas each have a distinct role."],
    implementation: ["解釋協議已入庫，D60 已有分鐘可靠度 Gate；完整 deterministic D1／D9／Dasha 計算層與 test vectors 未驗證前，不生成假盤。", "解释协议已入库，D60 已有分钟可靠度 Gate；完整 deterministic D1／D9／Dasha 计算层与 test vectors 未验证前，不生成假盘。", "The interpretation protocol is active and D60 has a minute-reliability gate; unverified deterministic D1/D9/Dasha calculations are never fabricated."],
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
    implementation: ["各專卷已獨立存在；總裁判介面尚未作為已完成產品宣稱。", "各专卷已独立存在；总裁判界面尚未作为已完成产品宣称。", "Independent specialist readings exist; the combined adjudication interface is not yet claimed as complete."],
    evidence: "independent supporting layer",
  },
  {
    id: "birth-time-rectification",
    priority: "P1",
    status: "planned",
    title: ["30 題考時定刻工作台", "30 题考时定刻工作台", "30-question birth-time rectification workbench"],
    summary: ["是／否題用候選時刻、區分力、支持與反證矩陣比較最佳與次佳時刻。", "是／否题用候选时刻、区分力、支持与反证矩阵比较最佳与次佳时刻。", "Yes/no questions compare candidate times with discrimination, support and refutation matrices."],
    implementation: ["規則已形成研究框架；正式 runtime 必須禁止用 D60 循環反推出生分鐘。", "规则已形成研究框架；正式 runtime 必须禁止用 D60 循环反推出生分钟。", "The method is specified, but any runtime must prohibit circular D60-based rectification."],
    evidence: "research only",
  },
  {
    id: "bazi-relation-resolver-v2",
    priority: "P1",
    status: "partial",
    title: ["八字動態關係 Resolver v2", "八字动态关系 Resolver v2", "BaZi dynamic relation resolver v2"],
    summary: ["同時出現合、沖、刑、害、破、三合／三會時，以月令、透干、根氣、位置、病藥與歲運裁決真正主導關係。", "同时出现合、冲、刑、害、破、三合／三会时，以月令、透干、根气、位置、病药与岁运裁决真正主导关系。", "When multiple branch relations coexist, season, exposed stems, roots, position, disease/remedy and timing determine which relation is effective."],
    implementation: ["現行引擎已有關係偵測、四庫與病藥；動態 arbitration 持續深化，不回退成固定優先級口訣。", "现行引擎已有关系侦测、四库与病药；动态 arbitration 持续深化，不回退成固定优先级口诀。", "The engine already detects relations, four reservoirs and disease/remedy; arbitration continues to deepen without reverting to a fixed口诀 hierarchy."],
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
    implementation: ["現行 report share-card 元件與資料層已存在；保留文明原生視覺與 STONE 原創規則。", "现行 report share-card 元件与数据层已存在；保留文明原生视觉与 STONE 原创规则。", "The report share-card component and data layer already exist, with civilization-native art and STONE original rules retained."],
    evidence: "deterministic + evidence trace",
  },
  {
    id: "metaphysics-source-library",
    priority: "P1",
    status: "partial",
    title: ["命理知識來源庫", "命理知识来源库", "Metaphysics source library"],
    summary: ["規則要帶來源、版本、流派、可信度與 superseded 狀態，古籍原文與今人整理不可混標。", "规则要带来源、版本、流派、可信度与 superseded 状态，古籍原文与今人整理不可混标。", "Rules need source, version, school, confidence and supersession metadata; classical text and modern summaries must stay distinct."],
    implementation: ["已有 ingestion policy、古籍與部分 knowledge modules；後續只按可驗證來源增量入庫，不整包吞舊 Prompt。", "已有 ingestion policy、古籍与部分 knowledge modules；后续只按可验证来源增量入库，不整包吞旧 Prompt。", "Ingestion policy, classical references and knowledge modules exist; future additions are sourced increments, not wholesale legacy prompts."],
    route: "/knowledge",
    evidence: "A/B/C/D governance",
  },
  {
    id: "fengshui-form",
    priority: "P1",
    status: "research",
    title: ["形勢風水模組", "形势风水模块", "Form-school Feng Shui module"],
    summary: ["平面圖、照片、朝向可作形勢研究；資料不足時 fail closed，且與八字、玄空分開。", "平面图、照片、朝向可作形势研究；资料不足时 fail closed，且与八字、玄空分开。", "Floor plans, photos and orientation can support form-school research; missing inputs fail closed and stay separate from BaZi/Xuan Kong."],
    implementation: ["保留為研究產品方向，未建立可驗證 runtime 前不冒充正式風水判盤。", "保留为研究产品方向，未建立可验证 runtime 前不冒充正式风水判盘。", "Retained as a research direction; no formal Feng Shui engine is claimed before a verifiable runtime exists."],
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
    implementation: ["適合知識／SEO 產品；不得讓日柱標籤回頭搶走子平主判。", "适合知识／SEO 产品；不得让日柱标签回头抢走子平主判。", "Suitable for knowledge/SEO content; day-pillar labels never override full Zi Ping analysis."],
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
    rule: ["南北半球改四時、12 宮／海王星靈擾、五行之外『月行』等只可做研究假設，不進 Production 主判。", "南北半球改四时、12 宫／海王星灵扰、五行之外“月行”等只可做研究假设，不进 Production 主判。", "Hemisphere season remapping, 12th-house/Neptune spirit-interference claims and a proposed lunar sixth element remain research hypotheses, not production judgement."],
  },
  {
    id: "d60-gate",
    title: ["D60 嚴格分鐘 Gate", "D60 严格分钟 Gate", "Strict D60 minute gate"],
    rule: ["D60 只在精確出生分鐘下提高權重；±2 分鐘敏感時降為弱旁證，且永遠不能用 D60 循環反推出生時間。", "D60 只在精确出生分钟下提高权重；±2 分钟敏感时降为弱旁证，且永远不能用 D60 循环反推出生时间。", "D60 gains weight only with a precise birth minute; ±2-minute instability downgrades it, and D60 must never circularly rectify birth time."],
  },
  {
    id: "calculation-truth",
    title: ["計算真相與解釋真相分離", "计算真相与解释真相分离", "Calculation truth is separate from interpretation truth"],
    rule: ["新增研究資料只能改解釋層；沒有 deterministic engine、來源 profile 與 test vectors，就不得聲稱盤面已算出。", "新增研究资料只能改解释层；没有 deterministic engine、来源 profile 与 test vectors，就不得声称盘面已算出。", "New research may change interpretation only; without a deterministic engine, source profile and test vectors, the site must not claim that a chart was calculated."],
  },
] as const;

export const SYSTEM_CAPABILITY_SYNC = {
  syncedAt: "2026-09-15T11:24:00+10:00",
  source: "2026-09-15 prior-conversation system review",
  capabilityCount: SYSTEM_CAPABILITIES.length,
  boundaryCount: SYSTEM_BOUNDARIES.length,
  canonicalDoctrine: "STONE-R6.2.1-CURRENT-MASTER",
} as const;
