import type { Locale } from '@/lib/i18n';
import { mod12, palaceIndexOf, type ZiweiCoreChart } from './core';
import type { ZiweiTruthExtension, ZiweiMutagenEvent, ZiweiDecadal } from './horoscope';

export type ZiweiPlainEvidence = {
  source: 'natal' | 'work' | 'money' | 'relationship' | 'inner' | 'decadal' | 'yearly';
  signal: string;
};

export type ZiweiPlainSummary = {
  version: 'zhaowu_ziwei_plain_summary_v1';
  locale: Locale;
  title: string;
  paragraphs: string[];
  closing: string;
  internalEvidence: ZiweiPlainEvidence[];
};

type SummaryInput = {
  chart: ZiweiCoreChart;
  extension: ZiweiTruthExtension;
  locale: Locale;
  activeDecadalIndex: number | null;
  targetYear: number;
};

type ToneKey =
  | 'authority' | 'strategy' | 'visibility' | 'practical' | 'ease' | 'intensity' | 'stability'
  | 'sensitivity' | 'appetite' | 'analysis' | 'coordination' | 'responsibility' | 'decisive' | 'reinvention';

const STAR_TONE: Record<string, ToneKey> = {
  紫微: 'authority', 天機: 'strategy', 太陽: 'visibility', 武曲: 'practical', 天同: 'ease', 廉貞: 'intensity',
  天府: 'stability', 太陰: 'sensitivity', 貪狼: 'appetite', 巨門: 'analysis', 天相: 'coordination', 天梁: 'responsibility',
  七殺: 'decisive', 破軍: 'reinvention',
};

const COPY = {
  'zh-Hant': {
    title: '紫微白話總解',
    tones: {
      authority: ['你做事很需要自己先看清方向，不喜歡長期被別人牽著走。', '你對品質和秩序有自己的標準，遇到沒人做決定的局面，常會自然接手。'],
      strategy: ['你腦子轉得快，會先觀察、比較，再決定怎麼走。', '你的優勢是能看見不同可能，但事情一多時也容易在腦中反覆推演。'],
      visibility: ['你在需要承擔責任或站到前面時，往往比自己想像中更能撐住場面。', '你很在意事情有沒有做出效果，也容易把別人的期待一起扛在身上。'],
      practical: ['你做事偏實際，會看結果、效率和投入值不值得。', '你對資源和現實條件的敏感度高，不太喜歡只談理想卻沒有落地方法。'],
      ease: ['你其實很重視生活能不能過得舒服、順暢，不喜歡長期處在高衝突裡。', '你的親和力通常不差，但有時會因為不想把事情搞僵而延後真正需要處理的問題。'],
      intensity: ['你對人和事有明確喜惡，邊界一旦被踩到，態度會變得很清楚。', '你不是沒有彈性，而是很難長期忍受模糊、反覆或不真誠。'],
      stability: ['你真正擅長的是把事情慢慢做穩，而不是靠一時衝動取勝。', '你對安全感、資源和可持續性有自然的判斷，越有自主空間越能發揮。'],
      sensitivity: ['你對氣氛、細節和人的情緒變化很敏銳，很多東西不必說明你也會先感覺到。', '你需要一定的安靜和安全感，外界太吵或變動太快時會比別人更耗能。'],
      appetite: ['你對新東西、人和體驗的接受度高，人生不能一直只有同一種節奏。', '你很會感受機會和可能性，但選擇太多時也要避免把注意力分得太散。'],
      analysis: ['你很容易看見問題裡不合理的地方，也不會因為大家都這樣做就直接接受。', '你的判斷力來自追問和比較，但壓力大時容易把一句話、一件事想得過深。'],
      coordination: ['你很重視公平、分寸和彼此配合，擅長在不同立場之間找到可行的做法。', '你不喜歡粗暴推進，環境越有秩序、合作對象越成熟，你越能發揮。'],
      responsibility: ['你很容易成為那個幫忙收尾、照顧整體的人，責任感通常比表面看起來更重。', '你能扛事，但要小心把別人的問題也默默變成自己的責任。'],
      decisive: ['真正到了要做決定的時候，你其實比很多人更敢切斷、重排和承擔後果。', '你不適合長期被困在拖延的環境裡，有清楚權限和明確目標時反而更有效率。'],
      reinvention: ['你的人生很難完全照一條固定路線走到底，到了不合適的階段會有很強的重整衝動。', '你真正的能力不是守住所有舊東西，而是知道什麼時候該拆掉重來。'],
    },
    workLead: '工作上，', moneyLead: '談到錢和現實選擇，', relationLead: '在人際和親密關係裡，', innerLead: '真正容易讓你累的地方，',
    work: {
      authority: '你比較適合有判斷權、能自己定優先順序的環境；被過度微管會很快失去耐心。', strategy: '你適合需要分析、規劃和快速調整的工作，不適合每天只做完全重複的事情。',
      visibility: '你在需要對外、承擔責任或讓成果被看見的工作裡更容易建立位置。', practical: '你的價值來自把事情做實、做準、做出可衡量結果，專業能力比表面熱鬧更重要。',
      ease: '你更適合人際氣氛正常、節奏可持續的工作，長期高壓內耗會明顯降低你的狀態。', intensity: '你適合有清楚規則和邊界的工作，最受不了權責模糊、反覆改口和低效率。',
      stability: '你適合做能累積口碑、客戶、資源或專業壁壘的事，越做越穩比快速換題目更有利。', sensitivity: '你對品質、審美和細節有優勢，環境太粗糙時容易消耗，精細型工作反而能拉開差距。',
      appetite: '你適合有變化、有互動、有新題目的工作，完全封閉且沒有成長空間的環境很難讓你久待。', analysis: '你適合需要判斷、拆問題、談判或把複雜事情說清楚的工作，但別把所有時間都耗在證明誰對誰錯。',
      coordination: '你的強項是把人、流程和需求接起來，合作品質會直接決定你的工作效率。', responsibility: '你容易被交付重要或棘手的事，長期要避免成為團隊裡永遠替別人補洞的人。',
      decisive: '你適合目標清楚、允許快速決策的工作，真正需要轉向時你比想像中果斷。', reinvention: '你很適合做改革、重整、創新或從零建立新流程的事，職涯不必強迫自己永遠維持同一種形式。',
    },
    money: {
      practical: '你對投入回報很敏感，錢最好來自可重複的專業能力，而不是模糊承諾。', stability: '你更適合先建立穩定現金流和可累積資產，再去做更大的選擇。', appetite: '你願意為體驗、興趣或新機會花錢，真正要守的是不要因為選擇太多而分散資源。',
      sensitivity: '你花錢常和品質、安全感、環境舒適度有關，比起便宜，你更在意值不值得。', authority: '你希望財務由自己掌控，越能看懂收入來源和支出結構，心裡越安定。', strategy: '你會比較不同方案再下手，適合有規劃地配置，而不是被短期情緒帶著走。',
    },
    relation: {
      stability: '你真正要的是可靠、長期可相處的人，穩定投入比一開始很熱烈更重要。', sensitivity: '你很容易感覺到對方語氣和態度的變化，所以關係裡最需要的是安全感和清楚溝通。', coordination: '你很重視尊重、分寸和互相配合，關係一旦長期失衡，你會越來越累。',
      intensity: '你不喜歡曖昧不清和反覆拉扯；一旦信任下降，你會迅速收回投入。', appetite: '你需要關係裡仍然有新鮮感和共同體驗，太沉悶或限制太多容易讓你失去興趣。', analysis: '你會觀察很多細節，也容易反覆想一句話背後的意思；真正適合你的人要能把事情說清楚。',
      authority: '你不喜歡被控制，也很難接受完全沒有主見的人；最好是兩個都能自己站穩的人。', ease: '你其實希望關係是舒服的，不愛長期爭吵；但有問題時仍要直接說，不要一直拖。',
    },
    pressure: {
      strategy: '常常不是事情本身，而是你腦子一直沒有停，所有可能性都同時在裡面跑。', analysis: '你容易把問題想得很深，尤其遇到說不清、沒答案的事情時，精神消耗會放大。', sensitivity: '外界氣氛、人際變化和生活品質會直接影響你的狀態，你比自己以為的更需要安靜和恢復。',
      responsibility: '你太容易把「這件事總要有人處理」變成自己的責任，久了就會覺得什麼都壓在自己身上。', authority: '你最不舒服的是失控、沒標準和別人反覆改變規則，這類環境會快速耗掉耐心。', intensity: '真正消耗你的是長期忍耐；如果邊界一直被踩，你往往先壓住，最後一次性爆掉。',
      reinvention: '你在不適合的環境裡可以撐一段時間，但撐到臨界點會很想全部推翻，所以最好提早做小幅調整。', decisive: '你平時可以忍，但一旦進入高壓決策狀態會變得很硬，需要記得給自己留下恢復空間。',
    },
    phase: {
      命: '這個十年重點放在重新定義自己：哪些事還值得做、哪些角色已經不必再維持。', 兄弟: '這個十年會更明顯地篩選同輩、團隊和合作方式，誰能一起走比認識多少人更重要。',
      夫妻: '這個十年關係與合作是重要主題，重點不是有沒有關係，而是關係本身是否成熟、平衡。', 子女: '這個十年更適合把想法變成作品、項目或可以留下來的成果。',
      財帛: '這個十年現實資源與收入結構會成為主題，適合把能力變成更穩定、可重複的價值。', 疾厄: '這個十年需要重新安排生活節奏與恢復方式，避免一直靠硬撐維持輸出。',
      遷移: '這個十年外部環境、移動與新圈子帶來的影響更大，很多機會不會只在原本的位置出現。', 交友: '這個十年人脈與合作品質很重要，真正有用的是可靠關係，而不是社交數量。',
      官祿: '這個十年事業位置與責任感會被放大，適合把專業做成更清楚的位置，而不是什麼都接。', 田宅: '這個十年更重視生活根基、居住與長期安全感，先把底盤整理好會讓其他選擇更穩。',
      福德: '這個十年真正要整理的是內在節奏與優先順序，外面做得再多，也要確認自己還願不願意這樣過。', 父母: '這個十年會更常碰到家庭、長輩、制度或責任傳承的議題，需要把自己的邊界也一起立起來。',
    } as Record<string, string>,
    yearlyIntro: (year: number) => `${year} 年更像是把當前十年主題拉近到眼前的一年。`,
    yearlyGood: '今年有些事情會比較容易推進，適合把有效的方法做得更集中，不必同時開太多戰線。',
    yearlyPressure: '今年也有一個需要主動處理的卡點；越早把責任、期限或界線說清楚，越不容易拖成長期消耗。',
    closing: '真正對你有利的，不是把所有可能都抓住，而是把最值得的那幾件事做深、做穩。',
  },
  'zh-Hans': null,
  en: null,
} as const;

const HANS_MAP: Record<string, string> = { 裡: '里', 這: '这', 個: '个', 會: '会', 讓: '让', 來: '来', 說: '说', 與: '与', 為: '为', 對: '对', 過: '过', 開: '开', 還: '还', 點: '点', 業: '业', 財: '财', 關: '关',係:'系', 壓:'压', 態:'态',選:'选',擇:'择',實:'实',現:'现',適:'适',長:'长',變:'变',轉:'转',穩:'稳',發:'发',現:'现',間:'间',邊:'边',際:'际',裡:'里',較:'较',經:'经',驗:'验',價:'价',值:'值',與:'与',體:'体',慮:'虑',務:'务',責:'责',權:'权',認:'认',後:'后',話:'话',進:'进',處:'处',學:'学',習:'习',顯:'显',環:'环',境:'境',質:'质',量:'量',復:'复',斷:'断',線:'线',願:'愿',應:'应',該:'该',屬:'属',標:'标',準:'准',維:'维',護:'护',總:'总',結:'结',簡:'简',單:'单',專:'专',門:'门',從:'从',內:'内',歲:'岁',當:'当',時:'时',將:'将',無:'无',種:'种',給:'给',別:'别',問題:'问题' };

function toHans(text: string): string {
  return Array.from(text).map((char) => HANS_MAP[char] ?? char).join('');
}

const EN_TONES: Record<ToneKey, [string, string]> = {
  authority: ['You prefer to understand the direction for yourself rather than being led indefinitely by someone else.', 'You have clear standards, and when a situation lacks structure you often end up taking responsibility for it.'],
  strategy: ['You think quickly, compare options and usually prefer to understand the moving parts before committing.', 'That adaptability is useful, although too many open possibilities can keep your mind running long after the decision is due.'],
  visibility: ['You often handle responsibility better once you are actually in the position rather than standing on the sidelines imagining it.', 'Results and usefulness matter to you, and you can end up carrying more of other people’s expectations than you intended.'],
  practical: ['You are practical about effort, resources and whether something is actually worth doing.', 'You tend to respect methods that produce a real result rather than ideas that never become usable.'],
  ease: ['You function better when daily life is reasonably calm and cooperative rather than permanently confrontational.', 'You usually have a softer way with people, although avoiding conflict for too long can postpone a necessary conversation.'],
  intensity: ['You have definite likes, dislikes and personal boundaries, even if you do not announce them immediately.', 'You can adapt, but prolonged ambiguity, inconsistency or insincerity wears you down quickly.'],
  stability: ['You are better at making something steadily stronger than relying on one burst of momentum.', 'Security, resources and sustainability matter, and you usually perform best when you have enough control over the pace.'],
  sensitivity: ['You pick up atmosphere, detail and shifts in other people faster than you may realise.', 'You need a certain level of calm and security; noisy or unstable environments cost you more energy than they appear to.'],
  appetite: ['You need some variety, discovery and movement in life rather than the same rhythm indefinitely.', 'You are good at noticing possibilities, but too many interesting options can split your attention and resources.'],
  analysis: ['You notice contradictions and weak logic quickly and are unlikely to accept something simply because everyone else does.', 'That critical thinking is valuable, but under stress you can spend too long examining a single conversation or problem.'],
  coordination: ['Fairness, proportion and good cooperation matter to you, and you are often good at connecting different people or needs.', 'You work best with mature collaborators and clear processes rather than force and unnecessary drama.'],
  responsibility: ['You easily become the person who notices what still needs to be finished or looked after.', 'You can carry responsibility well, but you need to notice when somebody else’s problem has quietly become yours.'],
  decisive: ['When a real decision has to be made, you can be much more decisive than people expect.', 'You work better with clear authority and clear goals than in environments where everything is delayed indefinitely.'],
  reinvention: ['Your life is unlikely to stay in one fixed form forever; when a structure stops fitting, you feel a strong need to rebuild it.', 'One of your real strengths is knowing when improving the old system is no longer enough.'],
};

const EN_WORK: Partial<Record<ToneKey, string>> = {
  authority: 'At work, you do better when you are trusted to make judgement calls and set priorities; constant micromanagement drains you.',
  strategy: 'Work that involves analysis, planning and adjustment suits you better than endless repetition.',
  visibility: 'You can build a stronger position in roles where responsibility, client contact or visible outcomes matter.',
  practical: 'Your value comes from making things work in practice: accuracy, efficiency and measurable results matter more than noise.',
  stability: 'You benefit from work that compounds over time through reputation, repeat clients, resources or specialist skill.',
  sensitivity: 'Your eye for quality and detail can become a real advantage when the work rewards precision rather than speed alone.',
  appetite: 'You need enough variety and growth to stay engaged; completely closed roles with no room to evolve become stale quickly.',
  analysis: 'You are well suited to work that requires judgement, diagnosis of problems, negotiation or explaining complexity clearly.',
  coordination: 'A major strength is connecting people, process and expectations; the quality of collaborators matters greatly.',
  responsibility: 'You are often trusted with difficult work, but should avoid becoming the permanent person who repairs everyone else’s mistakes.',
  decisive: 'Clear goals and genuine decision-making authority bring out your efficiency.', reinvention: 'You can be effective in rebuilding systems, launching new approaches or changing a structure that has stopped working.',
  intensity: 'Clear rules and clean responsibility lines suit you; vague ownership and repeated reversals are especially frustrating.', ease: 'A sustainable pace and sane relationships at work matter more to your performance than constant pressure.',
};

const EN_MONEY: Partial<Record<ToneKey, string>> = {
  practical: 'With money, you pay attention to value and return. Reliable, repeatable skill is a better foundation for you than vague promises.',
  stability: 'You generally benefit from securing dependable cash flow and a solid base before taking bigger financial risks.',
  appetite: 'You are willing to spend on experiences, interests or new possibilities, so the main discipline is not scattering resources across too many options.',
  sensitivity: 'Quality, comfort and security influence your spending more than simply finding the cheapest option.',
  authority: 'You feel calmer when you understand and control your own financial structure rather than leaving it vague.',
  strategy: 'You tend to compare options before committing, which is useful as long as analysis does not delay every practical decision.',
};

const EN_RELATION: Partial<Record<ToneKey, string>> = {
  stability: 'In close relationships, reliability and consistent effort matter more to you than an intense beginning.',
  sensitivity: 'You notice small changes in tone and behaviour, so clear communication and emotional safety matter a lot.',
  coordination: 'Respect, fairness and mutual effort are central for you; a relationship that stays one-sided becomes exhausting.',
  intensity: 'You have little patience for prolonged mixed signals. Once trust drops, you tend to pull your investment back quickly.',
  appetite: 'You need some freshness and shared experience in a relationship; too much restriction or stagnation can make you disengage.',
  analysis: 'You read details closely and can replay conversations in your head, so the right partner for you needs to communicate directly.',
  authority: 'You dislike being controlled and also struggle with people who have no direction of their own; mutual independence works better.',
  ease: 'You want a relationship to feel liveable and kind, but avoiding every difficult conversation can create a bigger problem later.',
};

const EN_PRESSURE: Partial<Record<ToneKey, string>> = {
  strategy: 'What drains you is often not the task itself but a mind that keeps running through every possible version of it.',
  analysis: 'Unclear problems and unresolved conversations can occupy more mental space than they deserve.',
  sensitivity: 'Atmosphere, interpersonal tension and the quality of your surroundings affect your energy more than you may admit.',
  responsibility: 'You can turn “somebody has to deal with this” into your personal responsibility too easily.',
  authority: 'Loss of control, poor standards and constantly changing rules are particularly draining for you.',
  intensity: 'Long periods of swallowing frustration are harder on you than one direct conversation would be.',
  reinvention: 'You can tolerate a poor fit for a while, then suddenly want to replace the whole structure; smaller earlier adjustments are usually easier.',
  decisive: 'Under prolonged pressure you can become very hard and task-focused, so recovery time matters.',
};

const EN_PHASE: Record<string, string> = {
  命: 'This longer phase is about redefining your own direction and deciding which roles still belong in your life.',
  兄弟: 'This longer phase puts more emphasis on peers, teams and collaboration. Who you build with matters more than how many people you know.',
  夫妻: 'Partnership is a major theme in this phase. The real question is whether important relationships are mature, balanced and workable.',
  子女: 'This longer phase favours turning ideas into projects, work or something tangible that can continue beyond the initial inspiration.',
  財帛: 'Income structure and practical resources are a major theme now. It is a good period for turning skill into more repeatable value.',
  疾厄: 'This phase asks for a more sustainable pace and better recovery habits rather than relying on endurance alone.',
  遷移: 'External change, movement and new environments matter more in this phase; not every opportunity will come from your existing setting.',
  交友: 'Networks and collaborators matter now, but quality and reliability are more useful than social volume.',
  官祿: 'Career position and responsibility are amplified in this phase. The priority is to make your expertise clearer rather than simply taking on more.',
  田宅: 'This phase puts more weight on your home base, stability and long-term foundations. A stronger base makes other decisions easier.',
  福德: 'The deeper task of this phase is to reset your internal pace and priorities, not simply keep increasing output.',
  父母: 'Family, authority, institutions or inherited responsibilities become more noticeable in this phase, making boundaries especially important.',
};

function majorStarsAt(chart: ZiweiCoreChart, palaceName: string): string[] {
  const palace = chart.palaces.find((item) => item.name === palaceName);
  if (!palace) return [];
  return Object.entries(chart.majorStars).filter(([, branch]) => branch === palace.branch).map(([star]) => star);
}

function supportingMajorStars(chart: ZiweiCoreChart, palaceName: string): string[] {
  const palace = chart.palaces.find((item) => item.name === palaceName);
  if (!palace) return [];
  const p = palaceIndexOf(palace.branch);
  const targets = new Set([p, mod12(p + 4), mod12(p + 6), mod12(p + 8)]);
  return Object.entries(chart.majorStars)
    .filter(([, branch]) => targets.has(palaceIndexOf(branch)))
    .map(([star]) => star);
}

function tonesFor(chart: ZiweiCoreChart, palaceName: string, max = 2): ToneKey[] {
  const exact = majorStarsAt(chart, palaceName);
  const source = exact.length ? exact : supportingMajorStars(chart, palaceName);
  return source.map((star) => STAR_TONE[star]).filter(Boolean).slice(0, max);
}

function firstTone(chart: ZiweiCoreChart, palaceName: string): ToneKey {
  return tonesFor(chart, palaceName, 1)[0] ?? 'stability';
}

function activeDecadal(extension: ZiweiTruthExtension, index: number | null): ZiweiDecadal | null {
  return index == null ? null : extension.decadals[index] ?? null;
}

function natalPalaceNameForBranch(chart: ZiweiCoreChart, branch: string): string | null {
  return chart.palaces.find((item) => item.branch === branch)?.name ?? null;
}

function yearlySignal(events: ZiweiMutagenEvent[] | undefined, transformation: '祿' | '忌'): ZiweiMutagenEvent | null {
  return events?.find((item) => item.transformation === transformation) ?? null;
}

function evidenceForStars(chart: ZiweiCoreChart, palaceName: string, source: ZiweiPlainEvidence['source']): ZiweiPlainEvidence {
  const stars = majorStarsAt(chart, palaceName);
  const fallback = stars.length ? stars : supportingMajorStars(chart, palaceName);
  return { source, signal: `${palaceName}:${fallback.join('+') || 'no-major-star'}` };
}

export function buildZiweiPlainSummary(input: SummaryInput): ZiweiPlainSummary {
  const { chart, extension, locale, activeDecadalIndex, targetYear } = input;
  const lifeTones = tonesFor(chart, '命', 2);
  const lifePrimary = lifeTones[0] ?? 'stability';
  const lifeSecondary = lifeTones[1] ?? firstTone(chart, chart.palaces.find((item) => item.isBodyPalace)?.name ?? '福德');
  const workTone = firstTone(chart, '官祿');
  const moneyTone = firstTone(chart, '財帛');
  const relationTone = firstTone(chart, '夫妻');
  const innerTone = firstTone(chart, '福德');
  const decadal = activeDecadal(extension, activeDecadalIndex);
  const decadalNatalName = decadal ? natalPalaceNameForBranch(chart, decadal.branch) : null;
  const yearGood = yearlySignal(extension.yearly?.mutagens, '祿');
  const yearPressure = yearlySignal(extension.yearly?.mutagens, '忌');

  const evidence: ZiweiPlainEvidence[] = [
    evidenceForStars(chart, '命', 'natal'),
    evidenceForStars(chart, '官祿', 'work'),
    evidenceForStars(chart, '財帛', 'money'),
    evidenceForStars(chart, '夫妻', 'relationship'),
    evidenceForStars(chart, '福德', 'inner'),
  ];
  if (decadal) evidence.push({ source: 'decadal', signal: `${decadal.ageStart}-${decadal.ageEnd}:${decadal.branch}:${decadalNatalName ?? 'unknown'}` });
  if (extension.yearly) evidence.push({ source: 'yearly', signal: `${targetYear}:${extension.yearly.stem}${extension.yearly.branch}:祿→${yearGood?.natalPalaceName ?? 'none'};忌→${yearPressure?.natalPalaceName ?? 'none'}` });

  if (locale === 'en') {
    const paragraphs = [
      `${EN_TONES[lifePrimary][0]} ${EN_TONES[lifeSecondary][1]}`,
      EN_WORK[workTone] ?? EN_WORK.stability!,
      EN_MONEY[moneyTone] ?? EN_MONEY.stability!,
      EN_RELATION[relationTone] ?? EN_RELATION.stability!,
      `The part most likely to wear you down is this: ${EN_PRESSURE[innerTone] ?? EN_PRESSURE.responsibility!}`,
      [decadalNatalName ? EN_PHASE[decadalNatalName] : 'Your current longer phase is more about consolidating what works than adding commitments automatically.', `For ${targetYear}, the chart brings that longer theme into a more immediate set of choices.`, yearGood ? 'There is a genuine area of easier movement this year, so concentrate effort where momentum is already visible rather than spreading yourself thin.' : '', yearPressure ? 'There is also one pressure point that needs direct handling; clearer limits, responsibilities and timing will prevent it becoming a long drain.' : ''].filter(Boolean).join(' '),
    ];
    return { version: 'zhaowu_ziwei_plain_summary_v1', locale, title: 'Your Zi Wei Summary', paragraphs, closing: 'Your best results come from choosing fewer things deliberately, then making those choices difficult to replace.', internalEvidence: evidence };
  }

  const zh = COPY['zh-Hant'];
  const core = `${zh.tones[lifePrimary][0]}${zh.tones[lifeSecondary][1]}`;
  const work = `${zh.workLead}${zh.work[workTone] ?? zh.work.stability}`;
  const money = `${zh.moneyLead}${zh.money[moneyTone as keyof typeof zh.money] ?? zh.money.stability}`;
  const relation = `${zh.relationLead}${zh.relation[relationTone as keyof typeof zh.relation] ?? zh.relation.stability}`;
  const pressure = `${zh.innerLead}${zh.pressure[innerTone as keyof typeof zh.pressure] ?? zh.pressure.responsibility}`;
  const phaseParts = [decadalNatalName ? zh.phase[decadalNatalName] : '現在這個十年更適合先把已經有效的東西做穩，不必為了變化而增加更多承諾。', zh.yearlyIntro(targetYear), yearGood ? zh.yearlyGood : '', yearPressure ? zh.yearlyPressure : ''].filter(Boolean);
  const paragraphs = [core, work, money, relation, pressure, phaseParts.join('')];

  if (locale === 'zh-Hans') {
    return { version: 'zhaowu_ziwei_plain_summary_v1', locale, title: '紫微白话总解', paragraphs: paragraphs.map(toHans), closing: toHans(zh.closing), internalEvidence: evidence };
  }
  return { version: 'zhaowu_ziwei_plain_summary_v1', locale, title: zh.title, paragraphs, closing: zh.closing, internalEvidence: evidence };
}
