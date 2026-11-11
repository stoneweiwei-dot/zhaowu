import { useI18n } from "@/lib/i18n";
import { sydneyDate } from "@/lib/daily-sky-date";
import { useEffect, useState } from "react";
import "@/daily-sky-observation.css";

type Lang = "zh-Hant" | "zh-Hans" | "en";
type LocalText = Record<Lang, string>;
type DatedObservation = {
  date: string;
  moon: LocalText;
  planets: LocalText;
  events: LocalText;
  weather: LocalText;
  sources: Array<{ title: string; url: string }>;
};

// Dated, sourced observation snapshots. An unverified planetary event is never
// represented as absent. Future daily records belong to the verified generator.
export const OBSERVATIONS: DatedObservation[] = [
  {
    date: "2026-10-31",
    moon: {
      "zh-Hant": "虧凸月；05:02 過中天時照明約 73.3%。00:11 月出，09:55 月落。",
      "zh-Hans": "亏凸月；05:02 过中天时照明约 73.3%。00:11 月出，09:55 月落。",
      en: "Waning gibbous; ~73.3% illuminated at its 05:02 transit. Moonrise 00:11; moonset 09:55."
    },
    planets: {
      "zh-Hant": "晚間土星約 22:54 過中天；黎明前的木星、火星須觀察東北方低空。",
      "zh-Hans": "晚间土星约 22:54 过中天；黎明前的木星、火星须观察东北方低空。",
      en: "Saturn transits around 22:54. Jupiter and Mars are in the pre-dawn northeastern sky."
    },
    events: {
      "zh-Hant": "S／A 行星事件尚未經雙引擎核驗；不宣稱無事件。",
      "zh-Hans": "S／A 行星事件尚未经过双引擎核验；不宣称无事件。",
      en: "S/A planetary events are awaiting independent ephemeris verification; no absence claim is made."
    },
    weather: {
      "zh-Hant": "當日天氣和光害資料尚未核實。",
      "zh-Hans": "当日天气和光害资料尚未核实。",
      en: "Weather and light-pollution data for this date were not verified."
    },
    sources: [
      { title: "Timeanddate · Sydney Moon, October 2026", url: "https://www.timeanddate.com/moon/australia/sydney?month=10&year=2026" },
      { title: "Timeanddate · Sydney planetary visibility", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" }
    ]
  },
  {
    date: "2026-11-01",
    moon: {
      "zh-Hant": "虧凸月；06:02 過中天時照明 62.0%。01:03 東北偏東月出，11:07 西北偏西月落。",
      "zh-Hans": "亏凸月；06:02 过中天时照明 62.0%。01:03 东北偏东月出，11:07 西北偏西月落。",
      en: "Waning gibbous; 62.0% illuminated at the 06:02 transit. Rises ENE at 01:03; sets WNW at 11:07."
    },
    planets: {
      "zh-Hant": "土星晚間容易觀察，約 22:50 過中天。11月2日黎明前，火星 02:22、木星 02:34 升起；金星約 04:57 升起但貼近地平線。水星過近太陽，不建議尋找。",
      "zh-Hans": "土星晚间容易观察，约 22:50 过中天。11月2日黎明前，火星 02:22、木星 02:34 升起；金星约 04:57 升起但贴近地平线。水星过近太阳，不建议寻找。",
      en: "Saturn is readily visible in the evening, transiting around 22:50. Before dawn on 2 Nov, Mars rises 02:22, Jupiter 02:34 and low-horizon Venus 04:57. Mercury is too close to the Sun for practical viewing."
    },
    events: {
      "zh-Hant": "本日 S／A 行星事件與未來72小時預告尚待獨立星曆核驗。這不代表沒有重大事件。",
      "zh-Hans": "本日 S／A 行星事件与未来72小时预告尚待独立星历核验。这不代表没有重大事件。",
      en: "Today's S/A planetary events and the 72-hour forecast await independent ephemeris validation. This does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "澳洲氣象局11月1日17:00預報：悉尼地區多雲間晴，今晚可能有陣雨，越晚機率越低。市區光害較強；建議避開街燈，實地確認雲況。",
      "zh-Hans": "澳大利亚气象局11月1日17:00预报：悉尼地区多云间晴，今晚可能有阵雨，越晚概率越低。市区光害较强；建议避开街灯，实地确认云况。",
      en: "The Australian Bureau of Meteorology's 17:00 forecast says partly cloudy, with a slight chance of showers becoming less likely later tonight. Urban light pollution is substantial; check clouds and avoid bright streetlights."
    },
    sources: [
      { title: "Timeanddate · Sydney Moon, November 2026", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney planetary visibility, 1 Nov", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · Sydney area forecast, issued 1 Nov 2026 17:00 AEDT", url: "https://www.bom.gov.au/places/nsw/sydney/forecast/" }
    ]
  },
  {
    date: "2026-11-02",
    moon: {
      "zh-Hant": "下弦月於悉尼時間07:28發生；06:58過中天時照明50.4%。月出01:46（方位65°），月落12:17（方位292°）。",
      "zh-Hans": "下弦月于悉尼时间07:28发生；06:58过中天时照明50.4%。月出01:46（方位65°），月落12:17（方位292°）。",
      en: "Last quarter occurs at 07:28 Sydney time. At the 06:58 transit the Moon is 50.4% illuminated; it rises at 01:46 (65°) and sets at 12:17 (292°)."
    },
    planets: {
      "zh-Hant": "11月2日黎明前：火星02:22、木星02:34升起，朝東北方觀察；金星04:57升起、貼近地平線。實際可見性受雲量和地形影響。",
      "zh-Hans": "11月2日黎明前：火星02:22、木星02:34升起，朝东北方观察；金星04:57升起、贴近地平线。实际可见性受云量和地形影响。",
      en: "Before dawn on 2 November, Mars rises at 02:22 and Jupiter at 02:34; look northeast. Venus rises at 04:57, low on the horizon. Clouds and terrain affect visibility."
    },
    events: {
      "zh-Hant": "本日S／A行星事件及未來72小時預告尚待獨立星曆核驗，不代表沒有重大事件。",
      "zh-Hans": "本日S／A行星事件及未来72小时预告尚待独立星历核验，不代表没有重大事件。",
      en: "Today's S/A planetary events and the 72-hour outlook await independent ephemeris verification; this does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "當日可追溯的觀測時段天氣和光害資料暫缺；出門前請確認最新預報，選擇安全且遠離強光的位置。",
      "zh-Hans": "当日可追溯的观测时段天气和光害资料暂缺；出门前请确认最新预报，选择安全且远离强光的位置。",
      en: "Traceable weather and light-pollution data for the viewing period are unavailable. Check the latest forecast and choose a safe location away from bright lights."
    },
    sources: [
      { title: "Timeanddate · Sydney Moon, 2 Nov 2026", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney planets, 1–2 Nov 2026", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" }
    ]
  },
  {
    date: "2026-11-03",
    moon: {
      "zh-Hant": "殘月（下弦後）；月出02:22（東北偏東），月落13:25（西北偏西）。07:50過中天時月面照明38.9%。",
      "zh-Hans": "残月（下弦后）；月出02:22（东北偏东），月落13:25（西北偏西）。07:50过中天时月面照明38.9%。",
      en: "Waning crescent after last quarter. Moonrise 02:22 (ENE), moonset 13:25 (WNW); 38.9% illuminated at its 07:50 transit."
    },
    planets: {
      "zh-Hant": "木星、火星宜在黎明前查看；土星宜日落後觀看。確切升落時間與當晚能見度尚未逐項核驗。",
      "zh-Hans": "木星、火星宜在黎明前查看；土星宜日落后观看。确切升落时间与当晚能见度尚未逐项核验。",
      en: "Look for Jupiter and Mars before sunrise and Saturn after sunset. Exact rise/set times and viewing conditions for this date are not yet independently checked."
    },
    events: {
      "zh-Hant": "11月3日S／A事件及未來72小時預告尚未通過雙引擎核驗，不代表沒有重大事件。",
      "zh-Hans": "11月3日S／A事件及未来72小时预告尚未通过双引擎核验，不代表没有重大事件。",
      en: "3 November S/A events and the following 72-hour outlook have not passed two-engine validation; this is not an absence claim."
    },
    weather: {
      "zh-Hant": "該日天氣與光害的時段觀測資料暫缺；出門前先查看當地預報，遠離強燈並留意地形。",
      "zh-Hans": "该日天气与光害的时段观测数据暂缺；出门前先查看当地预报，远离强灯并留意地形。",
      en: "Time-specific weather and light-pollution readings are unavailable. Check the local forecast and choose a safe, unobstructed site away from bright lights."
    },
    sources: [
      { title: "Timeanddate · Sydney Moon, 3 Nov 2026", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney night sky, planetary viewing reference", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" }
    ]
  },
    {
    date: "2026-11-04",
    moon: {
      "zh-Hant": "殘月；08:37 過中天時照明 28.3%（月中天瞬時值，非全天固定照明）。02:52 月出，14:30 月落。",
      "zh-Hans": "残月；08:37 过中天时照明 28.3%（月中天瞬时值，非全天固定照明）。02:52 月出，14:30 月落。",
      en: "Waning crescent; 28.3% illuminated at its 08:37 meridian transit (transit instant, not fixed all day). Moonrise 02:52; moonset 14:30."
    },
    planets: {
      "zh-Hant": "悉尼當日星曆計算：土星約 04:40 落下；凌晨火星 02:17、木星 02:27、金星 04:49 升起。水星鄰近太陽方向時不建議直接觀測。",
      "zh-Hans": "悉尼当日星历计算：土星约 04:40 落下；凌晨火星 02:17、木星 02:27、金星 04:49 升起。水星邻近太阳方向时不建议直接观测。",
      en: "Sydney ephemeris times: Saturn sets around 04:40; Mars rises at 02:17, Jupiter at 02:27 and Venus at 04:49. Avoid viewing Mercury when close to the Sun."
    },
    events: {
      "zh-Hant": "資料暫缺：本日 S／A 重大行星事件、JPL 交叉比對與90天日曆尚待獨立星曆核驗，不代表沒有重大事件。",
      "zh-Hans": "资料暂缺：本日 S／A 重大行星事件、JPL 交叉比对与90天日历尚待独立星历核验，不代表没有重大事件。",
      en: "Data unavailable: today's S/A major planetary events, JPL cross-checks and the 90-day calendar await independent ephemeris verification; this does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "資料暫缺：當日逐時能見度與實測光害資料暫缺；外出觀測前請先核對澳洲氣象局（BoM）悉尼最新預報並遠離強光。",
      "zh-Hans": "资料暂缺：当日逐时能见度与实测光害资料暂缺；外出观测前请先核对澳大利亚气象局（BoM）悉尼最新预报并远离强光。",
      en: "Data unavailable: hour-by-hour visibility and measured light-pollution readings are unavailable; check the latest Australian Bureau of Meteorology (BoM) Sydney forecast before observing."
    },
    sources: [
      { title: "Timeanddate · Sydney Astronomy (2026-11-04 AEDT/AEST)", url: "https://www.timeanddate.com/astronomy/australia/sydney" },
      { title: "Timeanddate · Sydney Moon, 2026-11", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney Night Sky Planets", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · Sydney Forecast", url: "https://www.bom.gov.au/places/nsw/north-sydney/forecast" }
    ]
  },
  {
    date: "2026-11-05",
    moon: {
      "zh-Hant": "殘月；09:22 過中天時照明 18.9%（月中天瞬時值，非全天固定照明）。03:20 月出，15:32 月落。",
      "zh-Hans": "残月；09:22 过中天时照明 18.9%（月中天瞬时值，非全天固定照明）。03:20 月出，15:32 月落。",
      en: "Waning crescent; 18.9% illuminated at its 09:22 meridian transit (transit instant, not fixed all day). Moonrise 03:20; moonset 15:32."
    },
    planets: {
      "zh-Hant": "悉尼當日星曆計算：土星約 04:36 落下；凌晨火星 02:15、木星 02:24、金星 04:45 升起。水星鄰近太陽方向時不建議直接觀測。",
      "zh-Hans": "悉尼当日星历计算：土星约 04:36 落下；凌晨火星 02:15、木星 02:24、金星 04:45 升起。水星邻近太阳方向时不建议直接观测。",
      en: "Sydney ephemeris times: Saturn sets around 04:36; Mars rises at 02:15, Jupiter at 02:24 and Venus at 04:45. Avoid viewing Mercury when close to the Sun."
    },
    events: {
      "zh-Hant": "資料暫缺：本日 S／A 重大行星事件、JPL 交叉比對與90天日曆尚待獨立星曆核驗，不代表沒有重大事件。",
      "zh-Hans": "资料暂缺：本日 S／A 重大行星事件、JPL 交叉比对与90天日历尚待独立星历核验，不代表没有重大事件。",
      en: "Data unavailable: today's S/A major planetary events, JPL cross-checks and the 90-day calendar await independent ephemeris verification; this does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "資料暫缺：當日逐時能見度與實測光害資料暫缺；外出觀測前請先核對澳洲氣象局（BoM）悉尼最新預報並遠離強光。",
      "zh-Hans": "资料暂缺：当日逐时能见度与实测光害资料暂缺；外出观测前请先核对澳大利亚气象局（BoM）悉尼最新预报并远离强光。",
      en: "Data unavailable: hour-by-hour visibility and measured light-pollution readings are unavailable; check the latest Australian Bureau of Meteorology (BoM) Sydney forecast before observing."
    },
    sources: [
      { title: "Timeanddate · Sydney Astronomy (2026-11-05 AEDT/AEST)", url: "https://www.timeanddate.com/astronomy/australia/sydney" },
      { title: "Timeanddate · Sydney Moon, 2026-11", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney Night Sky Planets", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · Sydney Forecast", url: "https://www.bom.gov.au/places/nsw/north-sydney/forecast" }
    ]
  },
  {
    date: "2026-11-06",
    moon: {
      "zh-Hant": "殘月；10:06 過中天時照明 11.2%（月中天瞬時值，非全天固定照明）。03:47 月出，16:34 月落。",
      "zh-Hans": "残月；10:06 过中天时照明 11.2%（月中天瞬时值，非全天固定照明）。03:47 月出，16:34 月落。",
      en: "Waning crescent; 11.2% illuminated at its 10:06 meridian transit (transit instant, not fixed all day). Moonrise 03:47; moonset 16:34."
    },
    planets: {
      "zh-Hant": "悉尼當日星曆計算：土星約 04:32 落下；凌晨火星 02:13、木星 02:20、金星 04:41 升起。水星鄰近太陽方向時不建議直接觀測。",
      "zh-Hans": "悉尼当日星历计算：土星约 04:32 落下；凌晨火星 02:13、木星 02:20、金星 04:41 升起。水星邻近太阳方向时不建议直接观测。",
      en: "Sydney ephemeris times: Saturn sets around 04:32; Mars rises at 02:13, Jupiter at 02:20 and Venus at 04:41. Avoid viewing Mercury when close to the Sun."
    },
    events: {
      "zh-Hant": "資料暫缺：本日 S／A 重大行星事件、JPL 交叉比對與90天日曆尚待獨立星曆核驗，不代表沒有重大事件。",
      "zh-Hans": "资料暂缺：本日 S／A 重大行星事件、JPL 交叉比对与90天日历尚待独立星历核验，不代表没有重大事件。",
      en: "Data unavailable: today's S/A major planetary events, JPL cross-checks and the 90-day calendar await independent ephemeris verification; this does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "資料暫缺：當日逐時能見度與實測光害資料暫缺；外出觀測前請先核對澳洲氣象局（BoM）悉尼最新預報並遠離強光。",
      "zh-Hans": "资料暂缺：当日逐时能见度与实测光害资料暂缺；外出观测前请先核对澳大利亚气象局（BoM）悉尼最新预报并远离强光。",
      en: "Data unavailable: hour-by-hour visibility and measured light-pollution readings are unavailable; check the latest Australian Bureau of Meteorology (BoM) Sydney forecast before observing."
    },
    sources: [
      { title: "Timeanddate · Sydney Astronomy (2026-11-06 AEDT/AEST)", url: "https://www.timeanddate.com/astronomy/australia/sydney" },
      { title: "Timeanddate · Sydney Moon, 2026-11", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney Night Sky Planets", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · Sydney Forecast", url: "https://www.bom.gov.au/places/nsw/north-sydney/forecast" }
    ]
  },
  {
    date: "2026-11-07",
    moon: {
      "zh-Hant": "殘月；10:50 過中天時照明 5.5%（月中天瞬時值，非全天固定照明）。04:14 月出，17:35 月落。",
      "zh-Hans": "残月；10:50 过中天时照明 5.5%（月中天瞬时值，非全天固定照明）。04:14 月出，17:35 月落。",
      en: "Waning crescent; 5.5% illuminated at its 10:50 meridian transit (transit instant, not fixed all day). Moonrise 04:14; moonset 17:35."
    },
    planets: {
      "zh-Hant": "悉尼當日星曆計算：土星約 04:28 落下；凌晨火星 02:10、木星 02:17、金星 04:37 升起。水星鄰近太陽方向時不建議直接觀測。",
      "zh-Hans": "悉尼当日星历计算：土星约 04:28 落下；凌晨火星 02:10、木星 02:17、金星 04:37 升起。水星邻近太阳方向时不建议直接观测。",
      en: "Sydney ephemeris times: Saturn sets around 04:28; Mars rises at 02:10, Jupiter at 02:17 and Venus at 04:37. Avoid viewing Mercury when close to the Sun."
    },
    events: {
      "zh-Hant": "資料暫缺：本日 S／A 重大行星事件、JPL 交叉比對與90天日曆尚待獨立星曆核驗，不代表沒有重大事件。",
      "zh-Hans": "资料暂缺：本日 S／A 重大行星事件、JPL 交叉比对与90天日历尚待独立星历核验，不代表没有重大事件。",
      en: "Data unavailable: today's S/A major planetary events, JPL cross-checks and the 90-day calendar await independent ephemeris verification; this does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "資料暫缺：當日逐時能見度與實測光害資料暫缺；外出觀測前請先核對澳洲氣象局（BoM）悉尼最新預報並遠離強光。",
      "zh-Hans": "资料暂缺：当日逐时能见度与实测光害资料暂缺；外出观测前请先核对澳大利亚气象局（BoM）悉尼最新预报并远离强光。",
      en: "Data unavailable: hour-by-hour visibility and measured light-pollution readings are unavailable; check the latest Australian Bureau of Meteorology (BoM) Sydney forecast before observing."
    },
    sources: [
      { title: "Timeanddate · Sydney Astronomy (2026-11-07 AEDT/AEST)", url: "https://www.timeanddate.com/astronomy/australia/sydney" },
      { title: "Timeanddate · Sydney Moon, 2026-11", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney Night Sky Planets", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · Sydney Forecast", url: "https://www.bom.gov.au/places/nsw/north-sydney/forecast" }
    ]
  },
  {
    date: "2026-11-08",
    moon: {
      "zh-Hant": "殘月；11:35 過中天時照明 1.8%（月中天瞬時值，非全天固定照明）。04:42 月出，18:36 月落。",
      "zh-Hans": "残月；11:35 过中天时照明 1.8%（月中天瞬时值，非全天固定照明）。04:42 月出，18:36 月落。",
      en: "Waning crescent; 1.8% illuminated at its 11:35 meridian transit (transit instant, not fixed all day). Moonrise 04:42; moonset 18:36."
    },
    planets: {
      "zh-Hant": "悉尼當日星曆計算：土星約 04:24 落下；凌晨火星 02:08、木星 02:13、金星 04:34 升起。水星鄰近太陽方向時不建議直接觀測。",
      "zh-Hans": "悉尼当日星历计算：土星约 04:24 落下；凌晨火星 02:08、木星 02:13、金星 04:34 升起。水星邻近太阳方向时不建议直接观测。",
      en: "Sydney ephemeris times: Saturn sets around 04:24; Mars rises at 02:08, Jupiter at 02:13 and Venus at 04:34. Avoid viewing Mercury when close to the Sun."
    },
    events: {
      "zh-Hant": "資料暫缺：本日 S／A 重大行星事件、JPL 交叉比對與90天日曆尚待獨立星曆核驗，不代表沒有重大事件。",
      "zh-Hans": "资料暂缺：本日 S／A 重大行星事件、JPL 交叉比对与90天日历尚待独立星历核验，不代表没有重大事件。",
      en: "Data unavailable: today's S/A major planetary events, JPL cross-checks and the 90-day calendar await independent ephemeris verification; this does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "資料暫缺：當日逐時能見度與實測光害資料暫缺；外出觀測前請先核對澳洲氣象局（BoM）悉尼最新預報並遠離強光。",
      "zh-Hans": "资料暂缺：当日逐时能见度与实测光害资料暂缺；外出观测前请先核对澳大利亚气象局（BoM）悉尼最新预报并远离强光。",
      en: "Data unavailable: hour-by-hour visibility and measured light-pollution readings are unavailable; check the latest Australian Bureau of Meteorology (BoM) Sydney forecast before observing."
    },
    sources: [
      { title: "Timeanddate · Sydney Astronomy (2026-11-08 AEDT/AEST)", url: "https://www.timeanddate.com/astronomy/australia/sydney" },
      { title: "Timeanddate · Sydney Moon, 2026-11", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney Night Sky Planets", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · Sydney Forecast", url: "https://www.bom.gov.au/places/nsw/north-sydney/forecast" }
    ]
  },
  {
    date: "2026-11-09",
    moon: {
      "zh-Hant": "朔月（新月附近）；12:21 過中天時照明 0.2%（月中天瞬時值，非全天固定照明）。05:14 月出，19:37 月落。",
      "zh-Hans": "朔月（新月附近）；12:21 过中天时照明 0.2%（月中天瞬时值，非全天固定照明）。05:14 月出，19:37 月落。",
      en: "New Moon phase; 0.2% illuminated at its 12:21 meridian transit (transit instant, not fixed all day). Moonrise 05:14; moonset 19:37."
    },
    planets: {
      "zh-Hant": "悉尼當日星曆計算：土星約 04:20 落下；凌晨火星 02:05、木星 02:09、金星 04:30 升起。水星鄰近太陽方向時不建議直接觀測。",
      "zh-Hans": "悉尼当日星历计算：土星约 04:20 落下；凌晨火星 02:05、木星 02:09、金星 04:30 升起。水星邻近太阳方向时不建议直接观测。",
      en: "Sydney ephemeris times: Saturn sets around 04:20; Mars rises at 02:05, Jupiter at 02:09 and Venus at 04:30. Avoid viewing Mercury when close to the Sun."
    },
    events: {
      "zh-Hant": "資料暫缺：本日 S／A 重大行星事件、JPL 交叉比對與90天日曆尚待獨立星曆核驗，不代表沒有重大事件。",
      "zh-Hans": "资料暂缺：本日 S／A 重大行星事件、JPL 交叉比对与90天日历尚待独立星历核验，不代表没有重大事件。",
      en: "Data unavailable: today's S/A major planetary events, JPL cross-checks and the 90-day calendar await independent ephemeris verification; this does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "資料暫缺：當日逐時能見度與實測光害資料暫缺；外出觀測前請先核對澳洲氣象局（BoM）悉尼最新預報並遠離強光。",
      "zh-Hans": "资料暂缺：当日逐时能见度与实测光害资料暂缺；外出观测前请先核对澳大利亚气象局（BoM）悉尼最新预报并远离强光。",
      en: "Data unavailable: hour-by-hour visibility and measured light-pollution readings are unavailable; check the latest Australian Bureau of Meteorology (BoM) Sydney forecast before observing."
    },
    sources: [
      { title: "Timeanddate · Sydney Astronomy (2026-11-09 AEDT/AEST)", url: "https://www.timeanddate.com/astronomy/australia/sydney" },
      { title: "Timeanddate · Sydney Moon, 2026-11", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney Night Sky Planets", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · Sydney Forecast", url: "https://www.bom.gov.au/places/nsw/north-sydney/forecast" }
    ]
  },
  {
    date: "2026-11-10",
    moon: {
      "zh-Hant": "朔月（新月附近）；13:10 過中天時照明 0.8%（月中天瞬時值，非全天固定照明）。05:49 月出，20:38 月落。",
      "zh-Hans": "朔月（新月附近）；13:10 过中天时照明 0.8%（月中天瞬时值，非全天固定照明）。05:49 月出，20:38 月落。",
      en: "New Moon phase; 0.8% illuminated at its 13:10 meridian transit (transit instant, not fixed all day). Moonrise 05:49; moonset 20:38."
    },
    planets: {
      "zh-Hant": "悉尼當日星曆計算：土星約 04:15 落下；凌晨火星 02:03、木星 02:06、金星 04:27 升起。水星鄰近太陽方向時不建議直接觀測。",
      "zh-Hans": "悉尼当日星历计算：土星约 04:15 落下；凌晨火星 02:03、木星 02:06、金星 04:27 升起。水星邻近太阳方向时不建议直接观测。",
      en: "Sydney ephemeris times: Saturn sets around 04:15; Mars rises at 02:03, Jupiter at 02:06 and Venus at 04:27. Avoid viewing Mercury when close to the Sun."
    },
    events: {
      "zh-Hant": "資料暫缺：本日 S／A 重大行星事件、JPL 交叉比對與90天日曆尚待獨立星曆核驗，不代表沒有重大事件。",
      "zh-Hans": "资料暂缺：本日 S／A 重大行星事件、JPL 交叉比对与90天日历尚待独立星历核验，不代表没有重大事件。",
      en: "Data unavailable: today's S/A major planetary events, JPL cross-checks and the 90-day calendar await independent ephemeris verification; this does not mean there are no major events."
    },
    weather: {
      "zh-Hant": "資料暫缺：當日逐時能見度與實測光害資料暫缺；外出觀測前請先核對澳洲氣象局（BoM）悉尼最新預報並遠離強光。",
      "zh-Hans": "资料暂缺：当日逐时能见度与实测光害资料暂缺；外出观测前请先核对澳大利亚气象局（BoM）悉尼最新预报并远离强光。",
      en: "Data unavailable: hour-by-hour visibility and measured light-pollution readings are unavailable; check the latest Australian Bureau of Meteorology (BoM) Sydney forecast before observing."
    },
    sources: [
      { title: "Timeanddate · Sydney Astronomy (2026-11-10 AEDT/AEST)", url: "https://www.timeanddate.com/astronomy/australia/sydney" },
      { title: "Timeanddate · Sydney Moon, 2026-11", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney Night Sky Planets", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · Sydney Forecast", url: "https://www.bom.gov.au/places/nsw/north-sydney/forecast" }
    ]
  },
{
    date: "2026-11-11",
    moon: {
      "zh-Hant": "盈眉月；14:01 過中天時照明 3.4%（月中天瞬時值，非全天固定照明）。06:29 月出，21:36 月落。",
      "zh-Hans": "盈眉月；14:01 过中天时照明 3.4%（月中天瞬时值，非全天固定照明）。06:29 月出，21:36 月落。",
      en: "Waxing crescent; 3.4% illuminated at its 14:01 meridian transit (transit instant, not fixed all day). Moonrise 06:29; moonset 21:36."
    },
    planets: {
      "zh-Hant": "11月10日晚至11月11日晨可見時窗：土星於11月10日晚間至11月11日凌晨易觀，約 04:11 落下；11月11日凌晨火星 02:00、木星 02:02、金星 04:23 升起。水星緊貼太陽，不建議觀察。",
      "zh-Hans": "11月10日晚至11月11日晨可见时窗：土星于11月10日晚间至11月11日凌晨易观，约 04:11 落下；11月11日凌晨火星 02:00、木星 02:02、金星 04:23 升起。水星紧贴太阳，不建议观察。",
      en: "10 Nov evening to 11 Nov morning viewing window: Saturn is readily visible on the evening of 10 Nov and early 11 Nov, setting around 04:11; before dawn on 11 Nov, Mars rises at 02:00, Jupiter at 02:02 and Venus at 04:23. Mercury stays too close to the Sun and is not recommended for viewing."
    },
    events: {
      "zh-Hant": "資料暫缺：11月11日 S／A 重大行星事件、JPL 交叉比對、90天日曆與精確推送時序尚待獨立星曆核驗，不代表沒有重大事件。流星雨可能有候選觀測事件，發布前需再核對機構與本地可見性。",
      "zh-Hans": "资料暂缺：11月11日 S／A 重大行星事件、JPL 交叉比对、90天日历与精确推送时序尚待独立星历核验，不代表没有重大事件。流星雨可能有候选观测事件，发布前需再核对机构与本地可见性。",
      en: "Data unavailable: 11 November S/A major planetary events, JPL cross-checks, the 90-day calendar and exact push timing await independent ephemeris verification; this does not mean there are no major events. Meteor showers may have candidate viewing windows pending institutional and local visibility checks."
    },
    weather: {
      "zh-Hant": "澳洲氣象局（BoM）11月10日 16:20 AEDT 發布之11月11日悉尼區預報：部分多雲、局部陣雨，下午至傍晚可能雷暴，預測 16–26°C、降雨機率 50%（非逐小時能見度承諾）。實測光害資料暫缺；觀測前請確認最新雲雨並遠離強光。",
      "zh-Hans": "澳大利亚气象局（BoM）11月10日 16:20 AEDT 发布之11月11日悉尼区预报：部分多云、局部阵雨，下午至傍晚可能雷暴，预测 16–26°C、降雨概率 50%（非逐小时能见度承诺）。实测光害资料暂缺；观测前请确认最新云雨并远离强光。",
      en: "Australian Bureau of Meteorology (BoM) forecast issued 10 Nov 2026 16:20 AEDT for 11 Nov Sydney area: partly cloudy, isolated showers, possible afternoon/evening thunderstorm, 16–26°C, 50% rain chance (not an hour-by-hour visibility promise). Measured light-pollution data unavailable; check live clouds/rain and avoid bright lights."
    },
    sources: [
      { title: "Timeanddate · Sydney Astronomy (checked 2026-11-11 AEDT)", url: "https://www.timeanddate.com/astronomy/australia/sydney" },
      { title: "Timeanddate · Sydney Moon, November 2026 (checked 2026-11-11 AEDT)", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney Night Sky Planets, 10–11 Nov 2026", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · North Sydney / Sydney Forecast (issued 10 Nov 2026 16:20 AEDT)", url: "https://www.bom.gov.au/places/nsw/north-sydney/forecast" }
    ]
  },
  {
    date: "2026-11-12",
    moon: {
      "zh-Hant": "盈眉月；14:52 過中天時照明 7.8%（瞬時值，並非全天固定）。07:15 月出（124°），22:30 月落（236°）。",
      "zh-Hans": "盈眉月；14:52 过中天时照明 7.8%（瞬时值，并非全天固定）。07:15 月出（124°），22:30 月落（236°）。",
      en: "Waxing crescent; 7.8% illuminated at 14:52 meridian transit (an instant, not constant all day). Moonrise 07:15 (124°); moonset 22:30 (236°)."
    },
    planets: {
      "zh-Hant": "11月12日晨火星與木星均於 01:58 升起；約 05:09 木星在東北方。金星 04:20 升起，土星約 04:07 落下。水星靠近太陽，避免尋找。",
      "zh-Hans": "11月12日晨火星与木星均于 01:58 升起；约 05:09 木星在东北方。金星 04:20 升起，土星约 04:07 落下。水星靠近太阳，避免寻找。",
      en: "On 12 November Mars and Jupiter rise at 01:58; Jupiter is in the northeast around 05:09. Venus rises at 04:20; Saturn sets around 04:07. Avoid looking for Mercury near the Sun."
    },
    events: {
      "zh-Hant": "資料暫缺：當日重要天象及 S／A 行星事件尚未完整核驗；這不代表沒有重大事件。90天日曆與 JPL 交叉核對尚未完成。",
      "zh-Hans": "资料暂缺：当日重要天象及 S／A 行星事件尚未完整核验；这不代表没有重大事件。90天日历与 JPL 交叉核对尚未完成。",
      en: "Data unavailable: important astronomical phenomena and S/A planetary events have not been fully checked; this does not mean none occur. The 90-day calendar and JPL cross-check remain incomplete."
    },
    weather: {
      "zh-Hant": "逐時雲量、能見度及實測光害資料暫缺；觀測前請核對氣象局最新預報，選擇安全並遠離強光的地點。",
      "zh-Hans": "逐时云量、能见度及实测光害资料暂缺；观测前请核对气象局最新预报，选择安全并远离强光的地点。",
      en: "Hourly cloud, visibility and measured light-pollution data are unavailable. Check the latest Bureau of Meteorology forecast and choose a safe site away from bright lights."
    },
    sources: [
      { title: "Timeanddate · Sydney Moon, 12 Nov 2026; checked 12 Nov 03:58 AEDT", url: "https://www.timeanddate.com/moon/australia/sydney?month=11&year=2026" },
      { title: "Timeanddate · Sydney Night Sky, 11–12 Nov 2026; checked 12 Nov 03:58 AEDT", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Zeninnov8 · Sydney Jupiter direction, 12 Nov 2026; checked 12 Nov 04:00 AEDT", url: "https://zeninnov8.com/tonights-sky/sydney/" },
      { title: "Australian Bureau of Meteorology · Sydney forecast", url: "https://www.bom.gov.au/places/nsw/north-sydney/forecast" }
    ]
  }
];

const UI: Record<Lang, {
  title: string; subtitle: string; archived: string; moon: string;
  planets: string; events: string; weather: string; sources: string;
  daily: string; why: string; actions: string; signature: string; note: string; tips: string[];
}> = {
  "zh-Hant": {
    title: "日期觀測紀錄", subtitle: "已核對日期的靜態快照 · 非自動每日更新", archived: "歷史觀測紀錄，尚未更新到今日",
    moon: "月相與升落", planets: "行星動態", events: "行星事件核驗", weather: "觀測提醒",
    sources: "完整紀錄及資料來源", daily: "觀測摘要", why: "如何理解",
    actions: "該日觀測建議", signature: "觀天有時，行事有度",
    note: "以上為天文觀測。占星象徵與八字判斷不屬同一證據層，另行標示。",
    tips: ["今晚看土星前先查看雲量與雨勢。", "避開街燈並選擇安全、視野開闊的位置。", "若想看木星與火星，安排11月2日黎明前觀測。"]
  },
  "zh-Hans": {
    title: "日期观测记录", subtitle: "已核对日期的静态快照 · 非自动每日更新", archived: "历史观测记录，尚未更新到今日",
    moon: "月相与升落", planets: "行星动态", events: "行星事件核验", weather: "观测提醒",
    sources: "完整记录及数据来源", daily: "观测摘要", why: "如何理解",
    actions: "该日观测建议", signature: "观天有时，行事有度",
    note: "以上为天文观测。占星象征与八字判断不属同一证据层，另行标示。",
    tips: ["今晚看土星前先查看云量与雨势。", "避开街灯并选择安全、视野开阔的位置。", "如想看木星与火星，安排11月2日黎明前观测。"]
  },
  en: {
    title: "Dated sky observation", subtitle: "Verified-date snapshot · not updated automatically", archived: "Archived observation; today's update is not available",
    moon: "Moon phase and rise/set", planets: "Planet visibility", events: "Planetary event verification", weather: "Viewing advice",
    sources: "Full record and sources", daily: "Observation summary", why: "How to interpret it",
    actions: "Guidance for this recorded date", signature: "Watch the sky; act with care",
    note: "Astronomy is presented here as observation. Astrological symbolism and BaZi judgments are separate evidence layers.",
    tips: ["Check clouds and rain before viewing Saturn tonight.", "Choose a safe open view away from streetlights.", "For Jupiter and Mars, plan an observation before dawn on 2 November."]
  }
};

export function DailySkyObservation() {
  const { locale } = useI18n();
  const lang: Lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const [today, setToday] = useState(() => sydneyDate(new Date()));
  useEffect(() => {
    const update = () => setToday(sydneyDate(new Date()));
    const timer = window.setInterval(update, 30_000);
    document.addEventListener("visibilitychange", update);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, []);
  const observation = OBSERVATIONS.filter((entry) => entry.date <= today).at(-1);
  const ui = UI[lang];
  if (!observation) return null;
  const stale = observation.date !== today;
  const zoneName = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", timeZoneName: "short" })
    .formatToParts(new Date(`${observation.date}T12:00:00Z`)).find((part) => part.type === "timeZoneName")?.value ?? "Australia/Sydney";
  return (
    <section className="daily-sky" aria-label={ui.title}>
      <header>
        <span className="daily-sky-kicker">ZHAOWU · SYDNEY SKY</span>
        <h2>{ui.title}</h2><p>{ui.subtitle}</p>
        <time dateTime={observation.date}>{observation.date} · Australia/Sydney ({zoneName})</time>
        <p className="daily-sky-record-notice">{lang === "en"
          ? "This is a dated research record, not a live sky feed or a promise of daily updates."
          : lang === "zh-Hans"
            ? "此为指定日期的资料记录，并非实时天象或每日自动更新。"
            : "此為指定日期的資料紀錄，並非即時天象或每日自動更新。"}</p>
      </header>
      {stale && <p className="daily-sky-stale" role="status">{ui.archived}</p>}
      <div className="daily-sky-columns">
        <section><h3>{ui.moon}</h3><p>{observation.moon[lang]}</p></section>
        <section><h3>{ui.planets}</h3><p>{observation.planets[lang]}</p></section>
      </div>
      <p className="daily-sky-quote">{ui.signature}</p>
      
      <section><h3>{ui.why}</h3><p>{observation.date === "2026-11-01"
        ? (lang === "en" ? "Late spring in Sydney brings later sunsets, while planetary visibility depends on the actual horizon and weather, not on astrology." : lang === "zh-Hans" ? "悉尼正值春末，日落渐晚；能否看见行星取决于地平线和天气，不代表命运变化。" : "悉尼正值春末，日落漸晚；能否看見行星取決於地平線和天氣，不代表命運變化。")
        : ui.note}</p></section>
      <section><h3>{ui.events}</h3><p>{observation.events[lang]}</p></section>
      <section><h3>{ui.weather}</h3><p>{observation.weather[lang]}</p></section>
      {observation.date === "2026-11-01" && <section><h3>{ui.actions}</h3><ul>{ui.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></section>}
      {observation.date === "2026-11-02" && <section><h3>{ui.actions}</h3><ul>{(lang === "en" ? ["Check the latest clouds and weather before observing.", "Choose a safe site with an open northeastern horizon.", "Before sunrise, look for Jupiter and Mars; do not point optical equipment near the Sun."] : lang === "zh-Hans" ? ["观测前查看最新云量及天气。", "选择安全、东北方视野开阔的地点。", "日出前寻找木星与火星；光学器材不要指向太阳附近。"] : ["觀測前查看最新雲量及天氣。", "選擇安全、東北方視野開闊的地點。", "日出前尋找木星與火星；光學器材不要指向太陽附近。"]).map((tip) => <li key={tip}>{tip}</li>)}</ul></section>}
      {observation.date === "2026-11-03" && <section><h3>{ui.actions}</h3><ul>{(lang === "en" ? ["Check local cloud cover before dawn.", "Choose a safe eastern view of the sky, away from traffic and bright lights."] : lang === "zh-Hans" ? ["黎明前检查当地云量。", "选择安全、东侧视野开阔且远离强光的位置。"] : ["黎明前檢查當地雲量。", "選擇安全、東側視野開闊且遠離強光的位置。"]).map((tip) => <li key={tip}>{tip}</li>)}</ul></section>}
      {observation.date === "2026-11-12" && <section><h3>{ui.actions}</h3><ul>{(lang === "en" ? ["Before dawn, look northeast for Jupiter around 05:09; Mars is also above the horizon.", "Check the latest cloud and rain forecast, then choose a safe place away from bright lights.", "Never point optical equipment toward the Sun."] : lang === "zh-Hans" ? ["黎明前约 05:09 向东北方寻找木星；火星也已升起。", "先查看最新云雨预报，再选择安全、远离强光的地点。", "不要将光学器材指向太阳。"] : ["黎明前約 05:09 向東北方尋找木星；火星也已升起。", "先查看最新雲雨預報，再選擇安全、遠離強光的地點。", "不要將光學器材指向太陽。"]).map((tip) => <li key={tip}>{tip}</li>)}</ul></section>}
      {observation.date === "2026-11-11" && <section><h3>{ui.actions}</h3><ul>{(lang === "en" ? ["11 Nov 02:00–04:30 AEDT: look east-northeast before dawn for Mars (rises 02:00), Jupiter (02:02) and low-horizon Venus (04:23); Saturn sets around 04:11.", "Afternoon to evening carries a 50% shower chance and possible thunderstorm; verify live BoM radar and cloud cover before heading out.", "Do not attempt to view Mercury near the Sun; choose a safe, open vantage point away from street glare."] : lang === "zh-Hans" ? ["11月11日凌晨 02:00–04:30 AEDT 可朝东北偏东观察火星（02:00升）、木星（02:02升）与低空金星（04:23升）；土星约 04:11 落下。", "下午至傍晚有局部阵雨与可能雷暴（降雨概率 50%），外出前请先核对气象局实时云雨。", "水星紧贴太阳切勿使用光学器材寻找；请选择安全、避开街灯眩光的开阔位置。"] : ["11月11日凌晨 02:00–04:30 AEDT 可朝東北偏東觀察火星（02:00升）、木星（02:02升）與低空金星（04:23升）；土星約 04:11 落下。", "下午至傍晚有局部陣雨與可能雷暴（降雨機率 50%），外出前請先核對氣象局即時雲雨。", "水星緊貼太陽切勿使用光學器材尋找；請選擇安全、避開街燈眩光的開闊位置。"]).map((tip) => <li key={tip}>{tip}</li>)}</ul></section>}
      <details>
        <summary>{ui.sources}</summary>
        <p><time dateTime={observation.date}>{observation.date}</time> · Australia/Sydney</p>
        <ul>{observation.sources.map((source) => <li key={source.url}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
        </li>)}</ul>
        {OBSERVATIONS.filter((entry) => entry.date < observation.date).map((old) =>
          <details key={old.date}><summary>{old.date}</summary><p>{old.moon[lang]}</p><p>{old.planets[lang]}</p></details>
        )}
      </details>
      <p className="daily-sky-note">{ui.note}</p>
    </section>
  );
}
