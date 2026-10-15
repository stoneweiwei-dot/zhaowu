/**
 * Vetted evergreen post bank for the owner auto-publisher (zero AI cost, no live generation).
 *
 * Rules every entry follows (enforced by scripts/social-autopublish.test.mjs):
 *  - Traditional Chinese, one idea per post, no promises about outcomes, no fabricated testimonials.
 *  - Final text (body + blank line + link) <= 500 UTF-8 bytes so it fits Threads.
 *  - Only links to public pages that exist on the site.
 * Add new entries at the END so the rotation order of existing ones does not change.
 */

export const SITE_URL = "https://stone-zhaowu-official.vercel.app";

export const SOCIAL_CONTENT_BANK = [
  { key: "cycle-sheng-ke", path: "/knowledge", body: "五行不是五種性格標籤，而是一套流動的關係：木生火、火生土、土生金、金生水、水生木。看命盤，先看誰生誰、誰被誰消耗，而不是只數每種有幾個。" },
  { key: "day-master", path: "/knowledge", body: "八字裡的「日主」，是你出生那天的天干，也是整張命盤的參照中心。同樣是甲木，生在春天和生在秋天，處境完全不同，所以不能只看一個字。" },
  { key: "month-command", path: "/knowledge", body: "月令，也就是出生月的地支，是判斷日主強弱最重的一項。八字的「月」以節氣為界，不是農曆初一，生在月初或月底的人要先確認節氣。" },
  { key: "lichun-boundary", path: "/knowledge", body: "八字的年柱不是從正月初一換，而是以立春為界。立春前後出生的人，年柱可能和你以為的不同。排盤之前，先核對出生的日期與時刻。" },
  { key: "birth-hour", path: "/", body: "出生時辰決定時柱。一個時辰是兩個小時，子時橫跨 23:00 到隔天 01:00。不確定時辰的話，與其硬猜，不如先看年月日三柱能說清楚哪些事。" },
  { key: "luck-cycles", path: "/knowledge", body: "大運大約十年換一次，像是人生各階段的天氣。命盤是原局，大運是背景，兩者放在一起看，才不會把某個階段的狀態當成一輩子的定論。" },
  { key: "structure-not-verdict", path: "/knowledge", body: "命理比較適合當作「結構分析」，而不是判決書。它能幫你看清自己的偏重與缺口，但怎麼選、怎麼做，永遠還是你自己的事。" },
  { key: "wood-yang-yin", path: "/knowledge", body: "甲木像大樹，向上生長，需要根基與陽光；乙木像藤草，柔韌，懂得借力。同樣屬木，處事方式差很多，五行之下還有陰陽這一層。" },
  { key: "fire-yang-yin", path: "/knowledge", body: "丙火像太陽，光明外放；丁火像燭火與爐火，內斂而精準。火旺的人不一定急躁，要看有沒有水來調候、有沒有土來收斂。" },
  { key: "earth-yang-yin", path: "/knowledge", body: "戊土像山，厚重穩定；己土像田園，包容滋養。土多不等於固執，土薄也不等於沒定力，要看周圍有什麼在生它、剋它。" },
  { key: "metal-yang-yin", path: "/knowledge", body: "庚金像刀劍，果斷直接；辛金像珠玉，講究細節與品味。金的力量需要火來煉、水來洗，沒有被打磨過的金，只是礦。" },
  { key: "water-yang-yin", path: "/knowledge", body: "壬水像江海，流動、格局大；癸水像雨露，細膩、善於滲透。水弱不代表不聰明，水過旺也不一定好，通常需要木來洩、土來制。" },
  { key: "seasons-base-color", path: "/knowledge", body: "春木、夏火、秋金、冬水，土旺在四季之末。出生的季節決定了命盤的底色，這也是同一個日主在不同季節像兩個人的原因。" },
  { key: "balance-not-equal", path: "/knowledge", body: "五行追求的是流通，不是平均。命盤缺某一種五行，不等於有缺陷；真正要看的是整體有沒有被卡住，能量能不能順著走。" },
  { key: "hidden-stems", path: "/knowledge", body: "地支裡藏著天干，叫「藏干」。同一個「寅」字，藏甲、丙、戊，它是木，也帶著火與土的影子。看地支，不要只看表面的那一個五行。" },
  { key: "clash-not-bad", path: "/knowledge", body: "六沖不是「凶」的同義詞。子午沖、卯酉沖代表變動與拉扯，變得好不好，取決於整體結構，而不是只看有沒有「沖」這個字。" },
  { key: "read-report-three", path: "/", body: "拿到命盤報告後，建議先讀三件事：日主強弱、五行偏重、目前走哪一步大運。這三件事清楚了，其他細節再慢慢看也不遲。" },
  { key: "ask-specific", path: "/", body: "問命盤之前，先把問題寫具體。「今年適不適合換工作」比「我的運勢如何」更容易得到有用的答案，也更容易自己拿來做決定。" },
  { key: "palm-relations", path: "/", body: "看掌紋時，生命線、智慧線、感情線只是基本框架。真正有意義的，是幾條線之間的關係，以及手掌整體的厚薄與紋路清晰度，單看一條線很容易誤判。" },
  { key: "professional-advice", path: "/", body: "命盤再清楚，也替代不了專業意見。健康、法律、財務上的重大決定，請先找對應領域的專業人士，命理只是幫你多一個思考的角度。" },
  { key: "quiz-six-realms", path: "/quiz/six-realms", body: "想先輕鬆玩一下？「六道習氣測驗」用幾個日常情境，看看你今天的狀態偏向哪一種慣性。結果只是參考，拿來和自己對話就好。" },
  { key: "quiz-divine-affinity", path: "/quiz/divine-affinity", body: "「仙佛淵源本緣測試」是一份偏趣味的小測驗，適合當作認識自己的另一個入口。它不是診斷，也不是預言，玩得開心比較重要。" },
  { key: "quiz-tea", path: "/tea-guardian", body: "七個問題，找到比較適合你的那一款茶。把五行的思路放進日常飲品選擇，是一種很生活化的練習。" },
  { key: "quiz-five-element", path: "/quiz/five-element-overdrive", body: "五行相關的小測驗，從日常習慣看你偏重哪一種功能。結果只是方向，不是標籤，想更仔細的話，再回頭看命盤。" },
  { key: "fun-tests-hub", path: "/fun-tests", body: "站內有一組輕鬆的趣味測驗，不需要懂命理術語就能玩。累的時候，花幾分鐘看看自己，也是一種休息。" },
  { key: "knowledge-hub", path: "/knowledge", body: "昭梧整理了五行、八字、掌相的基礎說明，從入門到進階都有。不用先懂術語，從你最好奇的那一篇開始看就好。" },
  { key: "updates-note", path: "/updates", body: "昭梧會持續整理與更新內容，最近的調整都記錄在更新頁，想知道網站最近改了什麼，可以從那裡看起。" },
  { key: "daily-colors", path: "/daily-colors", body: "把五行放進日常的方法之一，是留意每天的顏色。它不會改變命運，但可以是一個小小的、讓自己安定下來的儀式。" },
];

export function bankPostText(entry, siteUrl = SITE_URL) {
  return `${entry.body}\n\n${siteUrl}${entry.path}`;
}

/**
 * Pick the next entry: the first one never used, otherwise the one used longest ago.
 * `recentKeys` is newest-first (as returned by the queue gateway).
 */
export function pickBankEntry(recentKeys = [], bank = SOCIAL_CONTENT_BANK) {
  if (!bank.length) return null;
  const used = new Map();
  recentKeys.forEach((key, index) => { if (!used.has(key)) used.set(key, index); });
  const unused = bank.find((entry) => !used.has(entry.key));
  if (unused) return unused;
  return [...bank].sort((a, b) => (used.get(b.key) ?? -1) - (used.get(a.key) ?? -1))[0];
}
