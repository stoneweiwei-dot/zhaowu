import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import type { SpecialistReading } from "@/lib/specialist-reading";
import { decoratePosition, formatDegree, houseOf } from "@/lib/western-astrology/engine";
import "@/specialist-chart.css";

const signs = ["白羊", "金牛", "雙子", "巨蟹", "獅子", "處女", "天秤", "天蠍", "射手", "摩羯", "水瓶", "雙魚"];
const names: Record<string, string> = { sun: "太陽", moon: "太陰", mercury: "水星", venus: "金星", mars: "火星", jupiter: "木星", saturn: "土星", ji: "計都", luo: "羅睺", bei: "月孛", ziqi: "紫氣" };
export function ChartTable({ title, headers, rows }: { title: string; headers: string[]; rows: ReactNode[][] }) {
  return <div className="zw-chart-scroll" tabIndex={0} role="region" aria-label={title}><table className="zw-chart-table"><caption>{title}</caption><thead><tr>{headers.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th scope="row" key={j}>{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
function position(lon: number, locale: Locale) { const p = decoratePosition("Sun", lon); return `${locale === "en" ? p.sign : signs[p.signIndex]} ${formatDegree(p)}`; }
const xy = (degree: number, radius: number) => ({ x: 220 - radius * Math.cos(degree * Math.PI / 180), y: 220 + radius * Math.sin(degree * Math.PI / 180) });
function Wheel({ points, cusps, locale }: { points: { longitude: number }[]; cusps?: number[]; locale: Locale }) {
  const origin = cusps?.[0] ?? 0;
  return <svg className="zw-chart-wheel" viewBox="0 0 440 440" role="img" aria-label={locale === "en" ? "Zodiac positions; numbered points match the table" : "星位圓盤：編號對應下方星位表"}>
    <circle cx="220" cy="220" r="206"/><circle cx="220" cy="220" r="172"/><circle cx="220" cy="220" r="108"/>
    {signs.map((_, i) => { const a=xy(i*30-origin,172),b=xy(i*30-origin,206),t=xy(i*30+15-origin,189); return <g key={i}><path d={`M${a.x},${a.y} L${b.x},${b.y}`}/><text x={t.x} y={t.y}>{["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"][i]}</text></g>; })}
    {cusps?.map((c,i)=>{ const a=xy(c-origin,38),b=xy(c-origin,172);const width=((cusps[(i+1)%12]-c+360)%360);const t=xy(c+width/2-origin,85);return <g key={i}><path d={`M${a.x},${a.y} L${b.x},${b.y}`}/><text x={t.x} y={t.y}>{i+1}</text></g>;})}
    {points.map((p,i)=>{const a=xy(p.longitude-origin,171),b=xy(p.longitude-origin,117+(i%3)*18);return <g key={i}><path d={`M${a.x},${a.y} L${b.x},${b.y}`}/><circle cx={a.x} cy={a.y} r="3"/><circle className="zw-star-label" cx={b.x} cy={b.y} r="10"/><text x={b.x} y={b.y}>{i+1}</text></g>;})}
  </svg>;
}
export function SpecialistChart({ chart, locale }: { chart: NonNullable<SpecialistReading["chart"]>; locale: Locale }) {
  const en=locale==="en";
  if(chart.kind==="ziwei") {
    const c=chart.data;const order=["巳","午","未","申","辰","酉","卯","戌","寅","丑","子","亥"];
    const cells=[[1,1],[1,2],[1,3],[1,4],[2,1],[2,4],[3,1],[3,4],[4,1],[4,2],[4,3],[4,4]];
    const starText=(star:string)=>{const m=Object.entries(c.mutagens).filter(([,v])=>v===star).map(([k])=>k);return `${star}${m.length ? ` · ${m.join("/")}` : ""}`;};
    return <section className="zw-chart" data-natal-chart="ziwei"><h2>{en?"Zi Wei · Twelve palaces":"紫微斗數 · 十二宮命盤"}</h2><div className="zw-chart-scroll" tabIndex={0} role="region" aria-label={en?"Twelve-palace chart":"十二宮命盤，可左右滑動"}><div className="zw-ziwei-grid"><div className="zw-ziwei-center"><strong>{c.fiveElementsBureau.name}</strong><p>{en?"Life":"命宮"}：{c.soulPalace}</p><p>{en?"Body":"身宮"}：{c.bodyPalace}</p><p>{en?"Natal transformations":"生年四化"}</p>{Object.entries(c.mutagens).map(([k,v])=><span key={k}>{v} · {k}</span>)}</div>{order.map((branch,i)=>{const p=c.palaces.find(p=>p.branch===branch)!;const stars=Object.entries(c.majorStars).filter(([,b])=>b===branch);const aux=Object.entries(c.auxiliaries).filter(([,b])=>b===branch);return <article className="zw-palace" key={branch} style={{gridRow:cells[i][0],gridColumn:cells[i][1]}}><h3>{en?p.id:p.name} {p.stem}{branch}</h3>{p.isBodyPalace?<b>{en?"Body palace":"身宮"}</b>:null}<p>{stars.length?stars.map(([s])=>starText(s)).join("、"):en?"No major star":"無十四主星"}</p><small>{aux.map(([s])=>starText(s)).join("、")||"—"}</small></article>;})}</div></div></section>;
  }
  const q=chart.kind==="qizheng";const bodies=q?chart.data.bodies:chart.bodies;const houses=chart.kind==="western"?chart.houses:undefined;
  const bodyName=(key:string)=>en?key[0].toUpperCase()+key.slice(1):names[key]??key;
  return <section className="zw-chart" data-natal-chart={chart.kind}><h2>{q?(en?"Seven Luminaries & Four Surplus · Chart":"七政四餘 · 命盤表"):(en?"Western natal chart":"西洋占星 · 本命星盤")}</h2>
    <p>{q?(en?"Tropical zodiac palaces; the four surplus points are derived or traditional points, not physical planets.":"沿用現行回歸黃道十二宮；四餘為推導或傳統虛點，與實體行星分開標示。"):(en?`Tropical zodiac · ${houses?.system ?? "—"}`:`回歸黃道 · ${houses?.system === "placidus" ? "Placidus 宮制" : "整宮制"}`)}</p>
    {houses?.fallback?<p>{en?houses.fallback:"此緯度無法使用 Placidus，已依現行引擎改用整宮制。"}</p>:null}
    <Wheel points={bodies} cusps={houses?.cusps} locale={locale}/>
    <ChartTable title={en?"Positions":"星曜位置與度數"} headers={["#",en?"Body":"星曜",en?"Zodiac position":"星座／度分",q?(en?"Palace":"黃道宮"):en?"House":"落宮",en?"Motion / type":"運行／類型"]} rows={bodies.map((b,i)=>[i+1,bodyName(b.key),position(b.longitude,locale),q?b.palace:houses?houseOf(b.longitude,houses):"—",`${b.retrograde?(en?"Retrograde":"逆行"):(en?"Direct":"順行")} · ${b.virtual?(b.confidence==="traditional"?(en?"Traditional point":"傳統虛點"):(en?"Derived point":"推導虛點")):(en?"Planetary position":"天體位置")}`])}/>
    {houses?<ChartTable title={en?"Twelve house cusps and occupants":"十二宮宮頭與宮內星曜"} headers={[en?"House":"宮位",en?"Cusp":"宮頭星座／度分",en?"Occupants":"宮內星曜"]} rows={houses.cusps.map((c,i)=>[i+1,position(c,locale),bodies.filter(b=>houseOf(b.longitude,houses)===i+1).map(b=>bodyName(b.key)).join("、")||"—"])}/>:null}
    {chart.kind==="western"&&chart.angles?<ChartTable title={en?"Four angles":"四軸位置"} headers={[en?"Angle":"四軸",en?"Position":"星座／度分"]} rows={[["ASC",chart.angles.ascendant],["MC",chart.angles.mc],["DSC",chart.angles.descendant],["IC",chart.angles.ic]].map(([k,v])=>[k,position(Number(v),locale)])}/>:null}
  </section>;
}
