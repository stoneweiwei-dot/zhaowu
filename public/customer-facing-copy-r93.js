const COPY = {
  "zh-Hant": {
    kicker: "一次填寫",
    title: "建立你的命盤",
    lead: "生辰只需填寫一次，各命理專卷會共用這份資料。",
    baziLead: "命盤依據上方出生資料自動排出。",
    pending: "完成出生資料後，這裡會顯示四柱命盤。",
    saved: "出生資料已保存",
    savedLead: "其他命理專卷會沿用這份出生資料。",
    useRecord: "將使用上方出生資料進行分析。",
  },
  "zh-Hans": {
    kicker: "一次填写",
    title: "建立你的命盘",
    lead: "生辰只需填写一次，各命理专卷会共用这份资料。",
    baziLead: "命盘依据上方出生资料自动排出。",
    pending: "完成出生资料后，这里会显示四柱命盘。",
    saved: "出生资料已保存",
    savedLead: "其他命理专卷会沿用这份出生资料。",
    useRecord: "将使用上方出生资料进行分析。",
  },
  en: {
    kicker: "ONE-TIME SETUP",
    title: "Build your chart",
    lead: "Enter your birth data once. Each personal reading can reuse it.",
    baziLead: "Calculated from the birth data above.",
    pending: "Complete your birth data to preview the Four Pillars chart.",
    saved: "Birth data saved",
    savedLead: "Other personal readings will reuse this birth data.",
    useRecord: "The analysis will use the birth data shown above.",
  },
};

function detectLocale(section) {
  const title = section?.querySelector("#zhaowu-customer-title")?.textContent || "";
  if (/Client details|Build your chart/i.test(title)) return "en";
  if (/客人资料|建立你的命盘/.test(title)) return "zh-Hans";
  const lang = document.documentElement.lang || "zh-Hant";
  if (/^en/i.test(lang)) return "en";
  if (/zh-(Hans|CN|SG)/i.test(lang)) return "zh-Hans";
  return "zh-Hant";
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function applyCustomerFacingCopy() {
  const section = document.querySelector("#customer-record");
  if (!section) return;
  const c = COPY[detectLocale(section)];
  setText(section.querySelector(".zhaowu-customer-head .zhaowu-section-kicker"), c.kicker);
  setText(section.querySelector("#zhaowu-customer-title"), c.title);
  setText(section.querySelector(".zhaowu-customer-head .zhaowu-section-lead"), c.lead);
  setText(document.querySelector("#bazi .zhaowu-section-lead"), c.baziLead);
  setText(document.querySelector("#bazi .zhaowu-bazi-pending"), c.pending);

  const summary = section.querySelector(".zhaowu-birth-summary");
  if (summary) {
    setText(summary.querySelector("span"), c.saved);
    setText(summary.querySelector("p"), c.savedLead);
  }

  const submitLead = document.querySelector(".zhaowu-analysis-submit-wrap > p");
  setText(submitLead, summary ? c.useRecord : c.baziLead);
}

const observer = new MutationObserver(() => applyCustomerFacingCopy());
observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
observer.observe(document.body, { childList: true, subtree: true });
queueMicrotask(applyCustomerFacingCopy);
