import { buildQuestionContract, type AnswerMode } from "@/lib/report/decision-report-model";
import type { QuestionKind } from "@/lib/bazi/types";

export type PersonRole =
  | "self" | "partner" | "spouse" | "dating_interest" | "ambiguous_interest" | "ex_partner"
  | "parent" | "father" | "mother" | "child" | "son" | "daughter"
  | "sibling" | "brother" | "sister" | "grandparent" | "extended_family" | "in_law"
  | "friend" | "roommate" | "neighbor"
  | "boss" | "manager" | "coworker" | "subordinate" | "employee" | "recruiter"
  | "client" | "customer" | "business_partner" | "investor" | "shareholder" | "competitor"
  | "teacher" | "mentor" | "student"
  | "doctor" | "lawyer" | "advisor"
  | "landlord" | "tenant"
  | "team" | "company" | "public_figure" | "stranger"
  | "pet" | "future_child" | "deceased_person" | "unknown_other";

export type QuestionDomain =
  | "self" | "talent" | "personality" | "purpose"
  | "career" | "job_fit" | "study" | "exam" | "business" | "entrepreneurship"
  | "money" | "debt" | "investment"
  | "relationship" | "marriage" | "breakup" | "reconciliation" | "trust_fidelity"
  | "family" | "kinship" | "friendship" | "workplace_relationship" | "client_relationship" | "partnership" | "conflict"
  | "legal" | "health" | "medical_timing" | "fertility" | "children"
  | "home" | "property" | "relocation" | "travel" | "migration"
  | "timing" | "choice" | "compatibility" | "risk" | "negotiation" | "reputation"
  | "event_verification" | "past" | "spiritual" | "pet" | "general";

export type ComplexAnswerMode =
  | AnswerMode | "ranking" | "scenario" | "conditional" | "compatibility" | "risk" | "retrospective" | "sequence" | "multi-part";

export type QuestionGraph = {
  sourceText: string;
  primaryQuestion: string;
  secondaryQuestions: string[];
  kind: QuestionKind;
  roles: PersonRole[];
  domains: QuestionDomain[];
  modes: ComplexAnswerMode[];
  targetYears: number[];
  targetMonths: number[];
  hasNamedOrUnknownOther: boolean;
  thirdPartyBoundaryRequired: boolean;
  highStakes: boolean;
  highStakesKinds: Array<"medical" | "legal" | "investment" | "gambling" | "death" | "crime" | "fertility">;
  complexityScore: number;
  reasons: string[];
  shouldReason: boolean;
};

type MatchDef<T extends string> = { value: T; re: RegExp };

const ROLE_MATCHERS: MatchDef<PersonRole>[] = [
  { value: "spouse", re: /(老公|丈夫|先生|老婆|妻子|太太|配偶|husband|wife|spouse)/i },
  { value: "partner", re: /(伴侶|伴侣|另一半|男朋友|女朋友|男友|女友|partner|boyfriend|girlfriend)/i },
  { value: "dating_interest", re: /(喜歡的人|喜欢的人|心儀|心仪|crush|追求對象|追求对象)/i },
  { value: "ambiguous_interest", re: /(曖昧|暧昧|約會對象|约会对象|dating|situationship)/i },
  { value: "ex_partner", re: /(前任|前男友|前女友|前夫|前妻|ex\b)/i },
  { value: "father", re: /(爸爸|父親|父亲|老爸|father|dad)/i },
  { value: "mother", re: /(媽媽|妈妈|母親|母亲|老媽|老妈|mother|mom|mum)/i },
  { value: "parent", re: /(父母|雙親|双亲|家長|家长|parents?)/i },
  { value: "son", re: /(兒子|儿子|son\b)/i },
  { value: "daughter", re: /(女兒|女儿|daughter)/i },
  { value: "child", re: /(孩子|小孩|子女|child|children)/i },
  { value: "brother", re: /(哥哥|弟弟|兄弟|brother)/i },
  { value: "sister", re: /(姐姐|姊姊|妹妹|姐妹|姊妹|sister)/i },
  { value: "sibling", re: /(手足|siblings?)/i },
  { value: "grandparent", re: /(爺爺|爷爷|奶奶|外公|外婆|祖父|祖母|grandparent)/i },
  { value: "in_law", re: /(岳父|岳母|公公|婆婆|姻親|姻亲|in[- ]?law)/i },
  { value: "extended_family", re: /(叔叔|阿姨|舅舅|姑姑|姨媽|姨妈|表哥|表姐|堂哥|堂姐|親戚|亲戚|relative)/i },
  { value: "boss", re: /(老闆|老板|boss)/i },
  { value: "manager", re: /(主管|經理|经理|上司|manager|supervisor)/i },
  { value: "coworker", re: /(同事|同僚|coworker|colleague)/i },
  { value: "subordinate", re: /(下屬|下属|部下|subordinate|direct report)/i },
  { value: "employee", re: /(員工|员工|僱員|雇员|employee|staff)/i },
  { value: "recruiter", re: /(獵頭|猎头|招聘|recruiter)/i },
  { value: "client", re: /(客戶|客户|client)/i },
  { value: "customer", re: /(顧客|顾客|customer)/i },
  { value: "business_partner", re: /(合夥人|合伙人|商業夥伴|商业伙伴|business partner|cofounder|co-founder)/i },
  { value: "investor", re: /(投資人|投资人|investor)/i },
  { value: "shareholder", re: /(股東|股东|shareholder)/i },
  { value: "competitor", re: /(競爭對手|竞争对手|對手|对手|competitor|rival)/i },
  { value: "teacher", re: /(老師|老师|教師|教师|teacher)/i },
  { value: "mentor", re: /(導師|导师|師父|师父|mentor)/i },
  { value: "student", re: /(學生|学生|徒弟|student)/i },
  { value: "doctor", re: /(醫生|医生|醫師|医师|doctor|physician)/i },
  { value: "lawyer", re: /(律師|律师|lawyer|solicitor|barrister)/i },
  { value: "advisor", re: /(顧問|顾问|advisor|adviser|consultant)/i },
  { value: "landlord", re: /(房東|房东|landlord)/i },
  { value: "tenant", re: /(房客|租客|tenant)/i },
  { value: "roommate", re: /(室友|roommate|flatmate)/i },
  { value: "neighbor", re: /(鄰居|邻居|neighbor|neighbour)/i },
  { value: "friend", re: /(朋友|好友|閨蜜|闺蜜|friend)/i },
  { value: "team", re: /(團隊|团队|小組|小组|team)/i },
  { value: "company", re: /(公司|企業|企业|機構|机构|company|business|organisation|organization)/i },
  { value: "public_figure", re: /(明星|藝人|艺人|名人|公眾人物|公众人物|public figure|celebrity)/i },
  { value: "pet", re: /(寵物|宠物|貓|猫|狗|pet)/i },
  { value: "future_child", re: /(未來孩子|未来孩子|未出生|future child|unborn)/i },
  { value: "deceased_person", re: /(已故|過世|过世|去世|亡者|deceased|late\s+)/i },
];

const DOMAIN_MATCHERS: MatchDef<QuestionDomain>[] = [
  { value: "talent", re: /(天賦|天赋|強項|强项|擅長|擅长|能力|talent|aptitude)/i },
  { value: "personality", re: /(性格|個性|个性|人格|脾氣|脾气|personality|temperament)/i },
  { value: "purpose", re: /(使命|人生目的|為何而生|为何而生|宿命|purpose|calling)/i },
  { value: "job_fit", re: /(適合.{0,8}(工作|職業|职业|職位|职位)|職業方向|职业方向|career fit)/i },
  { value: "study", re: /(學習|学习|留學|留学|學校|学校|大學|大学|研究所|博士|study|school|university)/i },
  { value: "exam", re: /(考試|考试|證照|证照|升學|升学|exam|test|certification)/i },
  { value: "entrepreneurship", re: /(創業|创业|開店|开店|自己做生意|startup|entrepreneur)/i },
  { value: "business", re: /(生意|商業|商业|公司經營|公司经营|business)/i },
  { value: "career", re: /(工作|職業|职业|事業|事业|升職|升职|升遷|升迁|跳槽|離職|离职|offer|薪水|薪資|薪资|career|job|work)/i },
  { value: "debt", re: /(負債|负债|債務|债务|借錢|借钱|貸款|贷款|debt|loan)/i },
  { value: "investment", re: /(投資|投资|股票|基金|ETF|加密|比特幣|比特币|investment|stock|crypto)/i },
  { value: "money", re: /(財運|财运|錢|钱|收入|現金流|现金流|賺錢|赚钱|money|income|finance)/i },
  { value: "marriage", re: /(婚姻|結婚|结婚|離婚|离婚|婚後|婚后|marriage|marry|divorce)/i },
  { value: "breakup", re: /(分手|離開他|离开他|離開她|离开她|break\s*up|separate)/i },
  { value: "reconciliation", re: /(復合|复合|挽回|重新在一起|get back together|reconcile)/i },
  { value: "trust_fidelity", re: /(出軌|出轨|外遇|劈腿|忠誠|忠诚|背叛|第三者|cheat|affair|faithful|trust)/i },
  { value: "relationship", re: /(感情|戀愛|恋爱|愛情|爱情|伴侶|伴侣|約會|约会|曖昧|暧昧|relationship|love|dating)/i },
  { value: "kinship", re: /(父母|爸爸|媽媽|妈妈|兄弟|姐妹|子女|六親|六亲|家人|親戚|亲戚)/i },
  { value: "family", re: /(家庭|家人|父母|孩子|親戚|亲戚|family)/i },
  { value: "friendship", re: /(朋友|友情|閨蜜|闺蜜|friendship)/i },
  { value: "workplace_relationship", re: /(老闆|老板|主管|同事|下屬|下属|職場關係|职场关系|workplace)/i },
  { value: "client_relationship", re: /(客戶|客户|顧客|顾客|client|customer)/i },
  { value: "partnership", re: /(合夥|合伙|合作|股東|股东|投資人|投资人|partnership|cofounder)/i },
  { value: "conflict", re: /(衝突|冲突|吵架|爭執|争执|矛盾|對立|对立|conflict|fight)/i },
  { value: "legal", re: /(官司|訴訟|诉讼|法律|律師|律师|法院|仲裁|合約糾紛|合同纠纷|legal|lawsuit|court)/i },
  { value: "medical_timing", re: /(手術|手术|治療|治疗|停藥|停药|用藥|用药|康復|康复|medical|surgery|treatment).{0,20}(何時|何时|什麼時候|什么时候|when|時間|时间)/i },
  { value: "health", re: /(健康|身體|身体|疾病|病|痛|睡眠|失眠|醫療|医疗|health|illness|symptom)/i },
  { value: "fertility", re: /(懷孕|怀孕|受孕|備孕|备孕|生育|要孩子|fertility|pregnan)/i },
  { value: "children", re: /(孩子|子女|兒子|儿子|女兒|女儿|child|children)/i },
  { value: "property", re: /(買房|买房|房貸|房贷|房產|房产|置業|置业|property|mortgage)/i },
  { value: "relocation", re: /(搬家|搬去|移居|換城市|换城市|relocat|move to)/i },
  { value: "migration", re: /(移民|簽證|签证|永居|PR\b|migration|immigration|visa)/i },
  { value: "travel", re: /(旅行|旅遊|旅游|出國|出国|度假|行程|travel|trip|vacation)/i },
  { value: "home", re: /(家宅|住宅|住處|住处|房子|居住|home|house)/i },
  { value: "timing", re: /(什麼時候|什么时候|何時|何时|哪年|哪月|多久|時間窗口|时间窗口|應期|应期|when|timing)/i },
  { value: "choice", re: /(還是|还是|二選一|二选一|選哪|选哪|A\s*[：:].+?B\s*[：:]|choose|which one)/is },
  { value: "compatibility", re: /(合不合|合盤|合盘|適不適合彼此|适不适合彼此|相處|相处|compatib)/i },
  { value: "risk", re: /(風險|风险|最怕|防什麼|防什么|注意什麼|注意什么|risk|danger)/i },
  { value: "negotiation", re: /(談判|谈判|議價|议价|談薪|谈薪|協商|协商|negotiat)/i },
  { value: "reputation", re: /(名聲|名声|口碑|形象|聲譽|声誉|reputation)/i },
  { value: "event_verification", re: /(驗證|验证|對不對|对不对|發生過|发生过|回溯|過去事件|过去事件|verify|retrospective)/i },
  { value: "past", re: /(前世|前三世|輪迴|轮回|一掌經|一掌经|past life)/i },
  { value: "spiritual", re: /(神明|靈魂|灵魂|守護|守护|宇宙|靈性|灵性|spiritual|soul)/i },
  { value: "pet", re: /(寵物|宠物|貓|猫|狗|pet)/i },
];

const CONDITIONAL_RE = /(如果|假如|假設|假设|萬一|万一|在.+情況下|前提|除非|只要|if\b|assuming|provided that)/i;
const RANK_RE = /(排序|排第|排名|最適合哪幾|最适合哪几|top\s*\d|rank)/i;
const SCENARIO_RE = /(可能情況|可能情况|幾種情況|几种情况|情境|scenario|what if)/i;
const SEQUENCE_RE = /(先.+再|第一步|第二步|順序|顺序|優先級|优先级|sequence|step by step)/i;
const RISK_RE = /(風險|风险|最糟|最壞|最坏|失敗|失败|risk|downside|worst case)/i;
const RETRO_RE = /(回頭看|回头看|過去|过去|曾經|曾经|驗證|验证|回溯|retrospective)/i;
const THIRD_PRONOUN_RE = /(^|[^我])(他|她|對方|对方|那個人|那个人|此人|this person|they|them|their)([^a-z]|$)/i;
const SELF_RE = /(我|自己|本人|我的|my\b|me\b|myself)/i;

const HIGH_STAKES: Array<{ value: QuestionGraph["highStakesKinds"][number]; re: RegExp }> = [
  { value: "medical", re: /(診斷|诊断|癌|手術|手术|停藥|停药|治療|治疗|醫生|医生|medical|surgery|diagnos)/i },
  { value: "legal", re: /(官司|訴訟|诉讼|法院|判決|判决|律師|律师|legal|lawsuit|court)/i },
  { value: "investment", re: /(股票|基金|ETF|加密|比特幣|比特币|投資標的|投资标的|investment|stock|crypto)/i },
  { value: "gambling", re: /(彩票|彩券|賭博|赌博|博彩|號碼|号码|lottery|gambl)/i },
  { value: "death", re: /(死期|壽命|寿命|會不會死|会不会死|死亡|death|lifespan)/i },
  { value: "crime", re: /(犯罪|警察|坐牢|入獄|入狱|crime|prison|arrest)/i },
  { value: "fertility", re: /(能不能懷孕|能不能怀孕|何時懷孕|何时怀孕|生育結果|生育结果|fertility|pregnan)/i },
];

function dedupe<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function detectRoles(question: string): PersonRole[] {
  const roles = ROLE_MATCHERS.filter((item) => item.re.test(question)).map((item) => item.value);
  if (SELF_RE.test(question)) roles.unshift("self");
  if (THIRD_PRONOUN_RE.test(question) && !roles.some((role) => role !== "self")) roles.push("unknown_other");
  return dedupe(roles.length ? roles : ["self"]);
}

function detectDomains(question: string): QuestionDomain[] {
  const domains = DOMAIN_MATCHERS.filter((item) => item.re.test(question)).map((item) => item.value);
  return dedupe(domains.length ? domains : ["general"]);
}

function splitSubQuestions(source: string): string[] {
  const pieces = source
    .split(/(?:\n+|[？?]+|；|;)/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 3);
  return pieces.slice(0, 8);
}

function detectModes(question: string, baseMode: AnswerMode, secondaryCount: number): ComplexAnswerMode[] {
  const modes: ComplexAnswerMode[] = [baseMode];
  if (RANK_RE.test(question)) modes.push("ranking");
  if (SCENARIO_RE.test(question)) modes.push("scenario");
  if (CONDITIONAL_RE.test(question)) modes.push("conditional");
  if (/合不合|合盤|合盘|compatib/i.test(question)) modes.push("compatibility");
  if (RISK_RE.test(question)) modes.push("risk");
  if (RETRO_RE.test(question)) modes.push("retrospective");
  if (SEQUENCE_RE.test(question)) modes.push("sequence");
  if (secondaryCount > 0) modes.push("multi-part");
  return dedupe(modes);
}

export function buildQuestionGraph(question: string, fallbackKind: QuestionKind = "self"): QuestionGraph {
  const sourceText = String(question ?? "").trim();
  const contract = buildQuestionContract(sourceText, fallbackKind, "zh-Hant");
  const roles = detectRoles(sourceText);
  const domains = detectDomains(sourceText);
  const subQuestions = splitSubQuestions(sourceText);
  const secondaryQuestions = dedupe([...contract.secondaryQuestions, ...subQuestions.slice(1)]).slice(0, 6);
  const modes = detectModes(sourceText, contract.answerMode, secondaryQuestions.length);
  const highStakesKinds = HIGH_STAKES.filter((item) => item.re.test(sourceText)).map((item) => item.value);
  const otherRoles = roles.filter((role) => role !== "self");
  const hasNamedOrUnknownOther = otherRoles.length > 0 || THIRD_PRONOUN_RE.test(sourceText);

  let score = 0;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => { score += points; reasons.push(reason); };

  if (secondaryQuestions.length) add(2, "multiple_subquestions");
  if (domains.length >= 2) add(Math.min(3, domains.length - 1), "multiple_domains");
  if (roles.length >= 2) add(2, "multiple_people");
  else if (otherRoles.length === 1) add(1, "third_party_context");
  if (modes.includes("comparison") || modes.includes("ranking")) add(2, "comparison_or_ranking");
  if (modes.includes("conditional") || modes.includes("scenario")) add(2, "conditional_or_scenario");
  if (modes.includes("timing") && domains.some((d) => d !== "timing" && d !== "general")) add(1, "domain_plus_timing");
  if (modes.includes("compatibility")) add(2, "compatibility_requires_two_sided_boundary");
  if (sourceText.length >= 90) add(1, "long_context");
  if (highStakesKinds.length) add(2, "high_stakes_boundary");
  if (/(為什麼|为什么|原因).*(怎麼|怎么|何時|何时|什麼時候|什么时候)|(?:怎麼|怎么|如何).*(何時|何时|什麼時候|什么时候)/s.test(sourceText)) add(1, "multi_hop_question");

  const thirdPartyBoundaryRequired = hasNamedOrUnknownOther && !roles.every((role) => role === "self");
  const shouldReason = score >= 2
    || modes.includes("multi-part")
    || modes.includes("conditional")
    || modes.includes("scenario")
    || modes.includes("compatibility");

  return {
    sourceText,
    primaryQuestion: contract.primaryQuestion || sourceText,
    secondaryQuestions,
    kind: contract.kind,
    roles,
    domains,
    modes,
    targetYears: contract.requirements.targetYears,
    targetMonths: contract.requirements.targetMonths,
    hasNamedOrUnknownOther,
    thirdPartyBoundaryRequired,
    highStakes: highStakesKinds.length > 0,
    highStakesKinds: dedupe(highStakesKinds),
    complexityScore: Math.min(score, 10),
    reasons: dedupe(reasons),
    shouldReason,
  };
}

export const PERSON_ROLE_CATALOG: ReadonlyArray<{ role: PersonRole; answerBoundary: string }> = [
  { role: "self", answerBoundary: "可用本人命盤直接判本人結構、節奏與選擇。" },
  { role: "partner", answerBoundary: "可判本人在關係中的承載與互動節奏；無對方命盤不得替對方讀心。" },
  { role: "spouse", answerBoundary: "可判婚姻互動與本人決策；對方內心與行為仍以現實證據為準。" },
  { role: "dating_interest", answerBoundary: "可判本人追求／互動策略；不能從本人命盤斷定對方一定喜歡。" },
  { role: "ambiguous_interest", answerBoundary: "優先看持續聯絡、見面、承諾與邊界，不以命盤替代對方行為。" },
  { role: "ex_partner", answerBoundary: "可判復合對本人是否合適及時機；不能保證前任回頭。" },
  { role: "parent", answerBoundary: "六親只作本人盤中的關係功能與事件線，不等於父母本人的完整命盤。" },
  { role: "father", answerBoundary: "同 parent；健康、法律等第三方高風險問題不得由本人命盤代替專業判斷。" },
  { role: "mother", answerBoundary: "同 parent；不得把單一十神直接等同母親事件。" },
  { role: "child", answerBoundary: "可判本人子女線與養育／關係課題；孩子自身命運需孩子命盤。" },
  { role: "son", answerBoundary: "同 child。" },
  { role: "daughter", answerBoundary: "同 child。" },
  { role: "sibling", answerBoundary: "可判本人手足互動與資源邊界；不能替手足斷完整命運。" },
  { role: "brother", answerBoundary: "同 sibling。" },
  { role: "sister", answerBoundary: "同 sibling。" },
  { role: "grandparent", answerBoundary: "只判本人與長輩關係線；不得替長輩作健康或壽命預測。" },
  { role: "extended_family", answerBoundary: "只判本人互動與現實邊界。" },
  { role: "in_law", answerBoundary: "只判婚姻系統中的本人互動與界線。" },
  { role: "friend", answerBoundary: "可判本人友情模式、合作風險與界線，不讀心。" },
  { role: "roommate", answerBoundary: "以居住互動、責任、合約與邊界為主。" },
  { role: "neighbor", answerBoundary: "以衝突、界線與現實處理為主。" },
  { role: "boss", answerBoundary: "可判本人與權威／職場壓力互動及去留策略；不能替老闆讀心。" },
  { role: "manager", answerBoundary: "同 boss。" },
  { role: "coworker", answerBoundary: "可判協作、競爭與邊界；對方動機需實際行為驗證。" },
  { role: "subordinate", answerBoundary: "可判管理方式與本人承責；員工個人命運需其本人資料。" },
  { role: "employee", answerBoundary: "同 subordinate。" },
  { role: "recruiter", answerBoundary: "以 offer 條件、談判與本人職涯節奏為主。" },
  { role: "client", answerBoundary: "可判本人客戶關係、服務與商業節奏；不能預言客戶一定成交。" },
  { role: "customer", answerBoundary: "同 client。" },
  { role: "business_partner", answerBoundary: "可判本人合作承載、風險、責任與退出條件；若有雙方命盤才做雙向合參。" },
  { role: "investor", answerBoundary: "以條款、控制權、現金流與本人承載為主，不替投資人讀心。" },
  { role: "shareholder", answerBoundary: "以治理、責任、利益與退出條件為主。" },
  { role: "competitor", answerBoundary: "判本人競爭策略與時機，不預言對手內部狀態。" },
  { role: "teacher", answerBoundary: "以學習、權威互動與資源為主。" },
  { role: "mentor", answerBoundary: "以指導關係、資源與本人吸收方式為主。" },
  { role: "student", answerBoundary: "以本人教學／管理節奏為主；學生自身需其資料。" },
  { role: "doctor", answerBoundary: "醫療決定以醫生與檢查為準，命理不能推翻醫療建議。" },
  { role: "lawyer", answerBoundary: "法律決定以證據、程序與律師意見為準。" },
  { role: "advisor", answerBoundary: "可把建議放入現實比較，但不把顧問意見當命理事實。" },
  { role: "landlord", answerBoundary: "以合約、租務、現實責任與居住節奏為主。" },
  { role: "tenant", answerBoundary: "同 landlord。" },
  { role: "team", answerBoundary: "可判本人帶隊／協作條件；團隊整體不是一張個人命盤。" },
  { role: "company", answerBoundary: "公司選擇以本人適配與現實條件為主；公司本身需另有成立時間等資料才可另論。" },
  { role: "public_figure", answerBoundary: "沒有可靠出生資料不得假裝精算；更不得以傳聞補命盤。" },
  { role: "stranger", answerBoundary: "資料不足，只能回答本人如何應對。" },
  { role: "pet", answerBoundary: "可作本人與寵物照護／陪伴偏好參考；健康問題以獸醫為準。" },
  { role: "future_child", answerBoundary: "不得把未出生孩子的人格／命運寫成確定事實。" },
  { role: "deceased_person", answerBoundary: "不得聲稱能驗證亡者意志、訊息或死後狀態；只能作象徵性反思。" },
  { role: "unknown_other", answerBoundary: "未提供對方資料時，所有結論必須限制在本人可觀察、可決定的部分。" },
] as const;
