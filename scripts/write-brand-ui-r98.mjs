import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brand = join(root, "public/brand-ui");
const icons = join(brand, "icons");

const FONT = "Songti TC, Songti SC, STSong, 'Noto Serif CJK TC', PMingLiU, serif";
const GOLD = "#D4B074";
const PINE = "#1F4E3A";
const IVORY = "#FAF8F1";
const NIGHT = "#0B2F26";
const MOON = "#EAE6D7";
const JADE = "#2F5D4F";
const SAGE = "#8A9C88";
const RED = "#9C2B24";

function svg(body, viewBox = "0 0 200 200") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none">${body}</svg>\n`;
}

function icon(inner) {
  return svg(
    `<circle cx="32" cy="32" r="28.5" stroke="${GOLD}" stroke-width="2"/>${inner}`,
    "0 0 64 64",
  );
}

const files = {
  "logo-horizontal.svg": svg(
    `<rect x="3" y="3" width="354" height="90" rx="45" fill="${IVORY}" stroke="${GOLD}" stroke-width="3"/>
     <text x="42" y="62" fill="${GOLD}" font-family="${FONT}" font-size="42" font-weight="650">昭梧</text>
     <g stroke="${GOLD}" stroke-width="3.2" stroke-linecap="round" fill="none">
       <path d="M236 58c18-18 36-18 54 0 12-12 28-12 46 2"/>
       <path d="M252 70c12-10 24-10 38 1 10-8 22-8 36 2"/>
     </g>`,
    "0 0 360 96",
  ),
  "logo-horizontal-night.svg": svg(
    `<rect x="3" y="3" width="354" height="90" rx="45" fill="${NIGHT}" stroke="${GOLD}" stroke-width="3"/>
     <text x="42" y="62" fill="${GOLD}" font-family="${FONT}" font-size="42" font-weight="650">昭梧</text>
     <g stroke="${GOLD}" stroke-width="3.2" stroke-linecap="round" fill="none">
       <path d="M236 58c18-18 36-18 54 0 12-12 28-12 46 2"/>
       <path d="M252 70c12-10 24-10 38 1 10-8 22-8 36 2"/>
     </g>`,
    "0 0 360 96",
  ),
  "badge-vertical.svg": svg(
    `<rect x="6" y="6" width="84" height="208" rx="42" fill="${IVORY}" stroke="${GOLD}" stroke-width="3"/>
     <text x="48" y="92" text-anchor="middle" fill="${GOLD}" font-family="${FONT}" font-size="38" font-weight="650">昭</text>
     <text x="48" y="140" text-anchor="middle" fill="${GOLD}" font-family="${FONT}" font-size="38" font-weight="650">梧</text>
     <path d="M22 176c12-10 24-10 36 2 10-8 20-8 32 2" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round"/>`,
    "0 0 96 220",
  ),
  "wordmark.svg": svg(
    `<text x="8" y="52" fill="${GOLD}" font-family="${FONT}" font-size="48" font-weight="650">昭梧</text>`,
    "0 0 140 72",
  ),
  "wordmark-night.svg": svg(
    `<text x="8" y="52" fill="${MOON}" font-family="${FONT}" font-size="48" font-weight="650">昭梧</text>`,
    "0 0 140 72",
  ),
  "motif-sun.svg": svg(`<circle cx="32" cy="32" r="16" fill="${GOLD}"/>`, "0 0 64 64"),
  "motif-moon.svg": svg(
    `<path d="M40 12a20 20 0 1 0 12 36 16 16 0 1 1-12-36Z" fill="${GOLD}"/>`,
    "0 0 64 64",
  ),
  "motif-star.svg": svg(
    `<path d="M32 8l4.2 16.4L52 28l-12.6 9.2L43 54 32 44.6 21 54l3.6-16.8L12 28l15.8-3.6Z" fill="${GOLD}"/>`,
    "0 0 64 64",
  ),
  "motif-diamond.svg": svg(
    `<path d="M32 10l10 22-10 22L22 32Z" fill="${GOLD}"/>`,
    "0 0 64 64",
  ),
  "motif-cloud.svg": svg(
    `<g stroke="${GOLD}" stroke-width="3.2" stroke-linecap="round" fill="none">
      <path d="M8 36c16-16 32-16 48 0 12-12 24-10 40 4"/>
      <path d="M20 48c12-10 24-10 36 2"/>
    </g>`,
    "0 0 96 64",
  ),
  "motif-mountain.svg": svg(
    `<path d="M8 52 28 22l12 16 8-10 20 24H8Z" fill="${SAGE}"/>
     <path d="M8 52h60" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>`,
    "0 0 76 64",
  ),
  "motif-water.svg": svg(
    `<g stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round">
      <path d="M6 22c10-8 18-8 28 0 10-8 18-8 28 0"/>
      <path d="M6 34c10-8 18-8 28 0 10-8 18-8 28 0"/>
      <path d="M6 46c10-8 18-8 28 0 10-8 18-8 28 0"/>
    </g>`,
    "0 0 68 64",
  ),
  "seal-red.svg": svg(
    `<rect x="6" y="6" width="52" height="52" rx="6" fill="${RED}"/>
     <text x="32" y="28" text-anchor="middle" fill="${IVORY}" font-family="${FONT}" font-size="16" font-weight="700">昭</text>
     <text x="32" y="48" text-anchor="middle" fill="${IVORY}" font-family="${FONT}" font-size="16" font-weight="700">梧</text>`,
    "0 0 64 64",
  ),
  "seal-gold.svg": svg(
    `<rect x="5" y="5" width="54" height="54" rx="6" fill="${IVORY}" stroke="${GOLD}" stroke-width="3"/>
     <text x="32" y="28" text-anchor="middle" fill="${GOLD}" font-family="${FONT}" font-size="16" font-weight="700">昭</text>
     <text x="32" y="48" text-anchor="middle" fill="${GOLD}" font-family="${FONT}" font-size="16" font-weight="700">梧</text>`,
    "0 0 64 64",
  ),
  "seal-pine.svg": svg(
    `<circle cx="32" cy="32" r="28" fill="${PINE}"/>
     <path d="M18 40c5-10 14-10 20 0-6 5-14 5-20 0Z" fill="${SAGE}"/>
     <path d="M26 30c5-10 14-10 20 0-6 5-14 5-20 0Z" fill="${SAGE}"/>
     <path d="M32 22c5-10 14-10 20 0-6 5-14 5-20 0Z" fill="${SAGE}"/>`,
    "0 0 64 64",
  ),
  "frame-title.svg": svg(
    `<rect x="4" y="8" width="232" height="48" rx="16" fill="${IVORY}" stroke="${GOLD}" stroke-width="2"/>
     <path d="M18 32l4-6 4 6-4 6Z" fill="${GOLD}"/>
     <path d="M218 32l4-6 4 6-4 6Z" fill="${GOLD}"/>`,
    "0 0 240 64",
  ),
  "divider-diamond.svg": svg(
    `<path d="M8 16h70" stroke="${GOLD}" stroke-width="1.4"/>
     <path d="M92 16l6-8 6 8-6 8Z" fill="${GOLD}"/>
     <path d="M118 16h70" stroke="${GOLD}" stroke-width="1.4"/>`,
    "0 0 196 32",
  ),
  "corner-a.svg": svg(
    `<path d="M8 48V14c0-4 4-8 8-8h34" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>
     <path d="M16 28 8 14h18" stroke="${GOLD}" stroke-width="2" stroke-linejoin="round"/>`,
    "0 0 56 56",
  ),
};

const iconGlyphs = {
  home: `<path fill="${PINE}" d="M18 30 32 18l14 12v16h-9V36h-10v10h-9Z"/>`,
  articles: `<path fill="${PINE}" d="M20 16h18l8 8v24H20Zm16 2v8h8"/><path stroke="${IVORY}" stroke-width="2" d="M24 32h16M24 38h12"/>`,
  reports: `<path fill="${PINE}" d="M20 42V30h6v12zm10 0V22h6v20zm10 0V26h6v16z"/>`,
  calendar: `<rect x="18" y="20" width="28" height="26" rx="3" fill="${PINE}"/><path fill="${IVORY}" d="M22 30h20v12H22z"/><path stroke="${PINE}" stroke-width="2" d="M24 16v6M40 16v6"/>`,
  search: `<circle cx="28" cy="28" r="9" stroke="${PINE}" stroke-width="3"/><path stroke="${PINE}" stroke-width="3" stroke-linecap="round" d="M35 35l9 9"/>`,
  account: `<circle cx="32" cy="24" r="8" fill="${PINE}"/><path fill="${PINE}" d="M16 46c2-10 10-14 16-14s14 4 16 14Z"/>`,
  login: `<rect x="18" y="18" width="16" height="28" rx="2" stroke="${PINE}" stroke-width="2.4"/><path fill="${PINE}" d="M30 30h16l-6-6v4h-10v4h10v4Z"/>`,
  bookmark: `<path fill="${PINE}" d="M22 16h20v32l-10-7-10 7Z"/>`,
  favorite: `<path fill="${PINE}" d="M32 46s-14-9-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 20-14 20Z"/>`,
  share: `<circle cx="44" cy="20" r="5" fill="${PINE}"/><circle cx="18" cy="32" r="5" fill="${PINE}"/><circle cx="44" cy="44" r="5" fill="${PINE}"/><path stroke="${PINE}" stroke-width="2.4" d="M22.5 30.2 39.4 22.2M22.5 33.8 39.4 41.8"/>`,
  settings: `<path fill="${PINE}" d="M32 18 36 22l6-1 2 5-4 4 4 4-2 5-6-1-4 4-4-4-6 1-2-5 4-4-4-4 2-5 6 1 4-4Zm0 9a5 5 0 1 0 .01 0Z"/>`,
  language: `<circle cx="32" cy="32" r="14" stroke="${PINE}" stroke-width="2.6"/><path stroke="${PINE}" stroke-width="2" d="M18 32h28M32 18c4 5 6 9 6 14s-2 9-6 14c-4-5-6-9-6-14s2-9 6-14Z"/>`,
  history: `<circle cx="32" cy="32" r="14" stroke="${PINE}" stroke-width="2.6"/><path stroke="${PINE}" stroke-width="2.4" stroke-linecap="round" d="M32 24v9l6 4"/><path stroke="${PINE}" stroke-width="2.4" stroke-linecap="round" d="M22 20l-4 8 8-2"/>`,
  message: `<path fill="${PINE}" d="M16 20h32v22H28l-8 8v-8H16Z"/>`,
  insight: `<path fill="${PINE}" d="M32 14l3 12 12 3-12 3-3 12-3-12-12-3 12-3Z"/>`,
  night: `<path fill="${PINE}" d="M38 16a16 16 0 1 0 10 28 13 13 0 1 1-10-28Z"/>`,
  day: `<circle cx="32" cy="32" r="8" fill="${PINE}"/><g stroke="${PINE}" stroke-width="2.4" stroke-linecap="round"><path d="M32 16v5M32 43v5M16 32h5M43 32h5M21 21l3.5 3.5M39.5 39.5 43 43M43 21l-3.5 3.5M21 43l3.5-3.5"/></g>`,
  lock: `<rect x="22" y="28" width="20" height="16" rx="3" fill="${PINE}"/><path stroke="${PINE}" stroke-width="2.6" d="M26 28v-6a6 6 0 0 1 12 0v6"/>`,
  payment: `<rect x="16" y="22" width="32" height="20" rx="3" fill="${PINE}"/><path fill="${GOLD}" d="M16 28h32v4H16z"/>`,
};

await mkdir(icons, { recursive: true });

for (const [name, content] of Object.entries(files)) {
  await writeFile(join(brand, name), content);
}

for (const [name, inner] of Object.entries(iconGlyphs)) {
  await writeFile(join(icons, `${name}.svg`), icon(inner));
}

console.log(`wrote ${Object.keys(files).length + Object.keys(iconGlyphs).length} brand-ui r98 assets`);
