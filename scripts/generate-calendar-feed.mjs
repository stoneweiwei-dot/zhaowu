import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const out = resolve(root, "dist");
mkdirSync(out, { recursive: true });
const sydneyDate = (instant) => new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
const parseDate = (value) => { const [y, m, d] = value.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const format = (date) => `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
const today = parseDate(sydneyDate(new Date()));
const events = Array.from({ length: 60 }, (_, i) => {
  const start = new Date(today.getTime() + i * 86400000); const end = new Date(start.getTime() + 86400000); const stamp = format(start);
  return ["BEGIN:VEVENT", `UID:daily-colors-${stamp}@zhao-wu.com`, `DTSTAMP:${format(new Date())}T000000Z`, `DTSTART;VALUE=DATE:${stamp}`, `DTEND;VALUE=DATE:${format(end)}`, "SUMMARY:今日五行色彩", "DESCRIPTION:查看今日五行色彩建議 https://zhao-wu.com/daily-colors", "URL:https://zhao-wu.com/daily-colors", "END:VEVENT"].join("\r\n");
});
writeFileSync(resolve(out, "calendar.ics"), ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ZHAOWU//Daily Five Element Colors//ZH", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...events, "END:VCALENDAR", ""].join("\r\n"));

const routeMeta = JSON.parse(readFileSync(resolve(root, "src/lib/route-meta.json"), "utf8"));
const changelog = readFileSync(resolve(root, "src/lib/public-changelog.ts"), "utf8");
const items = [...changelog.matchAll(/\{\s*id:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"[\s\S]*?zhHant:\s*\{\s*title:\s*"((?:[^"\\]|\\.)*)",\s*summary:\s*"((?:[^"\\]|\\.)*)"/g)].slice(0, 20).map((m) => ({ id: m[1], date: m[2], title: m[3].replaceAll('\\"', '"'), summary: m[4].replaceAll('\\"', '"'), link: `https://zhao-wu.com/updates#${m[1]}` }));
if (!items.length) throw new Error("No public changelog items found");
const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
const siteTitle = routeMeta.routes["/"]["zh-Hant"].title;
const siteDescription = routeMeta.routes["/"]["zh-Hant"].description;
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(siteTitle)}</title><link>https://zhao-wu.com/</link><description>${esc(siteDescription)}</description><language>zh-Hant</language>${items.map((item) => `<item><title>${esc(item.title)}</title><link>${esc(item.link)}</link><guid isPermaLink="false">${esc(item.id)}</guid><pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate><description>${esc(item.summary)}</description></item>`).join("")}</channel></rss>\n`;
writeFileSync(resolve(out, "feed.xml"), xml);
