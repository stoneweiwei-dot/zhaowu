import type { Chart, Pillar } from './types';
import type { Locale } from '../i18n';

const STEMS: Record<string, string> = {甲:'Jia · Yang Wood',乙:'Yi · Yin Wood',丙:'Bing · Yang Fire',丁:'Ding · Yin Fire',戊:'Wu · Yang Earth',己:'Ji · Yin Earth',庚:'Geng · Yang Metal',辛:'Xin · Yin Metal',壬:'Ren · Yang Water',癸:'Gui · Yin Water'};
const BRANCHES: Record<string, string> = {子:'Zi · Rat',丑:'Chou · Ox',寅:'Yin · Tiger',卯:'Mao · Rabbit',辰:'Chen · Dragon',巳:'Si · Snake',午:'Wu · Horse',未:'Wei · Goat',申:'Shen · Monkey',酉:'You · Rooster',戌:'Xu · Dog',亥:'Hai · Pig'};
const TERMS: Record<string, string> = {
  木:'Wood',火:'Fire',土:'Earth',金:'Metal',水:'Water',日主:'Day Master',比肩:'Peer',劫財:'Competing Peer',食神:'Gentle Expression',傷官:'Independent Expression',正財:'Steady Resources',偏財:'Flexible Resources',正官:'Order and Responsibility',七殺:'Challenge and Drive',正印:'Structured Support',偏印:'Intuitive Support',
  長生:'Birth',沐浴:'Bathing',冠帶:'Coming of Age',臨官:'Taking Office',帝旺:'Peak',衰:'Decline',病:'Illness (cycle stage)',死:'Death (cycle stage)',墓:'Storage',絕:'Ending',胎:'Gestation',養:'Nurture',
  海中金:'Gold in the Sea',爐中火:'Fire in the Furnace',大林木:'Great Forest Wood',路旁土:'Roadside Earth',劍鋒金:'Sword-edge Metal',山頭火:'Fire on the Mountain',澗下水:'Water in the Ravine',城頭土:'City-wall Earth',白蠟金:'White-wax Metal',楊柳木:'Willow Wood',泉中水:'Spring Water',屋上土:'Rooftop Earth',霹靂火:'Thunderbolt Fire',松柏木:'Pine and Cypress Wood',長流水:'Ever-flowing Water',沙中金:'Gold in the Sand',山下火:'Fire Below the Mountain',平地木:'Wood on the Plain',壁上土:'Wall Earth',金箔金:'Gold-leaf Metal',覆燈火:'Lamplight Fire',天河水:'Celestial River Water',大驛土:'Great-road Earth',釵釧金:'Ornamental Metal',桑柘木:'Mulberry Wood',大溪水:'Great-stream Water',沙中土:'Sandy Earth',天上火:'Fire in the Sky',石榴木:'Pomegranate Wood',大海水:'Ocean Water',
};
const HANS: Record<string,string> = {'財':'财','傷':'伤','殺':'杀','長':'长','帶':'带','臨':'临','絕':'绝','養':'养','爐':'炉','劍':'剑','鋒':'锋','頭':'头','澗':'涧','蠟':'蜡','楊':'杨','燈':'灯','驛':'驿','釵':'钗','釧':'钏','時':'时','宮':'宫','運':'运','納':'纳','陰':'阴','陽':'阳'};
export function chartTerm(value: string, locale: Locale): string {
  if (!value || value === '未定' || value === '—') return '—';
  if (locale === 'en') return STEMS[value] ?? BRANCHES[value] ?? TERMS[value] ?? 'Not available';
  return locale === 'zh-Hans' ? [...value].map(c=>HANS[c]??c).join('') : value;
}
export function pillarName(key: Pillar['key'], locale: Locale): string {
  return ({year:['年柱','年柱','Year'],month:['月柱','月柱','Month'],day:['日柱','日柱','Day'],time:['時柱','时柱','Hour']} as const)[key][locale==='en'?2:locale==='zh-Hans'?1:0];
}
export function ganzhiLabel(value: string, locale: Locale): string {
  if (!value || value === '未定' || value === '—') return '—';
  return locale === 'en' ? `${STEMS[value[0]]?.split(' · ')[0]??''} ${BRANCHES[value[1]]?.split(' · ')[0]??''}`.trim() || '—' : value;
}
export function emptyBranches(value:string, locale:Locale):string {
  return locale==='en' ? [...value].map(v=>BRANCHES[v]?.split(' · ')[0]).filter(Boolean).join(' / ') || '—' : value;
}
export const UNKNOWN_TIME_COPY: Record<Locale,string> = {
  'zh-Hant':'出生時辰決定四柱中的時柱，也影響命宮、起運時間與細節判斷。未知時辰時，時柱、命宮和大運起運留白；判斷的不確定性會提高，更容易出現偏差。若生於節氣或換日前後，年月日柱也需再核對。',
  'zh-Hans':'出生时辰决定四柱中的时柱，也影响命宫、起运时间与细节判断。未知时辰时，时柱、命宫和大运起运留白；判断的不确定性会提高，更容易出现偏差。若生于节气或换日前后，年月日柱也需再核对。',
  en:'Birth time determines the hour pillar and affects the life palace, the start of luck cycles and detailed interpretation. Without it, these are left blank and the reading is less certain and more prone to error. Near a solar-term or day boundary, the other pillars also need checking.',
};
export function characterFacts(chart: Chart, locale: Locale): Array<[string,string]> {
  const en=locale==='en', hans=locale==='zh-Hans';
  const day=chart.pillars.find(p=>p.key==='day');
  return [
    [en?'Day Master':'日主',chartTerm(chart.dayMaster,locale)],
    [en?'Birth-month branch':'月令',chartTerm(chart.monthBranch,locale)],
    [en?'Day-pillar image':hans?'日柱纳音':'日柱納音',chartTerm(day?.nayin??'',locale)],
    [en?'Birth time':hans?'出生时辰':'出生時辰',chart.timeUnknown?(en?'Unknown · partial chart':hans?'未知 · 三柱参考':'未知 · 三柱參考'):(en?'Provided':hans?'已提供':'已提供')],
  ];
}
