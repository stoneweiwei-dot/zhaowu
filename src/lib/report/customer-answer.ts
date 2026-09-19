import { analyzeStructure } from '@/lib/bazi/structure';
import type { AppLocale, Chart, Reading } from '@/lib/bazi/types';
import { customerCopy, customerDirectAnswer } from './customer-copy';
import { buildDistinctTimingAnswer } from '@/lib/bazi/forecast-safe';
import { inspectAnswerRequirements } from '@/lib/core/answer-contract';

export type CustomerAnswer = {
  version: 1;
  question: string;
  contextQuestion?: string;
  locale: AppLocale;
  direct: string;
  reasons: string[];
  limits: string[];
  timing: string[];
  actions: string[];
  evidence?: string[];
};

export const TALENT_QUESTION = /天[賦赋]|擅[長长]|[優优][勢势]|才[華华]|[專专][長长]|\b(?:talents?|strengths|good at|gifted)\b/i;
const INTERNAL = /核心不是|不再用|不混入|不額外|不额外|只保留與|只保留与|不為了|不为了|視覺層|视觉层|主判|底盤|底盘|做功|承載|承载|後台|后台|內部交叉|内部交叉|時間敏感細分層|时间敏感细分层|time-sensitive detail|runtime|visual layer|template|engine|cross-check/i;
const JARGON = /命[盤盘局]|原局|大[運运]|流年|流月|十神|五行|成勢|成势|日主|月令|正印|偏印|七[殺杀]|官[殺杀]|[殺杀]印|食神|[傷伤]官|比肩|劫[財财]|用神|病[藥药]|[調调]候|旺衰|身[強强弱]|成格|格局|制化|透干|通根|刑[沖冲]|\b(?:day master|month command|ten gods?|bazi|ziping)\b/i;
const TECHNICAL_QUESTION = /格局|用神|病[藥药]|身[強强弱]|旺衰|五行|八字|四柱|D60|紫微|前世|[靈灵]魂|\b(?:bazi|structure|elements?|past life)\b/i;

export function customerSentences(value: string): string[] {
  return (customerCopy(value).match(/[^。！？!?\n]+[。！？!?]?/g) ?? [])
    .flatMap(part => part.split(/(?<=[.!?])\s+(?=[A-Z])/))
    .map(part => part.trim()).filter(Boolean);
}

export function uniqueCustomerLines(lines: string[], already: string[] = []): string[] {
  const key = (s: string) => s.replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase();
  const seen = already.flatMap(customerSentences).map(key);
  return lines.flatMap(customerSentences).filter(line => {
    const k = key(line);
    if (!k || seen.some(old => old === k || (Math.min(old.length, k.length) > 24 && (old.includes(k) || k.includes(old))))) return false;
    seen.push(k);
    return true;
  });
}

export function plainCustomerLines(lines: string[], technical = false): string[] {
  return uniqueCustomerLines(lines).filter(line => !INTERNAL.test(line) && (technical || !JARGON.test(line)));
}

/** Presentation-only: never infer an occupation, personality or ability from one chart label. */
export function buildCustomerAnswer(question: string, chart: Chart, reading: Reading, locale: AppLocale = 'zh-Hans'): CustomerAnswer {
  const tr = (hant: string, hans: string, en: string) => locale === 'en' ? en : locale === 'zh-Hant' ? hant : hans;
  const req = inspectAnswerRequirements(question);
  const technical = TECHNICAL_QUESTION.test(question) && !TALENT_QUESTION.test(question);
  const answer: CustomerAnswer = { version: 1, question, locale, direct: '', reasons: [], limits: [], timing: [], actions: [] };
  const talent = TALENT_QUESTION.test(question);
  const jobFit = /(?:適合|适合|擅長|擅长).{0,10}(?:工作|職業|职业|行業|行业)|\b(?:suitable career|career suits|job suits|suited to)\b/i.test(question);
  const decision = /值得|要不要|該不該|该不该|是否|繼續|继续|離開|离开|離職|离职|辭職|辞职|\b(?:should|stay|leave|continue)\b/i.test(question);
  const careerTopic = /工作|職業|职业|事業|事业|轉職|转职|跳槽|離開公司|离开公司|離職|离职|辭職|辞职|升遷|升迁|升職|升职|職場|职场|公司|職位|职位|上班|offer|薪水|薪資|薪资|工資|工资|\b(?:career|job|work|role)\b/i.test(question);
  const timing = req.asksWhen || /\b(?:when|which month|what month|this year|next year)\b/i.test(question);

  if (timing && locale === 'en' && !req.asksMedicalTiming && !req.asksInvestmentPick && !req.asksTravel && !technical) {
    const q = question.replace(/next year/gi, '明年').replace(/this year/gi, '今年');
    const years = inspectAnswerRequirements(q).targetYears;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const months = monthNames.flatMap((month, index) => new RegExp('\\b' + month + '\\b', 'i').test(question) ? [index + 1] : []);
    const source = buildDistinctTimingAnswer(chart, reading.kind === 'timing' ? 'self' : reading.kind, years, months);
    const translated = source
      .replace(/(\d{4}) 整體推進力較強。/g, '$1 is a relatively favourable year in this traditional reading. ')
      .replace(/(\d{4}) 整體阻力較高，宜挑窗口。/g, '$1 calls for more selective timing in this traditional reading. ')
      .replace(/(\d{4}) 屬於可做、但要挑月份的年份。/g, '$1 has a mixed outlook in this traditional reading. ')
      .replaceAll('你指定的月份範圍內，', 'Within the months you asked about, ')
      .replaceAll('較順的窗口：', 'Relatively favourable months: ')
      .replaceAll('較需要保守安排：', 'Months to approach more cautiously: ')
      .replace(/(\d{1,2})月/g, (_, month) => monthNames[Number(month) - 1])
      .replaceAll(' 為偏順。', ' is relatively favourable. ')
      .replaceAll(' 為阻力偏高。', ' calls for caution. ')
      .replaceAll(' 為中性可用。', ' has a mixed outlook. ')
      .replace(/出生時間未確定[^。]*。/g, '')
      .replaceAll('、', ', ').replaceAll('。', '. ');
    const lines = customerSentences(translated);
    answer.direct = lines.slice(0, 2).join(' ');
    answer.timing = lines.slice(2);
  } else if (talent || (jobFit && !timing)) {
    answer.direct = talent
      ? tr('目前不能只憑出生資料，可靠地判定你的具體天賦。這份分析沒有你的作品、學習表現或工作成果，不能據此說你擅長設計、管理或研究。', '目前不能只凭出生资料，可靠地判定你的具体天赋。这份分析没有你的作品、学习表现或工作成果，不能据此说你擅长设计、管理或研究。', 'Your birth details alone cannot reliably establish your talents. There is no evidence here of your work, learning or results to support a claim that you excel at design, management or research.')
      : tr('目前不能可靠指定你最適合哪一種工作。還缺你的技能、經驗與工作要求，出生資料不能代替這些條件。', '目前不能可靠指定你最适合哪一种工作。还缺你的技能、经验与工作要求，出生资料不能代替这些条件。', 'There is not enough information to name the job that suits you best. Your skills, experience and work requirements matter, and birth details cannot establish them.');
    answer.reasons = [tr('能排出出生資料，不等於已測量你的能力；同一種傳統分類也可能對應完全不同的職業和表現。', '能排出出生资料，不等于已测量你的能力；同一种传统分类也可能对应完全不同的职业和表现。', 'A birth chart is not an ability assessment. People with the same traditional classification can have very different skills and careers.')];
    const structure = analyzeStructure(chart);
    // Require the established combined structure AND a supported remedy path.
    // These are explicitly traditional hypotheses, never measured aptitude.
    const supported = !chart.timeUnknown && !chart.birthTimeReview?.required
      && structure.established && structure.remedy.status === 'clear'
      && structure.completion.grade === 'G4';
    if (supported && /殺印相生|官殺配印/.test(structure.supportingPattern ?? '')) {
      answer.direct = talent
        ? tr('按傳統解讀，你可優先留意兩項能力：學懂複雜方法，再用它處理難題；在要求多、標準高的事情中整理出做法。這是能力方向的推論，還不能當成你已具備的成績。', '按传统解读，你可优先留意两项能力：学懂复杂方法，再用它处理难题；在要求多、标准高的事情中整理出做法。这是能力方向的推论，还不能当成你已具备的成绩。', 'This traditional reading points to two possible strengths: learning complex methods and using them to solve difficult problems; and organising a clear approach when demands are high. These are hypotheses about ability, not verified achievements.')
        : tr('按傳統解讀，可以優先考慮需要深入學習、解決問題、把關品質的工作內容，例如技術服務或流程改善。這只能縮小工作類型，不能直接指定職業或保證你會勝任。', '按传统解读，可以优先考虑需要深入学习、解决问题、把关品质的工作内容，例如技术服务或流程改善。这只能缩小工作类型，不能直接指定职业或保证你会胜任。', 'This traditional reading suggests exploring work involving detailed learning, problem-solving and quality checks, such as technical services or process improvement. It cannot establish which occupation you will succeed in.');
      answer.reasons = [tr('這個方向來自幾項條件合看：外在要求明顯，也有吸收知識、借助方法來應對的條件；不是看到單一符號就判你有才華。', '这个方向来自几项条件合看：外在要求明显，也有吸收知识、借助方法来应对的条件；不是看到单一符号就判你有才华。', 'The interpretation combines signs of external demands with a supported route for responding through learning and established methods; it does not come from a single symbol.')];
      answer.limits = [tr('能分析不等於能落地；只有在能實際練習、得到回饋的環境裡，這個方向才有機會變成技能。', '能分析不等于能落地；只有在能实际练习、得到反馈的环境里，这个方向才有机会变成技能。', 'Analysis is not the same as delivery. Practice and feedback would still be needed to turn this possible strength into a skill.')];
      answer.evidence = [structure.label, structure.supportingPattern!, structure.remedy.bridge ?? '', ...structure.remedy.evidence];
    }
    // A precise missing input, not a demand that the customer validate the engine's work.
    answer.actions = supported && answer.evidence?.length ? [tr('先選一項需要診斷問題、制定做法的具體任務，完成後看結果是否改善。', '先选一项需要诊断问题、制定做法的具体任务，完成后看结果是否改善。', 'Try one task that requires identifying a problem and choosing a method, then check whether the outcome improves.')] : [tr('若要往下判斷，補充你做過的一項具體工作或作品，以及完成後的結果。', '若要往下判断，补充你做过的一项具体工作或作品，以及完成后的结果。', 'To assess this further, describe one piece of work you completed and its result.')];
  } else if (!technical && !timing && !req.asksTravel && reading.kind === 'love') {
    const recurrence = /反[覆复]|重[複复]|為什麼|为什么|問題|问题|\b(?:why|repeat|pattern)\b/i.test(question);
    answer.direct = recurrence
      ? tr('目前不能判定你在感情裡反覆遇到問題的原因。你尚未提供實際相處經過，不能把雙方的行為歸因於出生資料。', '目前不能判定你在感情里反复遇到问题的原因。你尚未提供实际相处经过，不能把双方的行为归因于出生资料。', 'There is not enough information to explain a recurring relationship problem. No actual interaction has been described, so birth details cannot establish the cause.')
      : tr('目前不能判定這段感情會不會繼續，或對方是否喜歡你。還缺對方近期的實際行動與你們目前的關係狀態。', '目前不能判定这段感情会不会继续，或对方是否喜欢你。还缺对方近期的实际行动与你们目前的关系状态。', 'There is not enough information to tell whether this relationship will continue or how the other person feels. Their recent actions and your current relationship status are missing.');
    answer.reasons = [tr('一個人的出生資料不能證明另一個人的想法，也不能確認某次衝突由誰造成。', '一个人的出生资料不能证明另一个人的想法，也不能确认某次冲突由谁造成。', 'One person’s birth details cannot establish another person’s feelings or who caused a particular conflict.')];
    answer.actions = [tr('補充最近一次讓你困惑的互動：對方做了什麼、你怎麼回應。', '补充最近一次让你困惑的互动：对方做了什么、你怎么回应。', 'Describe the most recent interaction that concerned you: what they did and how you responded.')];
  } else if (!technical && !timing && (reading.kind === 'career' || careerTopic)) {
    answer.direct = decision ? tr('目前不能直接替你決定留職或離開。先要知道現職與新選擇的待遇、工時和離職代價，才能比較哪個更適合。', '目前不能直接替你决定留职或离开。先要知道现职与新选择的待遇、工时和离职代价，才能比较哪个更适合。', 'There is not enough information to choose whether you should stay or leave. The current job and alternative need to be compared on pay, hours and the cost of leaving.') : tr('現有資料不足以判定你工作上的主要問題。需要知道具體卡在哪件事，才能分清是技能、工作安排還是合作上的困難。', '现有资料不足以判定你工作上的主要问题。需要知道具体卡在哪件事，才能分清是技能、工作安排还是合作上的困难。', 'There is not enough information to identify the main problem at work. A specific example would help distinguish a skills gap from workload or a working relationship issue.');
    answer.actions = decision ? [tr('補充兩個選擇的薪資、工時與最不能接受的條件。', '补充两个选择的薪资、工时与最不能接受的条件。', 'Provide the pay, super, hours and deal-breakers for the two options.')] : [tr('說明最近一件工作上卡住的事，以及你已嘗試的做法。', '说明最近一件工作上卡住的事，以及你已尝试的做法。', 'Describe one recent problem at work and what you have already tried.')];
  } else {
    const lines = plainCustomerLines([customerDirectAnswer(question, reading.directAnswer)], technical);
    answer.direct = lines.slice(0, 2).join(locale === 'en' ? ' ' : '');
    const source = reading.kind === 'career' ? reading.work : reading.kind === 'money' ? reading.money : reading.kind === 'health' ? reading.body : reading.kind === 'home' ? reading.home : '';
    answer.reasons = plainCustomerLines([source], technical).slice(0, 2);
    if (timing) answer.timing = lines.slice(2);
    answer.actions = plainCustomerLines([reading.action], technical).filter(line => !/最近三次|前三個月份|前三个月份|比較高低|比较高低|three recent|observe for two weeks/i.test(line)).slice(0, 1);
    if (!answer.direct) {
      answer.direct = tr('目前的資料不足以回答這個問題，不能給你可靠結論。', '目前的资料不足以回答这个问题，不能给你可靠结论。', 'There is not enough relevant information to answer this question reliably.');
      answer.reasons = [];
      answer.actions = [];
    }
  }
  if (timing) answer.limits.push(tr('月份只是傳統推估，不代表事情一定發生。', '月份只是传统推估，不代表事情一定发生。', 'Any month given is a traditional estimate, not a promise that an event will happen.'));
  if (chart.timeUnknown) answer.limits.push(tr('出生時間未確定，涉及具體時間的判斷受限。', '出生时间未确定，涉及具体时间的判断受限。', 'The birth time is unknown, which limits timing detail.'));
  let used = [answer.direct];
  for (const key of ['reasons', 'timing', 'limits', 'actions'] as const) {
    answer[key] = uniqueCustomerLines(answer[key], used);
    used = [...used, ...answer[key]];
  }
  return answer;
}

export function withCustomerAnswer(question: string, chart: Chart, reading: Reading, locale: AppLocale = 'zh-Hans'): Reading {
  const saved = reading.customerAnswer;
  const customerAnswer = saved?.version === 1 && saved.question === question && saved.locale === locale
    ? saved : buildCustomerAnswer(question, chart, reading, locale);
  return { ...reading, directAnswer: customerAnswer.direct, action: customerAnswer.actions.join(locale === 'en' ? ' ' : ''), customerAnswer };
}
