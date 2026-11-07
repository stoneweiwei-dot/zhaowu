import { FROST_SKIN_ID, FROST_PHASES, WINTER_SKIN_ID, MINOR_SNOW_SKIN_ID, seasonalPackForSkin, SEASONAL_AUTO_ID, seasonalState, seasonalVisualSkinId, frostEdition, type Hemisphere } from './seasonal-skins';
import { useEffect, useState } from "react";

/**
 * 主題皮膚 (theme skins) — owner-selectable visual skins.
 * - "none" / no attribute = the default illustrated landing and existing inner pages.
 * - A skin only sets `data-zws` (+ `data-zws-mode`) on <html>; every visual override lives in
 *   src/theme-skins.css behind `html[data-zws]`, so removing the attribute restores the default palette.
 */
export const SKIN_KEY = "zhaowu.skin.v1";
export const SKIN_EVENT = "zhaowu-skin";
/** Site-wide default: first owner homepage reference (pastel koi). */
export const SITE_DEFAULT_SKIN = "pastel-koi";

export type SkinMode = "light" | "dark";
export type SkinDef = {
  id: string;
  zh: string;
  hans: string;
  en: string;
  noteZh: string;
  noteHans: string;
  noteEn: string;
  mode: SkinMode;
  /** Catalog order; 1–10 map to the original mood-board, 11–14 to the Song whitespace series, 15–18 to the 青木 (green-wood) series. */
  ref: number;
  /** High-resolution painting (existing site art or a graded video frame) used as the page backdrop and home banner. */
  hero: string;
  /** CSS background-position that keeps the painting's focal point in the home banner. */
  focus: string;
  swatch: [string, string, string];
};


export const SKINS: SkinDef[] = [
  { id: "lotus-boat", ref: 1, mode: "light", zh: "蓮舟山水", hans: "莲舟山水", en: "Lotus Skiff", noteZh: "宣紙米・墨綠・金線，山水捲首", noteHans: "宣纸米・墨绿・金线，山水卷首", noteEn: "Rice-paper cream, ink green, gold hairlines", hero: "/theme-skins/reference-dragon.webp", focus: "50% 30%", swatch: ["#f4ead7", "#285044", "#b8934d"] },
  { id: "cloud-jade", ref: 2, mode: "light", zh: "雲山青綠", hans: "云山青绿", en: "Cloud & Jade", noteZh: "淡墨青山，清簡留白", noteHans: "淡墨青山，清简留白", noteEn: "Pale ink mountains, calm whitespace", hero: "/art/zhaowu-dragon-lake-v1.webp", focus: "50% 55%", swatch: ["#efe9db", "#2b5545", "#d9cfb8"] },
  { id: "golden-phoenix", ref: 3, mode: "light", zh: "金鳳朝陽", hans: "金凤朝阳", en: "Golden Phoenix", noteZh: "旭日金・琥珀棕・象牙白", noteHans: "旭日金・琥珀棕・象牙白", noteEn: "Sun gold, amber brown and ivory", hero: "/theme-skins/golden-phoenix-art.webp", focus: "50% 38%", swatch: ["#f5dfad", "#8a4d26", "#c99535"] },
  { id: "ink-dragon", ref: 4, mode: "light", zh: "水墨飛龍", hans: "水墨飞龙", en: "Ink Dragon", noteZh: "書法大字與淡彩青龍", noteHans: "书法大字与淡彩青龙", noteEn: "Calligraphic titles, watercolour dragon", hero: "/hero-gallery/dragon-scholar.webp", focus: "50% 22%", swatch: ["#efe6d4", "#3f5f58", "#b79a5a"] },
  { id: "dragon-lotus", ref: 5, mode: "light", zh: "龍蓮日卷", hans: "龙莲日卷", en: "Dragon & Lotus", noteZh: "金邊卷軸卡片，龍與蓮舟", noteHans: "金边卷轴卡片，龙与莲舟", noteEn: "Gold-edged scroll cards, dragon and lotus", hero: "/theme-skins/reference-dragon.webp", focus: "40% 20%", swatch: ["#f1e8d8", "#234e43", "#c4a263"] },
  { id: "night-flute", ref: 6, mode: "dark", zh: "夜・龍吟", hans: "夜・龙吟", en: "Night Flute", noteZh: "深海夜藍，金色按鈕，吹笛少年與青龍", noteHans: "深海夜蓝，金色按钮，吹笛少年与青龙", noteEn: "Deep-sea night, gold buttons, flautist and dragon", hero: "/theme-skins/reference-night-flute.webp", focus: "50% 30%", swatch: ["#0a1b27", "#e0be80", "#143347"] },
  { id: "day-flute", ref: 7, mode: "light", zh: "日・龍吟", hans: "日・龙吟", en: "Day Flute", noteZh: "霧白底，深藍按鈕，同一幅畫的日間版", noteHans: "雾白底，深蓝按钮，同一幅画的日间版", noteEn: "Misty paper, deep-blue buttons, the daylight edition", hero: "/theme-skins/reference-day-flute.webp", focus: "50% 28%", swatch: ["#eee6d6", "#0f4059", "#b9a06a"] },
  { id: "night-palace", ref: 8, mode: "dark", zh: "夜・宮闕", hans: "夜・宫阙", en: "Night Palace", noteZh: "寬幅夜景，雕花邊框卡片", noteHans: "宽幅夜景，雕花边框卡片", noteEn: "Wide night scene, ornate-framed cards", hero: "/theme-skins/night-palace-art.webp", focus: "50% 35%", swatch: ["#07121a", "#d8b574", "#16303f"] },
  { id: "pine-ink", ref: 9, mode: "light", zh: "青松簡約", hans: "青松简约", en: "Pine Minimal", noteZh: "墨字大標，深綠實心按鈕", noteHans: "墨字大标，深绿实心按钮", noteEn: "Bold ink titles, solid green buttons", hero: "/hero-gallery/temple-bamboo-rain.webp", focus: "50% 45%", swatch: ["#f4efe3", "#1f4a3a", "#172b25"] },
  { id: "pastel-koi", ref: 10, mode: "light", zh: "粉彩錦鯉", hans: "粉彩锦鲤", en: "Pastel Koi", noteZh: "霧藍・藕粉・青綠水彩", noteHans: "雾蓝・藕粉・青绿水彩", noteEn: "Mist blue, lotus rose and soft teal", hero: "/theme-skins/reference-koi.webp", focus: "50% 40%", swatch: ["#e9f0f3", "#4e7f88", "#d9a9b3"] },
  // 宋式留白：新增可選系列；維持既有 10 套與經典預設不變。
  { id: "song-clear-dragon", ref: 11, mode: "light", zh: "雲龍留白", hans: "云龙留白", en: "Dragon in Clear Air", noteZh: "青玉遠山・暖紙大留白・淡金細線", noteHans: "青玉远山・暖纸大留白・淡金细线", noteEn: "Jade mountains, open paper, restrained gold", hero: "/art/zhaowu-dragon-lake-v1.webp", focus: "50% 52%", swatch: ["#f8f4eb", "#315e50", "#a99570"] },
  { id: "song-rain-bank", ref: 12, mode: "light", zh: "煙汀雨過", hans: "烟汀雨过", en: "After the Rain", noteZh: "雨湖藍・深青墨・霧岸灰", noteHans: "雨湖蓝・深青墨・雾岸灰", noteEn: "Rainwashed blue, deep teal and mist grey", hero: "/hero-gallery/river-rain-boat.webp", focus: "50% 48%", swatch: ["#dfeaec", "#285f6b", "#87a5aa"] },
  { id: "song-lotus-still", ref: 13, mode: "light", zh: "素荷清漪", hans: "素荷清漪", en: "Still Lotus", noteZh: "藕粉・梅茶色・荷葉灰綠", noteHans: "藕粉・梅茶色・荷叶灰绿", noteEn: "Lotus rose, plum tea and leaf grey-green", hero: "/art/scene-lotus-boat-v1.webp", focus: "50% 44%", swatch: ["#f2e4e6", "#7a4d5f", "#8a9b83"] },
  { id: "song-osmanthus", ref: 14, mode: "light", zh: "桂月素箋", hans: "桂月素笺", en: "Osmanthus Letter", noteZh: "桂花暖金・月白宣紙・疏朗題跋", noteHans: "桂花暖金・月白宣纸・疏朗题跋", noteEn: "Osmanthus gold, moonlit paper, spare headings", hero: "/art/scene-osmanthus-tea-v1.webp", focus: "50% 45%", swatch: ["#f8f0e3", "#5c6044", "#b59a68"] },
  // 青木・生生不息：東方甲乙木——新芽、竹雨、煙嵐、青龍；四款共用同一套全站主題引擎。
  { id: "verdant-dragon", ref: 15, mode: "light", zh: "青龍・萬木生發", hans: "青龙・万木生发", en: "Azure Dragon of Spring", noteZh: "葉化青龍・暖紙・新綠金線，生生不息", noteHans: "叶化青龙・暖纸・新绿金线，生生不息", noteEn: "A dragon of leaves, warm paper, sprout-green and gold line", hero: "/theme-skins/verdant-dragon-art.webp", focus: "50% 22%", swatch: ["#f4eedb", "#2f6a4c", "#b9a54b"] },
  { id: "verdant-mist", ref: 16, mode: "light", zh: "青木・煙嵐", hans: "青木・烟岚", en: "Verdant Mist", noteZh: "喀斯特青峰與湖霧，薄紗卡片", noteHans: "喀斯特青峰与湖雾，薄纱卡片", noteEn: "Green karst peaks and lake mist, gauze cards", hero: "/theme-skins/verdant-mist-art.webp", focus: "50% 38%", swatch: ["#eef2ea", "#2e6a52", "#7aa08a"] },
  { id: "verdant-pavilion", ref: 17, mode: "light", zh: "青木・柳亭", hans: "青木・柳亭", en: "Willow Pavilion", noteZh: "春芽綠・柳葉青・雨霧白", noteHans: "春芽绿・柳叶青・雨雾白", noteEn: "Spring green, willow jade and rain mist", hero: "/theme-skins/verdant-pavilion-art.webp", focus: "50% 45%", swatch: ["#dcebd5", "#2f6f43", "#83a85c"] },
  { id: "verdant-rain", ref: 18, mode: "dark", zh: "夜・雨竹", hans: "夜・雨竹", en: "Bamboo Rain", noteZh: "深林雨竹，嫩芽綠光邊", noteHans: "深林雨竹，嫩芽绿光边", noteEn: "Deep bamboo rain, sprout-green glow", hero: "/theme-skins/verdant-rain-art.webp", focus: "50% 40%", swatch: ["#07150f", "#a8d38a", "#b9de92"] },
  // 畫中六景：站主私人上傳的無字完整畫作；共用同一套全站主題引擎。
  { id: "dawn-dragon", ref: 19, mode: "light", zh: "曉日雲龍", hans: "晓日云龙", en: "Dragon at Dawn", noteZh: "朝霞桃・青玉峰・暖金水光", noteHans: "朝霞桃・青玉峰・暖金水光", noteEn: "Dawn peach, jade peaks and warm gold", hero: "/theme-skins/dawn-dragon-art.webp", focus: "50% 6%", swatch: ["#f2ddd0", "#356f69", "#c97855"] },
  { id: "moon-lotus-boat", ref: 20, mode: "light", zh: "月下荷舟", hans: "月下荷舟", en: "Moonlit Lotus Boat", noteZh: "滿月白鶴・荷塘小舟・暖金暮色", noteHans: "满月白鹤・荷塘小舟・暖金暮色", noteEn: "Full moon, white crane, lotus pond skiff", hero: "/theme-skins/moon-lotus-boat-art.webp", focus: "50% 30%", swatch: ["#f3ead8", "#3d5f52", "#c9a467"] },
  { id: "bamboo-falls", ref: 21, mode: "light", zh: "竹瀑漁舟", hans: "竹瀑渔舟", en: "Bamboo Falls", noteZh: "飛瀑竹影・墨青山水・沉靜漁舟", noteHans: "飞瀑竹影・墨青山水・沉静渔舟", noteEn: "Waterfall and bamboo, ink-green calm", hero: "/theme-skins/bamboo-falls-art.webp", focus: "50% 40%", swatch: ["#eeebe2", "#2c4a44", "#a59a78"] },
  { id: "petal-immortal", ref: 22, mode: "light", zh: "荷舟仙羽", hans: "荷舟仙羽", en: "Petal Skiff", noteZh: "荷瓣為舟・仙羽飛來・大片留白", noteHans: "荷瓣为舟・仙羽飞来・大片留白", noteEn: "A lotus-petal skiff, a spirit bird, open paper", hero: "/theme-skins/petal-immortal-art.webp", focus: "50% 30%", swatch: ["#f8efe4", "#4f6f76", "#e3a9a4"] },
  { id: "pink-lotus-stream", ref: 23, mode: "light", zh: "粉蓮雲溪", hans: "粉莲云溪", en: "Lotus over the Stream", noteZh: "溪水藍・珊瑚粉・深湖青", noteHans: "溪水蓝・珊瑚粉・深湖青", noteEn: "Stream blue, coral pink and deep teal", hero: "/theme-skins/pink-lotus-stream-art.webp", focus: "50% 40%", swatch: ["#dcecf1", "#2e7280", "#d28a9c"] },
  { id: "butterfly-lotus", ref: 24, mode: "light", zh: "蝶戀荷塘", hans: "蝶恋荷塘", en: "Butterfly & Lotus", noteZh: "白蝶荷花・霧青湖光・素雅灰綠", noteHans: "白蝶荷花・雾青湖光・素雅灰绿", noteEn: "White butterfly, lotus, misty lake grey-green", hero: "/theme-skins/butterfly-lotus-art.webp", focus: "50% 30%", swatch: ["#efece4", "#4a6a62", "#c9a3ad"] },
  { id: "song-gallery-frostleaf", ref: 25, mode: "light", zh: "霜葉照溪・宋式畫冊", hans: "霜叶照溪・宋式画册", en: "Frostleaf Brook · Song Gallery", noteZh: "秋葉赭・苔綠・溪石褐", noteHans: "秋叶赭・苔绿・溪石褐", noteEn: "Autumn rust, moss green and river-stone brown", hero: "/theme-skins/song-gallery-frostleaf-art.webp", focus: "50% 48%", swatch: ["#ead9c5", "#8a4d38", "#607f69"] },
  { id: "solar-frost-descent", ref: 26, mode: "light", zh: "霜降・霜林歸靜", hans: "霜降・霜林归静", en: "Frost’s Descent · Quiet Autumn", noteZh: "霜青・秋赭・淡金，三候輪替", noteHans: "霜青・秋赭・淡金，三候轮替", noteEn: "Frost teal, autumn ochre and pale gold; three seasonal scenes", hero: "/theme-skins/solar-frost-descent/hero-frost-descent.webp", focus: "50% 55%", swatch: ["#f6f1e6", "#375f5b", "#b87345"] },
  { id: "sydney-jacaranda", ref: 27, mode: "light", zh: "悉尼春・藍花楹", hans: "悉尼春・蓝花楹", en: "Sydney Spring · Jacaranda", noteZh: "藍花楹街道、砂岩金與港灣藍", noteHans: "蓝花楹街道、砂岩金与港湾蓝", noteEn: "Jacaranda streets, sandstone gold and harbour blue", hero: "/theme-skins/southern/sydney-jacaranda-spring.webp", focus: "50% 42%", swatch: ["#f4f2f9", "#45406f", "#c4a15a"] },
  { id: "solar-start-winter", ref: 28, mode: "light", zh: "立冬・藏息三候", hans: "立冬・藏息三候", en: "Start of Winter · Three Pentads", noteZh: "霜白・山青・暖絹，三候各有畫境", noteHans: "霜白・山青・暖绢，三候各有画境", noteEn: "Frost white, mountain blue and warm silk; three seasonal scenes", hero: "/theme-skins/solar-start-winter/water-begins-freezing.webp", focus: "50% 50%", swatch: ["#f5eee2", "#405d5a", "#b59b79"] },
  { id: "solar-minor-snow", ref: 29, mode: "light", zh: "小雪・雲山藏光", hans: "小雪・云山藏光", en: "Minor Snow · Hidden Light", noteZh: "雨青・霧白・松綠，三候各有畫境", noteHans: "雨青・雾白・松绿，三候各有画境", noteEn: "Rain blue, mist white and pine green; three seasonal scenes", hero: "/theme-skins/solar-minor-snow/rainbow-hidden.webp", focus: "50% 50%", swatch: ["#edf2ef", "#355b58", "#9da88f"] },
  { id: "solar-major-snow", ref: 30, mode: "light", zh: "大雪・松雪生機", hans: "大雪・松雪生机", en: "Major Snow · Living Pines", noteZh: "雪白・松綠・霧青，三候各有畫境", noteHans: "雪白・松绿・雾青，三候各有画境", noteEn: "Snow white, pine and mist; three seasonal scenes", hero: "/theme-skins/solar-major-snow/winter-bird.webp", focus: "50% 50%", swatch: ["#eef3e9", "#315a48", "#a7b69a"] },
  { id: "solar-winter-solstice", ref: 31, mode: "light", zh: "冬至・一陽初生", hans: "冬至・一阳初生", en: "Winter Solstice · Returning Light", noteZh: "泉青・苔綠・暖金，三候各有畫境", noteHans: "泉青・苔绿・暖金，三候各有画境", noteEn: "Springwater teal, moss and dawn gold; three seasonal scenes", hero: "/theme-skins/solar-winter-solstice/earthworms.webp", focus: "50% 50%", swatch: ["#f3f1e5", "#356257", "#b5a579"] },
  { id: "solar-minor-cold", ref: 32, mode: "light", zh: "小寒・雁來鵲築", hans: "小寒・雁来鹊筑", en: "Minor Cold · Birds Return", noteZh: "松青・雪白・晨金，三候各有畫境", noteHans: "松青・雪白・晨金，三候各有画境", noteEn: "Pine green, snow and morning gold; three seasonal scenes", hero: "/theme-skins/solar-minor-cold/geese-return.webp", focus: "50% 50%", swatch: ["#eff3ec", "#365b50", "#a9af91"] },
  { id: "solar-major-cold", ref: 33, mode: "light", zh: "大寒・物候畫境", hans: "大寒・物候画境", en: "Major Cold · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-major-cold/1.webp", focus: "50% 50%", swatch: ["#eff2ed", "#34584b", "#a8b6a0"] },
  { id: "solar-start-spring", ref: 34, mode: "light", zh: "立春・物候畫境", hans: "立春・物候画境", en: "Start of Spring · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-start-spring/1.webp", focus: "50% 50%", swatch: ["#eff4e9", "#376148", "#a4b88a"] },
  { id: "solar-rain-water", ref: 35, mode: "light", zh: "雨水・物候畫境", hans: "雨水・物候画境", en: "Rain Water · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-rain-water/1.webp", focus: "50% 50%", swatch: ["#ebf2ef", "#335c57", "#91afa4"] },
  { id: "solar-awakening", ref: 36, mode: "light", zh: "驚蟄・物候畫境", hans: "惊蛰・物候画境", en: "Awakening of Insects · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-awakening/1.webp", focus: "50% 50%", swatch: ["#f3f3e7", "#386044", "#a6b986"] },
  { id: "solar-spring-equinox", ref: 37, mode: "light", zh: "春分・物候畫境", hans: "春分・物候画境", en: "Spring Equinox · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-spring-equinox/1.webp", focus: "50% 50%", swatch: ["#edf4e9", "#355d4b", "#9fbb99"] },
  { id: "solar-pure-brightness", ref: 38, mode: "light", zh: "清明・物候畫境", hans: "清明・物候画境", en: "Pure Brightness · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-pure-brightness/1.webp", focus: "50% 50%", swatch: ["#edf3ed", "#355b50", "#a1b7a2"] },
  { id: "solar-grain-rain", ref: 39, mode: "light", zh: "穀雨・物候畫境", hans: "谷雨・物候画境", en: "Grain Rain · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-grain-rain/1.webp", focus: "50% 50%", swatch: ["#eef3e7", "#365b49", "#a5b98c"] },
  { id: "solar-start-summer", ref: 40, mode: "light", zh: "立夏・物候畫境", hans: "立夏・物候画境", en: "Start of Summer · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-start-summer/1.webp", focus: "50% 50%", swatch: ["#edf3e8", "#315f47", "#9cba92"] },
  { id: "solar-grain-buds", ref: 41, mode: "light", zh: "小滿・物候畫境", hans: "小满・物候画境", en: "Grain Buds · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-grain-buds/1.webp", focus: "50% 50%", swatch: ["#f3f2e5", "#4b5d3d", "#b7b38b"] },
  { id: "solar-grain-in-ear", ref: 42, mode: "light", zh: "芒種・物候畫境", hans: "芒种・物候画境", en: "Grain in Ear · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-grain-in-ear/1.webp", focus: "50% 50%", swatch: ["#f2f2e3", "#47603d", "#b1b787"] },
  { id: "solar-summer-solstice", ref: 43, mode: "light", zh: "夏至・物候畫境", hans: "夏至・物候画境", en: "Summer Solstice · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-summer-solstice/1.webp", focus: "50% 50%", swatch: ["#f2f2e8", "#315d4e", "#aaba92"] },
  { id: "solar-minor-heat", ref: 44, mode: "light", zh: "小暑・物候畫境", hans: "小暑・物候画境", en: "Minor Heat · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-minor-heat/1.webp", focus: "50% 50%", swatch: ["#edf3e9", "#345d4b", "#a7b994"] },
  { id: "solar-major-heat", ref: 45, mode: "light", zh: "大暑・物候畫境", hans: "大暑・物候画境", en: "Major Heat · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-major-heat/1.webp", focus: "50% 50%", swatch: ["#edf2e6", "#315d4c", "#9fb58b"] },
  { id: "solar-start-autumn", ref: 46, mode: "light", zh: "立秋・物候畫境", hans: "立秋・物候画境", en: "Start of Autumn · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-start-autumn/1.webp", focus: "50% 50%", swatch: ["#f3f1e7", "#4c5d42", "#b6ad86"] },
  { id: "solar-end-heat", ref: 47, mode: "light", zh: "處暑・物候畫境", hans: "处暑・物候画境", en: "End of Heat · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-end-heat/1.webp", focus: "50% 50%", swatch: ["#f2f0e4", "#4f5d3f", "#b8ad82"] },
  { id: "solar-white-dew", ref: 48, mode: "light", zh: "白露・物候畫境", hans: "白露・物候画境", en: "White Dew · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-white-dew/1.webp", focus: "50% 50%", swatch: ["#eff2eb", "#3d5b4c", "#a9b7a1"] },
  { id: "solar-autumn-equinox", ref: 49, mode: "light", zh: "秋分・物候畫境", hans: "秋分・物候画境", en: "Autumn Equinox · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-autumn-equinox/1.webp", focus: "50% 50%", swatch: ["#f3efe6", "#515a42", "#baaa8b"] },
  { id: "solar-cold-dew", ref: 50, mode: "light", zh: "寒露・物候畫境", hans: "寒露・物候画境", en: "Cold Dew · Seasonal Scenes", noteZh: "三候原畫・節氣色彩・全站細節", noteHans: "三候原画・节气色彩・全站细节", noteEn: "Three original pentad scenes and a complete seasonal palette", hero: "/theme-skins/solar-cold-dew/1.webp", focus: "50% 50%", swatch: ["#f1f0e6", "#465b45", "#aeaf8c"] },
  { id: "southern-summer", ref: 51, mode: "light", zh: "悉尼夏・東岸海灘", hans: "悉尼夏・东岸海滩", en: "Sydney Summer · Eastern Beaches", noteZh: "邦代沙金、太平洋藍、砂岩岸", noteHans: "邦代沙金、太平洋蓝、砂岩岸", noteEn: "Bondi sand, Pacific blue and sandstone coast", hero: "/theme-skins/southern/sydney-bondi-summer.webp", focus: "50% 46%", swatch: ["#e4f4f7", "#0c5870", "#d7a441"] },
  { id: "southern-autumn", ref: 52, mode: "light", zh: "悉尼秋・藍山", hans: "悉尼秋・蓝山", en: "Sydney Autumn · Blue Mountains", noteZh: "桉樹藍霧、峭壁與秋光", noteHans: "桉树蓝雾、峭壁与秋光", noteEn: "Eucalyptus haze, escarpment and autumn light", hero: "/theme-skins/southern/blue-mountains-autumn.webp", focus: "50% 40%", swatch: ["#f6e7d2", "#2c4d66", "#c46a32"] },
  { id: "southern-winter", ref: 53, mode: "light", zh: "悉尼冬・雪山", hans: "悉尼冬・雪山", en: "Sydney Winter · Snowy Mountains", noteZh: "科修斯科雪膠樹與高山雪", noteHans: "科修斯科雪胶树与高山雪", noteEn: "Kosciuszko snow gums and high-country snow", hero: "/theme-skins/southern/snowy-mountains-winter.webp", focus: "50% 38%", swatch: ["#e7eef3", "#1e4654", "#c4a27a"] },
];

export type SkinFamily = "soft" | "water" | "warm" | "green" | "night";
export const CURATED_SKIN_CATALOG: ReadonlyArray<{ id: string; family: SkinFamily }> = [
  { id: "pastel-koi", family: "soft" },
  { id: "song-lotus-still", family: "soft" },
  { id: "song-rain-bank", family: "water" },
  { id: "pink-lotus-stream", family: "water" },
  { id: "golden-phoenix", family: "warm" },
  { id: "dawn-dragon", family: "warm" },
  { id: "song-gallery-frostleaf", family: "warm" },
  { id: "verdant-pavilion", family: "green" },
  { id: "verdant-rain", family: "night" },
  { id: "night-flute", family: "night" },
] as const;

export const CURATED_SKINS = CURATED_SKIN_CATALOG
  .map(({ id, family }) => ({ skin: SKINS.find((candidate) => candidate.id === id)!, family }));
/** Sydney meteorological seasons. 藍花楹 is the spring place, not one of the 72 pentads. */
export const SYDNEY_SEASON_IDS = ["sydney-jacaranda", "southern-summer", "southern-autumn", "southern-winter"] as const;
export const SYDNEY_SEASON_SKINS = SYDNEY_SEASON_IDS.map((id) => SKINS.find((skin) => skin.id === id)!);
export const SEASONAL_SKINS = SKINS.filter((skin) => skin.id.startsWith("solar-"));
export const ARCHIVED_SKINS = SKINS.filter((skin) => !skin.id.startsWith("solar-") && !CURATED_SKIN_CATALOG.some((entry) => entry.id === skin.id) && !SYDNEY_SEASON_IDS.includes(skin.id as (typeof SYDNEY_SEASON_IDS)[number]));

let visitorHemisphere: Hemisphere = 'unknown';
/** Southern meteorological seasons follow the Sydney civil calendar. Spring is 藍花楹. */
export function southernSkinForDate(now: Date): string {
  const month = Number(new Intl.DateTimeFormat('en', { timeZone: 'Australia/Sydney', month: 'numeric' }).format(now));
  if (month >= 9 && month <= 11) return 'sydney-jacaranda';
  if (month === 12 || month <= 2) return 'southern-summer';
  if (month <= 5) return 'southern-autumn';
  return 'southern-winter';
}

/** Sydney civil clock, including Australian Eastern daylight saving (GMT+11) versus standard time (GMT+10). */
export function sydneyClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'shortOffset',
  }).formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  const offset = pick('timeZoneName');
  const dst = /\+11\b/.test(offset);
  return {
    date: `${pick('year')}-${pick('month')}-${pick('day')}`,
    time: `${pick('hour')}:${pick('minute')}`,
    offset,
    dst,
  };
}
/** Return the accepted southern Start of Winter painting only for its 2026 term. */
export function southernAutoArt(term: Parameters<typeof seasonalVisualSkinId>[0], hemisphere: Hemisphere, now = new Date()): string | null {
  const sydneyYear = Number(new Intl.DateTimeFormat('en', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
  }).format(now));
  if (hemisphere === 'south' && sydneyYear === 2026 && term.skinId === WINTER_SKIN_ID) {
    return '/theme-skins/southern/start-winter-2026.webp';
  }
  return null;
}
function resolvedSeasonalSkin(term: Parameters<typeof seasonalVisualSkinId>[0], hemisphere: Hemisphere, now = new Date()): string {
  return hemisphere === 'south' ? southernSkinForDate(now) : seasonalVisualSkinId(term, hemisphere);
}
export function skinById(id: string | null | undefined) {
  const auto = id === SEASONAL_AUTO_ID ? seasonalState() : null;
  const resolved = auto ? resolvedSeasonalSkin(auto.term, visitorHemisphere) : id;
  const skin = SKINS.find((s) => s.id === resolved) ?? null;
  if (!skin) return null;
  if (auto) {
    return {
      ...skin,
      zh: auto.term.zh, hans: auto.term.hans, en: auto.term.en,
      noteZh: auto.hou['zh-Hant'], noteHans: auto.hou['zh-Hans'], noteEn: auto.hou.en,
      // Keep the existing southern selection and resolve the northern pentad art.
      hero: skin.id === 'sydney-jacaranda'
        ? southernAutoArt(auto.term, visitorHemisphere, new Date()) ?? skin.hero
        : skin.id === FROST_SKIN_ID ? FROST_PHASES[auto.houIndex].art
        : seasonalPackForSkin(skin.id)?.[auto.houIndex].art ?? skin.hero,
      focus: skin.id === 'sydney-jacaranda' ? '50% 50%' : skin.focus,
    };
  }
  if (skin.id === FROST_SKIN_ID) return { ...skin, hero: frostEdition().art };
  const pack = seasonalPackForSkin(skin.id);
  if (pack) {
    const current = seasonalState();
    return { ...skin, hero: pack[current.term.skinId === skin.id ? current.houIndex : 0].art };
  }
  return skin;
}

export function readSkinId(): string {
  if (typeof document === "undefined") return "";
  return document.documentElement.getAttribute("data-zws-selection") ?? document.documentElement.getAttribute("data-zws") ?? "";
}

/** Public site visual state. Local storage is migration-only, never a visitor override. */
let syncSerial = 0;
let pendingPublishes = 0;
let migrationAttempted = false;

export function applySkin(id: string, persist = false) {
  if (typeof document === "undefined") return;
  const skin = skinById(id);
  const root = document.documentElement;
  root.setAttribute("data-zws-selection", skin ? id : "none");
  if (id === SEASONAL_AUTO_ID && skin) {
    const state = seasonalState();
    root.setAttribute("data-zws-term", state.term.zh);
    root.setAttribute("data-zws-hou", String(state.houIndex + 1));
    root.setAttribute("data-zws-hemisphere", visitorHemisphere);
  } else {
    root.removeAttribute("data-zws-term");
    root.removeAttribute("data-zws-hou");
    root.removeAttribute("data-zws-hemisphere");
  }
  if (skin) {
    root.setAttribute("data-zws", skin.id);
    if (id === SEASONAL_AUTO_ID || skin.id === FROST_SKIN_ID || seasonalPackForSkin(skin.id)) root.style.setProperty('--zws-art', `url("${skin.hero}")`);
    else root.style.removeProperty('--zws-art');
    root.setAttribute("data-zws-mode", skin.mode);
    if (skin.mode === "dark") root.setAttribute("data-zw-theme", "night");
    else root.removeAttribute("data-zw-theme");
  } else {
    root.style.removeProperty("--zws-art");
    root.removeAttribute("data-zws");
    root.removeAttribute("data-zws-mode");
    root.removeAttribute("data-zw-theme");
  }
  // Old per-device selections must not survive as hidden visitor overrides.
  if (persist) {
    try { localStorage.removeItem(SKIN_KEY); } catch { /* unavailable storage */ }
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", skin ? skin.swatch[0] : "#fffaf0");
  window.dispatchEvent(new Event(SKIN_EVENT));
}

/**
 * Cache of the last skin the SERVER confirmed (never a visitor choice), so the next page load
 * paints the published theme immediately instead of flashing the koi default. index.html reads
 * the same key in its pre-paint script; the server value still wins once it arrives.
 */
export const PUBLISHED_SKIN_CACHE_KEY = "zhaowu.skin.published.v1";

function rememberPublishedSkin(id: string) {
  try { localStorage.setItem(PUBLISHED_SKIN_CACHE_KEY, id); localStorage.setItem("zhaowu.skin.published.resolved.v1", skinById(id)?.id ?? "none"); } catch { /* unavailable storage */ }
}

function cachedPublishedSkin(): string | null {
  try {
    const cached = localStorage.getItem(PUBLISHED_SKIN_CACHE_KEY);
    return cached === "none" || cached === SEASONAL_AUTO_ID ? cached : skinById(cached)?.id ?? null;
  } catch { return null; }
}

function legacyOwnerChoice(): string | null {
  try {
    const saved = localStorage.getItem(SKIN_KEY);
    return saved === "none" ? "none" : skinById(saved)?.id ?? null;
  } catch { return null; }
}

/** Fetch the same active skin for the owner and every guest, on every device. */
export async function refreshSharedSkin(): Promise<string | null> {
  if (typeof window === "undefined" || pendingPublishes > 0) return null;
  const token = ++syncSerial;
  try {
    let response = await fetch("/api/owner-data?view=site-skin", { cache: "no-store", credentials: "same-origin" });
    // Read-only fallback: mirror the publish route recovery without changing stored preferences.
    if (response.status === 404) {
      response = await fetch("/api/owner-session?view=site-skin", { cache: "no-store", credentials: "same-origin" });
    }
    if (!response.ok) return null; // keep last known skin if the setting service is unavailable
    const payload = await response.json() as { skin?: unknown; configured?: boolean };
    const selected = payload.skin === "none" ? "none" : typeof payload.skin === "string" && skinById(payload.skin) ? payload.skin : null;
    if (selected === null || token !== syncSerial) return null;

    // One-time migration: if no shared selection exists yet, publish the owner's
    // existing phone selection after the SERVER confirms the owner cookie.
    if (payload.configured === false && !migrationAttempted) {
      const saved = legacyOwnerChoice();
      if (saved !== null) {
        migrationAttempted = true;
        const auth = await fetch("/api/owner-session", { cache: "no-store", credentials: "same-origin" })
          .then((r) => r.ok ? r.json() as Promise<{ authenticated?: boolean }> : null)
          .catch(() => null);
        if (auth?.authenticated === true && token === syncSerial) {
          try { await publishSkin(saved); return saved; } catch { /* preserve public classic fallback */ }
        }
      }
    }
    if (token !== syncSerial) return null;
    applySkin(selected);
    rememberPublishedSkin(selected);
    return selected;
  } catch { return null; }
}

/** Server requires a valid owner cookie and same-origin POST. Never silently fall back to local-only styling. */
export async function publishSkin(id: string): Promise<void> {
  const chosen = id === "" || id === "none" ? "none" : id === SEASONAL_AUTO_ID ? SEASONAL_AUTO_ID : skinById(id)?.id;
  if (!chosen) throw new Error("未知主題，不能發佈。");
  const token = ++syncSerial;
  pendingPublishes += 1;
  try {
    let response = await fetch("/api/owner-data", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "site-skin.publish", skin: chosen }),
    });
    // Some production versions omit /api/owner-data from the deployed function manifest.
    // Only a missing route (404) retries the exact same authenticated operation through
    // the existing /api/owner-session function. No local-only success or theme reset.
    if (response.status === 404) {
      response = await fetch("/api/owner-session", {
        method: "POST", cache: "no-store", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "site-skin.publish", skin: chosen }),
      });
    }
    if (!response.ok) throw new Error(response.status === 401 ? "站主登入已失效，請重新登入。" : `全站主題尚未儲存（HTTP ${response.status}），請稍後重試。`);
    const data = await response.json() as { ok?: boolean; skin?: string };
    if (!data.ok || data.skin !== chosen) throw new Error("無法確認全站主題已更新。");
    if (token === syncSerial) {
      applySkin(chosen, true);
      rememberPublishedSkin(chosen);
    }
  } finally {
    pendingPublishes -= 1;
  }
}

/** Refresh without a cron, navigation or publish. Works even when the phone resumes from sleep. */
let seasonalTickerStarted = false;
function refreshAutoSkinIfDue() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (root.getAttribute("data-zws-selection") !== SEASONAL_AUTO_ID) return;
  const state = seasonalState();
  if (root.getAttribute("data-zws") !== resolvedSeasonalSkin(state.term, visitorHemisphere) ||
      root.getAttribute("data-zws-hou") !== String(state.houIndex + 1)) {
    applySkin(SEASONAL_AUTO_ID);
  }
}
/** Boot uses server state, never the previous visitor's device-local preference. */
export function hydrateSkin() {
  if (typeof window === "undefined") return;
  // Last server-confirmed skin first; the koi default only for a first-ever visit.
  applySkin(cachedPublishedSkin() ?? SITE_DEFAULT_SKIN);
  void refreshSharedSkin();
  void fetch('/api/zhaowu-capabilities?mode=visitor-hemisphere', { cache: 'no-store', credentials: 'same-origin' })
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (data?.hemisphere !== 'north' && data?.hemisphere !== 'south') return;
      visitorHemisphere = data.hemisphere;
      if (readSkinId() === SEASONAL_AUTO_ID) applySkin(SEASONAL_AUTO_ID);
    }).catch(() => { /* Unknown location keeps existing imagery. */ });
  if (!seasonalTickerStarted) {
    seasonalTickerStarted = true;
    window.setInterval(refreshAutoSkinIfDue, 30_000);
    window.addEventListener("focus", refreshAutoSkinIfDue);
    window.addEventListener("pageshow", refreshAutoSkinIfDue);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refreshAutoSkinIfDue();
    });
  }
}

export function useSkin() {
  const [, render] = useState(0);
  const id = readSkinId();
  useEffect(() => {
    // The same selected id can now resolve to a new phase's artwork and copy.
    const sync = () => render(value => value + 1);
    window.addEventListener(SKIN_EVENT, sync);
    return () => window.removeEventListener(SKIN_EVENT, sync);
  }, []);
  return { id, skin: skinById(id), apply: publishSkin };
}
