import type { Locale } from '@/lib/i18n';
import type { ZiweiCoreChart } from './core';
import type { ZiweiMutagenEvent, ZiweiScope, ZiweiTruthExtension } from './horoscope';
import {
  ZIWEI_ADVANCED_ANALYSIS_POLICY,
  ZIWEI_ADVANCED_ANALYSIS_ROUTE_VERSION,
} from './analysis-route';
import {
  ZIWEI_MUTAGEN_OPERATION,
  ZIWEI_PALACE_CONTEXT,
  ZIWEI_PROCESS_MODIFIER,
  ZIWEI_STAR_FUNCTION,
  classifyScopeAlignment,
  type ZiweiPalaceName,
} from './interpretation-grammar';

export type ZiweiGrammarEvidence = {
  scope: ZiweiScope;
  palace: string;
  signal: string;
};

export type ZiweiGrammarSummary = {
  version: 'zhaowu_ziwei_grammar_summary_v1';
  analysisRouteVersion: typeof ZIWEI_ADVANCED_ANALYSIS_ROUTE_VERSION;
  title: string;
  paragraph: string;
  evidence: ZiweiGrammarEvidence[];
};

type Input = {
  chart: ZiweiCoreChart;
  extension: ZiweiTruthExtension;
  locale: Locale;
  activeDecadalIndex: number | null;
};

function isKnownPalace(name: string | null): name is ZiweiPalaceName {
  return Boolean(name && Object.prototype.hasOwnProperty.call(ZIWEI_PALACE_CONTEXT, name));
}

function starFunction(star: string): string {
  if (Object.prototype.hasOwnProperty.call(ZIWEI_STAR_FUNCTION, star)) {
    return ZIWEI_STAR_FUNCTION[star as keyof typeof ZIWEI_STAR_FUNCTION].slice(0, 2).join('、');
  }
  return star;
}

function processAtBranch(extension: ZiweiTruthExtension, branch: string | null): string[] {
  if (!branch) return [];
  const found: string[] = [];
  for (const placement of extension.natalStars) {
    if (placement.branch !== branch) continue;
    if (!Object.prototype.hasOwnProperty.call(ZIWEI_PROCESS_MODIFIER, placement.star)) continue;
    const words = ZIWEI_PROCESS_MODIFIER[placement.star as keyof typeof ZIWEI_PROCESS_MODIFIER];
    found.push(`${placement.star}：${words.slice(0, 2).join('、')}`);
  }
  return found.slice(0, 2);
}

function activeEvents(input: Input): ZiweiMutagenEvent[] {
  const activeDecadal = input.activeDecadalIndex == null ? null : input.extension.decadals[input.activeDecadalIndex] ?? null;
  return [
    ...input.extension.natalMutagens,
    ...(activeDecadal?.mutagens ?? []),
    ...(input.extension.yearly?.mutagens ?? []),
  ];
}

function strongestPalace(events: ZiweiMutagenEvent[]) {
  const grouped = new Map<string, { palace: string; scopes: Set<ZiweiScope>; events: ZiweiMutagenEvent[] }>();
  for (const event of events) {
    if (!event.natalPalaceName) continue;
    const key = event.natalPalaceName;
    const existing = grouped.get(key) ?? { palace: key, scopes: new Set<ZiweiScope>(), events: [] };
    existing.scopes.add(event.scope);
    existing.events.push(event);
    grouped.set(key, existing);
  }
  return [...grouped.values()].sort((a, b) => {
    if (b.scopes.size !== a.scopes.size) return b.scopes.size - a.scopes.size;
    return b.events.length - a.events.length;
  })[0] ?? null;
}

function zhParagraph(input: Input, hans: boolean): ZiweiGrammarSummary {
  const events = activeEvents(input);
  const natal = input.extension.natalMutagens.slice(0, 4);
  const natalBits = natal.map((event) => {
    const op = ZIWEI_MUTAGEN_OPERATION[event.transformation];
    const palace = event.natalPalaceName ?? '未定位宮位';
    return `${event.targetStar}化${event.transformation}在${palace}：${starFunction(event.targetStar)}这组功能，进入“${op.action}”的作用方式`;
  });
  const focus = strongestPalace(events);
  const evidence: ZiweiGrammarEvidence[] = events
    .filter((event) => Boolean(event.natalPalaceName))
    .map((event) => ({ scope: event.scope, palace: event.natalPalaceName ?? '', signal: `${event.targetStar}化${event.transformation}` }));

  const intro = hans
    ? '这里不把四化当成吉凶表，而是先看本命结构，再看哪一种星曜功能在什么人生场景里被增加、推动、显化或形成成本。'
    : '這裡不把四化當成吉凶表，而是先看本命結構，再看哪一種星曜功能在什麼人生場景裡被增加、推動、顯化或形成成本。';
  const natalText = natalBits.length
    ? (hans ? `本命四化的结构是：${natalBits.join('；')}。` : `本命四化的結構是：${natalBits.join('；').replaceAll('这组', '這組').replaceAll('进入', '進入').replaceAll('作用方式', '作用方式')}。`)
    : '';

  let timing = hans ? '目前没有足够的重复岁运信号，因此不把单一流年扩大成重大事件判断。' : '目前沒有足夠的重複歲運訊號，因此不把單一流年擴大成重大事件判斷。';
  if (focus && isKnownPalace(focus.palace)) {
    const strength = classifyScopeAlignment([...focus.scopes]);
    const context = ZIWEI_PALACE_CONTEXT[focus.palace];
    const scopeLabel = strength === 'reinforced' ? (hans ? '本命、大限、流年重复引动' : '本命、大限、流年重複引動')
      : strength === 'supported' ? (hans ? '至少两个层次共同出现' : '至少兩個層次共同出現')
        : (hans ? '目前只出现单一层次' : '目前只出現單一層次');
    const process = processAtBranch(input.extension, focus.events[0]?.branch ?? null);
    timing = hans
      ? `${focus.palace}这一场景（${context.domain}）${scopeLabel}。这表示它是当前更值得留意的主题，但仍不是具体事件保证${process.length ? `；同宫过程修饰可见${process.join('、')}` : ''}。`
      : `${focus.palace}這一場景（${context.domain}）${scopeLabel}。這表示它是當前更值得留意的主題，但仍不是具體事件保證${process.length ? `；同宮過程修飾可見${process.join('、')}` : ''}。`;
  }

  const boundary = hans
    ? '宫干飞化、欽天自化、来因宫或专业版流月流日等资料，只有来源明示或对应规则已经验证时才进入结论；缺失资料不补造。'
    : '宮干飛化、欽天自化、來因宮或專業版流月流日等資料，只有來源明示或對應規則已經驗證時才進入結論；缺失資料不補造。';

  return {
    version: 'zhaowu_ziwei_grammar_summary_v1',
    analysisRouteVersion: ZIWEI_ADVANCED_ANALYSIS_ROUTE_VERSION,
    title: hans ? '四化与岁运结构' : '四化與歲運結構',
    paragraph: `${intro}${natalText}${timing}${boundary}`,
    evidence,
  };
}

export function buildZiweiGrammarSummary(input: Input): ZiweiGrammarSummary {
  // Keep the live report tied to the same policy used by the advanced analysis route.
  // This guard is intentionally explicit so future refactors cannot silently lower the
  // cross-layer evidence requirement below the locked policy.
  if (ZIWEI_ADVANCED_ANALYSIS_POLICY.minimumAlignedLayersForMajorClaim < 2) {
    throw new Error('Ziwei advanced analysis policy requires cross-layer validation');
  }

  if (input.locale === 'en') {
    const events = activeEvents(input);
    const focus = strongestPalace(events);
    const evidence: ZiweiGrammarEvidence[] = events
      .filter((event) => Boolean(event.natalPalaceName))
      .map((event) => ({ scope: event.scope, palace: event.natalPalaceName ?? '', signal: `${event.targetStar}化${event.transformation}` }));
    const natal = input.extension.natalMutagens.map((event) => {
      const op = ZIWEI_MUTAGEN_OPERATION[event.transformation];
      return `${event.targetStar} ${event.transformation} in ${event.natalPalaceName ?? 'an unresolved palace'} changes how its ${starFunction(event.targetStar)} function is expressed through ${op.action}`;
    }).join('; ');
    let timing = 'There is not enough repeated timing evidence to turn one annual signal into a major-event claim.';
    if (focus && isKnownPalace(focus.palace)) {
      const strength = classifyScopeAlignment([...focus.scopes]);
      const label = strength === 'reinforced' ? 'repeats across natal, decadal and yearly layers' : strength === 'supported' ? 'appears across at least two independent layers' : 'currently appears in one layer only';
      timing = `${focus.palace} (${ZIWEI_PALACE_CONTEXT[focus.palace].domain}) ${label}. Treat it as a theme to watch, not a guaranteed event.`;
    }
    return {
      version: 'zhaowu_ziwei_grammar_summary_v1',
      analysisRouteVersion: ZIWEI_ADVANCED_ANALYSIS_ROUTE_VERSION,
      title: 'Transformations and timing structure',
      paragraph: `The Four Transformations are treated as operations, not good/bad scores, and natal structure is read before timing layers. Natal structure: ${natal}. ${timing} Palace-stem flying transformations, Qin Tian self-transformations, cause-palace material, or professional monthly/daily timing are used only when explicitly supplied or backed by a verified profile; missing data is not invented.`,
      evidence,
    };
  }
  return zhParagraph(input, input.locale === 'zh-Hans');
}
