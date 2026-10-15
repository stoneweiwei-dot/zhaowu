import { toSimplifiedCustomerText } from "../report/reading-locale";

export type SacredDayLocale = "zh-Hant" | "zh-Hans" | "en";
type Tradition = "佛教" | "道教" | "儒家" | "民間信仰" | "基督宗教" | "東正教";
type Observance = { calendar:"lunar"|"solar"; month:number; day:number; tradition:Tradition; hant:string; en:string };

// Commonly observed dates, based on temple and Buddhist observance calendars.
// Local temples and lineages may use additional dates or variants.
// https://www.lungshan.org.tw/tw/02_3_birthday.php
// https://www.fgsbmc.org.tw/tw/exhibition.aspx?serno=15
// https://www.lingyinsi.com/detail_14731.html
// https://tct.gov.taipei/
const rows: readonly (readonly [Observance["calendar"],number,number,Tradition,string,string])[] = [
["lunar",1,1,"佛教","彌勒菩薩聖誕","Maitreya Bodhisattva's birthday"],
["lunar",1,9,"道教","玉皇上帝聖誕","Jade Emperor's birthday"],
["lunar",1,13,"民間信仰","關聖帝君飛昇","Guandi's ascension"],
["lunar",1,15,"道教","上元天官聖誕","Heavenly Official of Upper Yuan"],
["lunar",1,20,"民間信仰","池頭夫人千秋","Lady Chitou's observance"],
["lunar",2,2,"民間信仰","福德正神聖誕","Earth God (Fude Zhengshen)"],
["lunar",2,3,"道教","文昌帝君聖誕","Wenchang Emperor's birthday"],
["lunar",2,8,"佛教","釋迦牟尼佛出家日","Buddha's renunciation"],
["lunar",2,15,"佛教","釋迦牟尼佛涅槃日","Buddha's Parinirvana"],
["lunar",2,15,"道教","太上老君聖誕（道教節）","Taishang Laojun's birthday (Taoist Day)"],
["lunar",2,19,"佛教","觀世音菩薩聖誕","Guanyin Bodhisattva's birthday"],
["lunar",2,21,"佛教","普賢菩薩聖誕","Samantabhadra Bodhisattva's birthday"],
["lunar",3,3,"道教","玄天上帝聖誕","Xuantian Emperor's birthday"],
["lunar",3,15,"道教","武財神趙公明聖誕","Zhao Gongming, God of Wealth"],
["lunar",3,19,"民間信仰","太陽星君千秋","Solar Star Lord's observance"],
["lunar",3,16,"佛教","準提菩薩聖誕","Cundi Bodhisattva's birthday"],
["lunar",3,20,"民間信仰","註生娘娘千秋","Birth-Giving Goddess's observance"],
["lunar",3,23,"民間信仰","天上聖母（媽祖）聖誕","Mazu's birthday"],
["lunar",4,4,"佛教","文殊菩薩聖誕","Manjushri Bodhisattva's birthday"],
["lunar",4,8,"佛教","釋迦牟尼佛聖誕（佛誕）","Buddha's birthday (Han tradition)"],
["lunar",4,14,"道教","呂洞賓祖師聖誕","Lü Dongbin's birthday"],
["lunar",4,18,"民間信仰","華佗仙師千秋","Hua Tuo's observance"],
["lunar",4,28,"佛教","藥王菩薩聖誕","Medicine King Bodhisattva's birthday"],
["lunar",5,5,"民間信仰","端午節","Dragon Boat Festival"],
["lunar",5,13,"民間信仰","城隍爺千秋（部分地區）","City God (regional observance)"],
["lunar",5,13,"佛教","伽藍菩薩聖誕","Sangharama Bodhisattva's birthday"],
["lunar",6,3,"佛教","韋馱尊者聖誕","Skanda Bodhisattva's birthday"],
["lunar",6,19,"佛教","觀世音菩薩成道日","Guanyin's enlightenment"],
["lunar",6,24,"道教","關聖帝君聖誕","Guandi's birthday"],
["lunar",7,7,"民間信仰","魁星爺千秋","Kui Xing's observance"],
["lunar",7,13,"佛教","大勢至菩薩聖誕","Mahasthamaprapta Bodhisattva's birthday"],
["lunar",7,15,"佛教","盂蘭盆節／僧自恣日","Ullambana / Buddhist Sangha Day"],
["lunar",7,15,"道教","中元地官聖誕","Earth Official of Middle Yuan"],
["lunar",7,15,"民間信仰","中元普度","Ghost Festival / Zhongyuan"],
["lunar",7,29,"佛教","地藏菩薩聖誕（部分寺院）","Ksitigarbha's birthday (some temples)"],
["lunar",7,30,"佛教","地藏菩薩聖誕（部分寺院）","Ksitigarbha's birthday (some temples)"],
["lunar",8,15,"民間信仰","太陰娘娘千秋","Moon Goddess's observance"],
["lunar",8,15,"民間信仰","月老神君千秋","Matchmaker God's observance"],
["lunar",8,22,"佛教","燃燈佛聖誕","Dipankara Buddha's birthday"],
["lunar",8,27,"儒家","孔子誕辰（傳統農曆紀日）","Confucius's birthday (traditional lunar date)"],
["lunar",9,9,"道教","斗姆元君聖誕","Doumu Yuanjun's birthday"],
["lunar",9,15,"儒家","紫陽夫子（朱熹）千秋（龍山寺紀日）","Master Ziyang (Zhu Xi), Longshan Temple observance"],
["lunar",9,19,"佛教","觀世音菩薩出家日","Guanyin's renunciation"],
["lunar",9,29,"佛教","藥師琉璃光如來聖誕（小月廿九）","Medicine Buddha (short lunar month)"],
["lunar",9,30,"佛教","藥師琉璃光如來聖誕","Medicine Buddha's birthday"],
["lunar",10,10,"民間信仰","水仙尊王千秋（龍山寺紀日）","Water Immortal Lords (Longshan Temple)"],
["lunar",10,15,"道教","下元水官聖誕","Water Official of Lower Yuan"],
["lunar",11,17,"佛教","阿彌陀佛聖誕","Amitabha Buddha's birthday"],
["lunar",12,8,"佛教","釋迦牟尼佛成道日（法寶節）","Buddha's enlightenment (Dharma Treasure Day)"],
["lunar",12,16,"民間信仰","尾牙謝土地公","Year-end Earth God thanksgiving"],
["lunar",12,23,"民間信仰","送神／祭灶（北方多見）","Kitchen God farewell (common in northern China)"],
["lunar",12,24,"民間信仰","送神／祭灶（南方多見）","Kitchen God farewell (common in southern China)"],
["lunar",12,29,"佛教","華嚴菩薩聖誕","Huayan Bodhisattva's birthday"],
["solar",9,28,"儒家","孔子誕辰紀念暨祭孔（公曆）","Confucius's birthday and ceremony (solar date)"],
["solar",1,1,"基督宗教","天主之母節（天主教）","Mary, Mother of God (Catholic)"],
["solar",1,6,"基督宗教","主顯節（傳統日期；部分地區移至主日）","Epiphany (traditional fixed date; transferred in some regions)"],
["solar",1,7,"東正教","基督聖誕節（採儒略曆的教會）","Nativity of Christ (Julian-calendar churches)"],
["solar",1,19,"東正教","主顯節（採儒略曆的教會）","Theophany (Julian-calendar churches)"],
["solar",2,2,"基督宗教","獻耶穌於聖殿日","Presentation of Jesus at the Temple"],
["solar",3,19,"基督宗教","聖若瑟節（天主教）","Saint Joseph's Day (Catholic)"],
["solar",3,25,"基督宗教","聖母領報節（常規日期；可改期）","Annunciation (ordinary date; may transfer)"],
["solar",6,24,"基督宗教","洗者若翰誕辰（天主教）","Nativity of John the Baptist (Catholic)"],
["solar",6,29,"基督宗教","聖伯多祿及聖保祿宗徒節","Saints Peter and Paul"],
["solar",8,6,"基督宗教","主顯聖容節","Transfiguration of Jesus"],
["solar",8,15,"基督宗教","聖母蒙召升天節（天主教）","Assumption of Mary (Catholic)"],
["solar",9,8,"基督宗教","聖母誕辰（天主教及部分教會）","Nativity of Mary (Catholic and some churches)"],
["solar",9,14,"基督宗教","光榮十字聖架節","Exaltation of the Holy Cross"],
["solar",10,31,"基督宗教","宗教改革紀念日（部分新教）","Reformation Day (some Protestant churches)"],
["solar",11,1,"基督宗教","諸聖節","All Saints' Day"],
["solar",11,2,"基督宗教","追思已亡節（天主教）","All Souls' Day (Catholic)"],
["solar",12,6,"基督宗教","聖尼各老紀念日（部分教會）","Saint Nicholas Day (some churches)"],
["solar",12,8,"基督宗教","聖母無原罪始胎節（天主教）","Immaculate Conception (Catholic)"],
["solar",12,24,"基督宗教","聖誕前夕／平安夜","Christmas Eve"],
["solar",12,25,"基督宗教","耶穌基督聖誕節","Christmas / Nativity of Jesus Christ"],
["solar",12,26,"基督宗教","聖斯德望殉道日（部分教會）","Saint Stephen's Day (some churches)"],
["solar",12,28,"基督宗教","諸聖嬰孩殉道紀念（部分教會）","Holy Innocents (some churches)"],
] as const;


/** Gregorian Easter: Meeus/Jones/Butcher algorithm, Western churches. */
function westernEaster(year: number): Date {
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4;
 const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30;
 const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7;
 const m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;
 return new Date(Date.UTC(year,Math.floor(n/31)-1,n%31+1));
}
/** Julian Paschalion converted to the Gregorian civil date (1900–2099). */
function orthodoxEaster(year: number): Date {
 const a=year%4,b=year%7,c=year%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7;
 const n=d+e+114,month=Math.floor(n/31),day=n%31+1;
 return new Date(Date.UTC(year,month-1,day+13));
}
function isOffsetDay(date: Date, reference: Date, days: number): boolean {
 return date.getTime()===reference.getTime()+days*86400000;
}
function zhHans(value:string): string {
 const extra:Readonly<Record<string,string>>={爺:"爷",誕:"诞",薩:"萨",彌:"弥",齋:"斋",聖:"圣",韋:"韦",馱:"驮",註:"注",蘭:"兰",禮:"礼",獻:"献",嬰:"婴",無:"无",臨:"临",週:"周",穌:"稣",領:"领",節:"节",聯:"联",廿:"廿",陰:"阴",曆:"历",總:"总",嚴:"严",讚:"赞",尊:"尊",傳:"传",見:"见",華:"华",寶:"宝",歲:"岁",陽:"阳",風:"风",東:"东",崇:"崇",舊:"旧",靈:"灵",歸:"归",進:"进",顯:"显",歷:"历",禱:"祷",禎:"祯",寧:"宁",媽:"妈",龍:"龙",頭:"头",終:"终",莊:"庄",鏡:"镜",慶:"庆",飛:"飞",國:"国",間:"间",顧:"顾"};
 return [...toSimplifiedCustomerText(value)].map((char)=>extra[char]??char).join("");
}
function traditionLabel(tradition:Tradition,locale:SacredDayLocale):string {
 if(locale==="en")return ({佛教:"Buddhist",道教:"Taoist",儒家:"Confucian",民間信仰:"Folk",基督宗教:"Christian",東正教:"Eastern Orthodox"} as const)[tradition];
 return locale==="zh-Hans"?zhHans(tradition):tradition;
}
type SacredDayOptions={isLeapMonth?:boolean; isLunarMonthEnd?:boolean;year?:number};
/** Every returned observance is explicitly attributed; differing traditions may share a date. */
export function formatSacredDay(lunarMonth:number,lunarDay:number,locale:SacredDayLocale,solarMonthDay?:string,options:SacredDayOptions={}) {
 const matches=rows.filter((row)=>{
   if(row[0]==="solar") {
     if((row[3]==="東正教") && options.year!=null && options.year>=2100) return false;
     return solarMonthDay===`${row[1]}-${row[2]}`;
   }
   if(options.isLeapMonth || row[1]!==lunarMonth || row[2]!==lunarDay)return false;
   // The last-day variants must never be shown twice in a 30-day lunar month.
   const requiresLast=(row[1]===7 && /地藏/.test(row[4]))||(row[1]===9 && /藥師/.test(row[4]));
   return !requiresLast || options.isLunarMonthEnd===true;
 });
 const labels=matches.map((row)=>locale==="en"?`[${traditionLabel(row[3],locale)}] ${row[5]}`:`[${traditionLabel(row[3],locale)}] ${locale==="zh-Hans"?zhHans(row[4]):row[4]}`);
 if(options.year!=null&&options.year>=1900&&options.year<=2099&&solarMonthDay){
   const [month,day]=solarMonthDay.split("-").map(Number);
   const date=new Date(Date.UTC(options.year,month-1,day));
   const west=westernEaster(options.year),east=orthodoxEaster(options.year);
   const moving:readonly (readonly [number,"基督宗教"|"東正教",string,string,Date])[]=[
     [-46,"基督宗教","聖灰星期三（西方教會）","Ash Wednesday (Western churches)",west],
     [-7,"基督宗教","棕枝主日（西方教會）","Palm Sunday (Western churches)",west],
     [-3,"基督宗教","聖週四／主的晚餐（西方教會）","Maundy Thursday (Western churches)",west],
     [-2,"基督宗教","耶穌受難日（西方教會）","Good Friday (Western churches)",west],
     [0,"基督宗教","復活節／耶穌復活主日（西方教會）","Easter Sunday (Western churches)",west],
     [39,"基督宗教","耶穌升天節（傳統週四；部分地區移主日）","Ascension Thursday (some regions transfer to Sunday)",west],
     [49,"基督宗教","聖神降臨節／五旬節（西方教會）","Pentecost Sunday (Western churches)",west],
     [-7,"東正教","棕枝主日（東正教）","Palm Sunday (Eastern Orthodox)",east],
     [-2,"東正教","聖大星期五／基督受難（東正教）","Great and Holy Friday (Eastern Orthodox)",east],
     [0,"東正教","聖帕斯哈／基督復活節（東正教）","Holy Pascha (Eastern Orthodox)",east],
     [39,"東正教","基督升天節（東正教）","Ascension (Eastern Orthodox)",east],
     [49,"東正教","聖三一節／五旬節（東正教）","Pentecost (Eastern Orthodox)",east]
   ];
   for(const [offset,tradition,zh,en,base] of moving) {
     if(isOffsetDay(date,base,offset)) labels.push(`[${traditionLabel(tradition,locale)}] ${locale==="en"?en:locale==="zh-Hans"?zhHans(zh):zh}`);
   }
   // First Sunday of Advent: Sunday on or before 3 December.
   const dec3=new Date(Date.UTC(options.year,11,3));
   const advent=new Date(dec3.getTime()-dec3.getUTCDay()*86400000);
   if(date.getTime()===advent.getTime()){
      labels.push(`[${traditionLabel("基督宗教",locale)}] ${locale==="en"?"First Sunday of Advent":locale==="zh-Hans"?"将临期第一主日":"將臨期第一主日"}`);
   }
 }
 if(!labels.length&&[8,14,15,23,29,30].includes(lunarDay))
   labels.push(locale==="en"?"Traditional six fasting days":locale==="zh-Hans"?"传统六斋日":"傳統六齋日");
 if(!labels.length)labels.push(locale==="en"?"No major observance listed":locale==="zh-Hans"?"未列主要圣日":"未列主要聖日");
 return labels.join(locale==="en"?" · ":"｜");
}
/** Stable inventory for full entry-by-entry contract tests. */
export const SACRED_DAY_CASES = rows.map(([calendar,month,day,tradition,hant,en])=>({calendar,month,day,tradition,hant,en}));
export const SACRED_DAY_SOURCE_COUNT=rows.length;
export const SACRED_DAY_MOVABLE_COUNT=13;
