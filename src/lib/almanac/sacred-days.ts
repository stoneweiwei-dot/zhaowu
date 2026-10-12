export type SacredDayLocale = "zh-Hant" | "zh-Hans" | "en";
type Tradition = "佛教" | "道教" | "儒家" | "民間信仰";
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
["lunar",2,19,"佛教","觀世音菩薩聖誕","Guanyin Bodhisattva's birthday"],
["lunar",2,21,"佛教","普賢菩薩聖誕","Samantabhadra Bodhisattva's birthday"],
["lunar",2,25,"民間信仰","三山國王千秋","Three Mountain Kings' observance"],
["lunar",3,3,"道教","玄天上帝聖誕","Xuantian Emperor's birthday"],
["lunar",3,15,"道教","武財神趙公明聖誕","Zhao Gongming, God of Wealth"],
["lunar",3,19,"民間信仰","太陽星君千秋","Solar Star Lord's observance"],
["lunar",3,20,"民間信仰","註生娘娘千秋","Birth-Giving Goddess's observance"],
["lunar",3,23,"民間信仰","天上聖母（媽祖）聖誕","Mazu's birthday"],
["lunar",4,2,"儒家","孟子誕辰（傳統紀念日）","Mencius (traditional observance)"],
["lunar",4,4,"佛教","文殊菩薩聖誕","Manjushri Bodhisattva's birthday"],
["lunar",4,8,"佛教","釋迦牟尼佛聖誕（佛誕）","Buddha's birthday (Han tradition)"],
["lunar",4,14,"道教","呂洞賓祖師聖誕","Lü Dongbin's birthday"],
["lunar",4,18,"民間信仰","華佗仙師千秋","Hua Tuo's observance"],
["lunar",5,5,"民間信仰","端午節","Dragon Boat Festival"],
["lunar",5,13,"民間信仰","城隍爺千秋（部分地區）","City God (regional observance)"],
["lunar",5,18,"道教","張天師聖誕","Celestial Master Zhang's birthday"],
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
["lunar",8,15,"民間信仰","太陰娘娘與月老千秋","Moon Goddess and Matchmaker God"],
["lunar",8,22,"佛教","燃燈佛聖誕","Dipankara Buddha's birthday"],
["lunar",8,27,"儒家","孔子誕辰（傳統農曆紀日）","Confucius's birthday (traditional lunar date)"],
["lunar",9,15,"儒家","朱熹誕辰紀念","Zhu Xi's observance"],
["lunar",9,19,"佛教","觀世音菩薩出家日","Guanyin's renunciation"],
["lunar",9,30,"佛教","藥師琉璃光如來聖誕","Medicine Buddha's birthday"],
["lunar",10,15,"道教","下元水官聖誕","Water Official of Lower Yuan"],
["lunar",11,17,"佛教","阿彌陀佛聖誕","Amitabha Buddha's birthday"],
["lunar",12,8,"佛教","釋迦牟尼佛成道日（法寶節）","Buddha's enlightenment (Dharma Treasure Day)"],
["lunar",12,16,"民間信仰","尾牙謝土地公","Year-end Earth God thanksgiving"],
["lunar",12,23,"民間信仰","送神／祭灶（北方多見）","Kitchen God farewell (common in northern China)"],
["lunar",12,24,"民間信仰","送神／祭灶（南方多見）","Kitchen God farewell (common in southern China)"],
["solar",9,28,"儒家","孔子誕辰紀念暨祭孔（公曆）","Confucius's birthday and ceremony (solar date)"],
] as const;

const SIMPLIFIED: Readonly<Record<string,string>> = Object.fromEntries(
  [..."彌觀薩誕傳齋聖釋關趙註媽國陽華韋馱勢蘭寶陰與燈藥師阿陀謝歲頭飛昇財呂張會曆紀念風見".split("")].map((c,i)=>[c,[..."弥观萨诞传斋圣释关赵注妈国阳华韦驮势兰宝阴与灯药师阿陀谢岁头飞升财吕张会历纪念风见"][i]])
);
function zhHans(value:string){ return [...value].map((c)=>SIMPLIFIED[c]??c).join(""); }
function traditionLabel(tradition:Tradition,locale:SacredDayLocale){
 if(locale==="en") return ({佛教:"Buddhist",道教:"Taoist",儒家:"Confucian",民間信仰:"Folk"} as const)[tradition];
 return locale==="zh-Hans"?zhHans(tradition):tradition;
}
export function formatSacredDay(lunarMonth:number,lunarDay:number,locale:SacredDayLocale,solarMonthDay?:string){
 const matches=rows.filter((row)=>row[0]==="lunar"?row[1]===lunarMonth&&row[2]===lunarDay:solarMonthDay===`${row[1]}-${row[2]}`);
 const labels=matches.map((row)=>locale==="en"?`[${traditionLabel(row[3],locale)}] ${row[5]}`:`[${traditionLabel(row.tradition,locale)}] ${locale==="zh-Hans"?zhHans(row[4]):row.hant}`);
 if(!labels.length&&[8,14,15,23,29,30].includes(lunarDay)) labels.push(locale==="en"?"Traditional six fasting days":locale==="zh-Hans"?"传统六斋日":"傳統六齋日");
 if(!labels.length) labels.push(locale==="en"?"No major observance listed":locale==="zh-Hans"?"未列主要圣日":"未列主要聖日");
 return labels.join(locale==="en"?" · ":"｜");
}
export const SACRED_DAY_SOURCE_COUNT=rows.length;
