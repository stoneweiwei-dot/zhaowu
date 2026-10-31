/** Display schedule only. Never used by the calendar or chart engine.
 * Dates follow the owner-approved 2026 pack; 00:01 Sydney is NOT the astronomical term instant.
 * Add a future term only after its real artwork and theme have passed acceptance.
 */
export const SEASONAL_AUTO_ID = 'solar-auto';
export const FROST_SKIN_ID = 'solar-frost-descent';
type L3 = { 'zh-Hant': string; 'zh-Hans': string; en: string };
const l3 = (hant: string, hans: string, en: string): L3 => ({ 'zh-Hant': hant, 'zh-Hans': hans, en });
const base = '/theme-skins/solar-frost-descent/';
export const FROST_PHASES = [
  { start: '2026-10-23T00:01:00+11:00', art: `${base}hero-frost-descent.webp`, name: l3('豺乃祭獸', '豺乃祭兽', 'Jackals Present Their Prey'), quote: l3('知進是勇，知止亦是智慧。', '知进是勇，知止亦是智慧。', 'Knowing when to advance takes courage; knowing when to stop takes wisdom.') },
  { start: '2026-10-28T00:01:00+11:00', art: `${base}option-ginkgo-stream-20261031.webp`, name: l3('草木黃落', '草木黄落', 'Leaves and Grasses Turn Yellow'), quote: l3('葉落不為失去，是把生長交還土地。', '叶落不为失去，是把生长交还土地。', 'A falling leaf is not a loss; it returns growth to the earth.') },
  { start: '2026-11-02T00:01:00+11:00', art: `${base}option-still-valley.webp`, name: l3('蟄蟲咸俯', '蛰虫咸俯', 'Hibernating Creatures Settle Down'), quote: l3('懂得收斂的人，才守得住下一次生發。', '懂得收敛的人，才守得住下一次生发。', 'Those who know when to withdraw can protect their next beginning.') },
] as const;
export const FROST_END = '2026-11-07T00:01:00+11:00';
export const FROST_SECTIONS = ['today-guide', 'deep-reading', 'report-cover', 'login-wash', 'account-wash', 'spirit-slip', 'loading-state', 'empty-state'] as const;

/**
 * Traditional North-hemisphere 24 solar terms and 72 pentads.
 * Names follow the traditional Chinese 月令七十二候系; they are cultural
 * seasonal imagery, not predictions of Sydney ecology or meteorology.
 * Source names: 中國農業博物館; solar longitude: NAOJ / 定氣法.
 * Website design switch: 00:01 on Sydney's civil date containing the
 * astronomical event, intentionally NOT the exact astronomical instant.
 *
 * Previously accepted Frost's Descent art is kept unmodified.
 * All other terms reuse EXISTING licensed/site local paintings: never
 * advertise them as 72 purpose-made paintings.
 */
export const SOLAR_TERMS_24 = [
  {month:1,day:5,longitude:285,zh:"小寒",hans:"小寒",en:"Minor Cold",skinId:"pine-ink",hou:[{"zh-Hant":"雁北鄉","zh-Hans":"雁北乡","en":"Wild geese turn north"},{"zh-Hant":"鵲始巢","zh-Hans":"鹊始巢","en":"Magpies begin nesting"},{"zh-Hant":"雉雊","zh-Hans":"雉雊","en":"Pheasants call"}]},
  {month:1,day:20,longitude:300,zh:"大寒",hans:"大寒",en:"Major Cold",skinId:"song-clear-dragon",hou:[{"zh-Hant":"雞乳","zh-Hans":"鸡乳","en":"Hens begin brooding"},{"zh-Hant":"征鳥厲疾","zh-Hans":"征鸟厉疾","en":"Birds of prey hunt fiercely"},{"zh-Hant":"水澤腹堅","zh-Hans":"水泽腹坚","en":"Ponds freeze deeply"}]},
  {month:2,day:4,longitude:315,zh:"立春",hans:"立春",en:"Start of Spring",skinId:"verdant-dragon",hou:[{"zh-Hant":"東風解凍","zh-Hans":"东风解冻","en":"East winds thaw the ice"},{"zh-Hant":"蟄蟲始振","zh-Hans":"蛰虫始振","en":"Dormant insects begin to stir"},{"zh-Hant":"魚陟負冰","zh-Hans":"鱼陟负冰","en":"Fish rise beneath the ice"}]},
  {month:2,day:19,longitude:330,zh:"雨水",hans:"雨水",en:"Rain Water",skinId:"verdant-mist",hou:[{"zh-Hant":"獺祭魚","zh-Hans":"獭祭鱼","en":"Otters display their catch"},{"zh-Hant":"候雁北","zh-Hans":"候雁北","en":"Migratory geese fly north"},{"zh-Hant":"草木萌動","zh-Hans":"草木萌动","en":"Plants begin to sprout"}]},
  {month:3,day:5,longitude:345,zh:"驚蟄",hans:"惊蛰",en:"Awakening of Insects",skinId:"verdant-pavilion",hou:[{"zh-Hant":"桃始華","zh-Hans":"桃始华","en":"Peach blossoms open"},{"zh-Hant":"倉庚鳴","zh-Hans":"仓庚鸣","en":"Orioles begin singing"},{"zh-Hant":"鷹化為鳩","zh-Hans":"鹰化为鸠","en":"Hawks become doves (traditional lore)"}]},
  {month:3,day:20,longitude:0,zh:"春分",hans:"春分",en:"Spring Equinox",skinId:"bamboo-falls",hou:[{"zh-Hant":"玄鳥至","zh-Hans":"玄鸟至","en":"Swallows arrive"},{"zh-Hant":"雷乃發聲","zh-Hans":"雷乃发声","en":"Thunder begins"},{"zh-Hant":"始電","zh-Hans":"始电","en":"Lightning first appears"}]},
  {month:4,day:5,longitude:15,zh:"清明",hans:"清明",en:"Pure Brightness",skinId:"song-rain-bank",hou:[{"zh-Hant":"桐始華","zh-Hans":"桐始华","en":"Paulownia blossoms"},{"zh-Hant":"田鼠化為鴽","zh-Hans":"田鼠化为鴽","en":"Field mice become quails (traditional lore)"},{"zh-Hant":"虹始見","zh-Hans":"虹始见","en":"Rainbows first appear"}]},
  {month:4,day:20,longitude:30,zh:"穀雨",hans:"谷雨",en:"Grain Rain",skinId:"lotus-boat",hou:[{"zh-Hant":"萍始生","zh-Hans":"萍始生","en":"Duckweed appears"},{"zh-Hant":"鳴鳩拂其羽","zh-Hans":"鸣鸠拂其羽","en":"Doves preen their wings"},{"zh-Hant":"戴勝降于桑","zh-Hans":"戴胜降于桑","en":"Hoopoes perch in mulberry trees"}]},
  {month:5,day:5,longitude:45,zh:"立夏",hans:"立夏",en:"Start of Summer",skinId:"dawn-dragon",hou:[{"zh-Hant":"螻蟈鳴","zh-Hans":"蝼蝈鸣","en":"Mole crickets sing"},{"zh-Hant":"蚯蚓出","zh-Hans":"蚯蚓出","en":"Earthworms surface"},{"zh-Hant":"王瓜生","zh-Hans":"王瓜生","en":"Wild cucumber grows"}]},
  {month:5,day:21,longitude:60,zh:"小滿",hans:"小满",en:"Grain Buds",skinId:"cloud-jade",hou:[{"zh-Hant":"苦菜秀","zh-Hans":"苦菜秀","en":"Bitter herbs flourish"},{"zh-Hant":"靡草死","zh-Hans":"靡草死","en":"Tender grasses wither"},{"zh-Hant":"麥秋至","zh-Hans":"麦秋至","en":"Wheat nears ripening"}]},
  {month:6,day:6,longitude:75,zh:"芒種",hans:"芒種",en:"Grain in Ear",skinId:"golden-phoenix",hou:[{"zh-Hant":"螳螂生","zh-Hans":"螳螂生","en":"Praying mantises hatch"},{"zh-Hant":"鵙始鳴","zh-Hans":"鵙始鸣","en":"Shrikes begin calling"},{"zh-Hant":"反舌無聲","zh-Hans":"反舌无声","en":"Mockingbird falls silent"}]},
  {month:6,day:21,longitude:90,zh:"夏至",hans:"夏至",en:"Summer Solstice",skinId:"petal-immortal",hou:[{"zh-Hant":"鹿角解","zh-Hans":"鹿角解","en":"Deer shed antlers"},{"zh-Hant":"蜩始鳴","zh-Hans":"蜩始鸣","en":"Cicadas begin singing"},{"zh-Hant":"半夏生","zh-Hans":"半夏生","en":"Pinellia sprouts"}]},
  {month:7,day:7,longitude:105,zh:"小暑",hans:"小暑",en:"Minor Heat",skinId:"golden-phoenix",hou:[{"zh-Hant":"溫風至","zh-Hans":"温风至","en":"Warm winds arrive"},{"zh-Hant":"蟋蟀居壁","zh-Hans":"蟋蟀居壁","en":"Crickets shelter near walls"},{"zh-Hant":"鷹始擊","zh-Hans":"鹰始击","en":"Young eagles learn to hunt"}]},
  {month:7,day:23,longitude:120,zh:"大暑",hans:"大暑",en:"Major Heat",skinId:"pink-lotus-stream",hou:[{"zh-Hant":"腐草為螢","zh-Hans":"腐草为萤","en":"Rotting grass becomes fireflies (lore)"},{"zh-Hant":"土潤溽暑","zh-Hans":"土润溽暑","en":"Humid earth steams"},{"zh-Hant":"大雨時行","zh-Hans":"大雨时行","en":"Heavy rains arrive"}]},
  {month:8,day:7,longitude:135,zh:"立秋",hans:"立秋",en:"Start of Autumn",skinId:"song-osmanthus",hou:[{"zh-Hant":"涼風至","zh-Hans":"凉风至","en":"Cool winds arrive"},{"zh-Hant":"白露降","zh-Hans":"白露降","en":"White dew descends"},{"zh-Hant":"寒蟬鳴","zh-Hans":"寒蝉鸣","en":"Autumn cicadas call"}]},
  {month:8,day:23,longitude:150,zh:"處暑",hans:"处暑",en:"End of Heat",skinId:"song-lotus-still",hou:[{"zh-Hant":"鷹乃祭鳥","zh-Hans":"鹰乃祭鸟","en":"Eagles display prey"},{"zh-Hant":"天地始肅","zh-Hans":"天地始肃","en":"Earth and sky grow solemn"},{"zh-Hant":"禾乃登","zh-Hans":"禾乃登","en":"Grains are harvested"}]},
  {month:9,day:7,longitude:165,zh:"白露",hans:"白露",en:"White Dew",skinId:"moon-lotus-boat",hou:[{"zh-Hant":"鴻雁來","zh-Hans":"鸿雁来","en":"Wild geese arrive"},{"zh-Hant":"玄鳥歸","zh-Hans":"玄鸟归","en":"Swallows depart"},{"zh-Hant":"群鳥養羞","zh-Hans":"群鸟养羞","en":"Birds store food"}]},
  {month:9,day:23,longitude:180,zh:"秋分",hans:"秋分",en:"Autumn Equinox",skinId:"song-gallery-frostleaf",hou:[{"zh-Hant":"雷始收聲","zh-Hans":"雷始收声","en":"Thunder becomes quiet"},{"zh-Hant":"蟄蟲坏戶","zh-Hans":"蛰虫坏户","en":"Insects seal their burrows"},{"zh-Hant":"水始涸","zh-Hans":"水始涸","en":"Waters begin to recede"}]},
  {month:10,day:8,longitude:195,zh:"寒露",hans:"寒露",en:"Cold Dew",skinId:"pine-ink",hou:[{"zh-Hant":"鴻雁來賓","zh-Hans":"鸿雁来宾","en":"Migrating geese visit"},{"zh-Hant":"雀入大水為蛤","zh-Hans":"雀入大水为蛤","en":"Sparrows become clams (traditional lore)"},{"zh-Hant":"菊有黃華","zh-Hans":"菊有黄华","en":"Yellow chrysanthemums bloom"}]},
  {month:10,day:23,longitude:210,zh:"霜降",hans:"霜降",en:"Frost’s Descent",skinId:"solar-frost-descent",hou:[{"zh-Hant":"豺乃祭獸","zh-Hans":"豺乃祭兽","en":"Jackals display their prey"},{"zh-Hant":"草木黃落","zh-Hans":"草木黄落","en":"Leaves turn yellow and fall"},{"zh-Hant":"蟄蟲咸俯","zh-Hans":"蛰虫咸俯","en":"Insects settle for winter"}]},
  {month:11,day:7,longitude:225,zh:"立冬",hans:"立冬",en:"Start of Winter",skinId:"song-clear-dragon",hou:[{"zh-Hant":"水始冰","zh-Hans":"水始冰","en":"Waters begin to freeze"},{"zh-Hant":"地始凍","zh-Hans":"地始冻","en":"Earth begins to freeze"},{"zh-Hant":"雉入大水為蜃","zh-Hans":"雉入大水为蜃","en":"Pheasants become clams (traditional lore)"}]},
  {month:11,day:22,longitude:240,zh:"小雪",hans:"小雪",en:"Minor Snow",skinId:"song-rain-bank",hou:[{"zh-Hant":"虹藏不見","zh-Hans":"虹藏不见","en":"Rainbows disappear"},{"zh-Hant":"天氣上升地氣下降","zh-Hans":"天气上升地气下降","en":"Sky rises and earth descends"},{"zh-Hant":"閉塞而成冬","zh-Hans":"闭塞而成冬","en":"Winter closes in"}]},
  {month:12,day:7,longitude:255,zh:"大雪",hans:"大雪",en:"Major Snow",skinId:"ink-dragon",hou:[{"zh-Hant":"鶡鴠不鳴","zh-Hans":"鹖鴠不鸣","en":"Cold-weather birds fall silent"},{"zh-Hant":"虎始交","zh-Hans":"虎始交","en":"Tigers begin mating"},{"zh-Hant":"荔挺出","zh-Hans":"荔挺出","en":"Iris shoots emerge"}]},
  {month:12,day:22,longitude:270,zh:"冬至",hans:"冬至",en:"Winter Solstice",skinId:"day-flute",hou:[{"zh-Hant":"蚯蚓結","zh-Hans":"蚯蚓结","en":"Earthworms curl together"},{"zh-Hant":"麋角解","zh-Hans":"麋角解","en":"Elk shed their antlers"},{"zh-Hant":"水泉動","zh-Hans":"水泉动","en":"Spring water begins to flow"}]}
] as const;
export type SolarTermSpec = (typeof SOLAR_TERMS_24)[number];
export type Hemisphere = 'north' | 'south' | 'unknown';
/** Select a roughly opposite-season existing painting, never alter the real term. */
export function seasonalVisualSkinId(term: SolarTermSpec, hemisphere: Hemisphere): string {
  if (hemisphere !== 'south') return term.skinId;
  const index = SOLAR_TERMS_24.indexOf(term);
  return index < 0 ? term.skinId : SOLAR_TERMS_24[(index + 12) % 24].skinId;
}
const MS_DAY = 86_400_000;
const sydneyDayFormatter = new Intl.DateTimeFormat("en-GB", {timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit"});
function sydneyDay(instant: Date): string {
  const parts = Object.fromEntries(sydneyDayFormatter.formatToParts(instant).map(part => [part.type,part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function civilDayIndex(date: string): number {
  const [year,month,day]=date.split("-").map(Number);
  return Math.round(Date.UTC(year,month-1,day)/MS_DAY);
}
function modulo360(value: number): number {return ((value % 360)+360)%360;}
function apparentSolarLongitude(epochMs: number): number {
  const T = (epochMs/MS_DAY + 2440587.5 - 2451545)/36525;
  const L0=modulo360(280.46646 + 36000.76983*T + 0.0003032*T*T);
  const M=modulo360(357.52911 + 35999.05029*T - 0.0001537*T*T)*Math.PI/180;
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)
    +(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);
  const omega=(125.04-1934.136*T)*Math.PI/180;
  return modulo360(L0+C-0.00569-0.00478*Math.sin(omega));
}
/** Approximate astronomical instant used ONLY to choose the local calendar date.
 * Typical error is a few minutes. Never feed this result into 命盤 / 八字 calculations.
 */
export function solarTermInstant(year: number, longitude: number, month: number, day: number): Date {
  if (!Number.isInteger(year) || year<1900 || year>2100) throw new RangeError("Solar term year outside verified 1900–2100 range");
  let ms=Date.UTC(year,month-1,day,0,0,0);
  for(let i=0;i<8;i++){
    const angularError=modulo360(longitude-apparentSolarLongitude(ms)+180)-180;
    ms+=angularError*(365.2422/360)*MS_DAY;
  }
  return new Date(ms);
}
const yearlyCache = new Map<number, {spec:SolarTermSpec;date:string;day:number}[]>();
export function solarTermsForYear(year:number) {
  if (!yearlyCache.has(year)) {
    yearlyCache.set(year,SOLAR_TERMS_24.map(spec=>{
      const date=sydneyDay(solarTermInstant(year,spec.longitude,spec.month,spec.day));
      return {spec,date,day:civilDayIndex(date)};
    }));
  }
  return yearlyCache.get(year)!;
}
export function seasonalState(now=new Date()) {
  const localDate=sydneyDay(now);
  const today=civilDayIndex(localDate);
  const year=Number(localDate.slice(0,4));
  // At 00:00–00:00:59 local time the old theme remains; switch at 00:01.
  const minuteFormatter=new Intl.DateTimeFormat("en-GB",{timeZone:"Australia/Sydney",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
  const hmp=Object.fromEntries(minuteFormatter.formatToParts(now).map(part=>[part.type,part.value]));
  const localBeforeMinute=Number(hmp.hour)===0 && Number(hmp.minute)===0;
  const effectiveDay=today-(localBeforeMinute?1:0);
  const all=[...solarTermsForYear(year-1),...solarTermsForYear(year),...solarTermsForYear(year+1)];
  let current=all[0],next=all[all.length-1];
  for(const entry of all){
    if(entry.day<=effectiveDay)current=entry;
    else {next=entry;break;}
  }
  const daysInto=effectiveDay-current.day;
  // A pentad is a traditional ~5-day division: days 0–4, 5–9,
  // then day 10 until the following solar term, avoiding gaps.
  const houIndex=Math.min(2,Math.max(0,Math.floor(daysInto/5)));
  const phase=current.spec.hou[houIndex];
  return {term:current.spec,hou:phase,houIndex,daysInto,termDate:current.date,nextTermDate:next.date,
    localDate, artworkKind:current.spec.skinId===FROST_SKIN_ID?"dedicated":"existing-artwork" as "dedicated"|"existing-artwork"};
}
/** Resolve one of the 24 entire pre-existing themed painting systems. */

export function seasonalSkinId(now = new Date()): string {
  return seasonalState(now).term.skinId;
}
export function frostEdition(now = new Date()) {
  const phase = [...FROST_PHASES].reverse().find(p => now.getTime() >= Date.parse(p.start)) ?? FROST_PHASES[0];
  return { ...phase, current: now.getTime() >= Date.parse(FROST_PHASES[0].start) && now.getTime() < Date.parse(FROST_END) };
}
