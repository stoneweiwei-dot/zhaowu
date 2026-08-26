const INTERNAL_SENTENCE =
  /全站回答契約|全站回答契约|本頁只使用|本页只使用|排序依據|排序依据|月份名稱只是|月份名称只是|命理月以節氣|命理月以节气|月份排序是已接入|月份排序是已接入|通用句|資料未接入|资料未接入|尚未完成|待覆核|待复核|不是完整子平|不是喜用神|方法透明|報告編號|报告编号|隱藏算法|隐藏算法|STONE Core|已排定的柱|流通粗候選|流通粗候选|調候粗候選|调候粗候选|不偽造午時|不伪造午时|如果你問「|如果你问「|給出 2–3 個具體城市|给出 2–3 个具体城市|再放入 2–3|再放入 2-3|若要精確比較目的地|若要精确比较目的地|沒有候選地時不亂點名|没有候选地时不乱点名/;
const ENGLISH_TECHNICAL_SENTENCE = /\b(?:bazi|four pillars?|day master|month command|month branch|heavenly stems?|earthly branches?|ten[- ]year cycle|luck pillar|useful god|favourable element|favorable element|seven killings?|direct resource|indirect resource|output star|wealth star|companion star|jia|yi|bing|ding|wu|ji|geng|xin|ren|gui|zi|chou|yin|mao|chen|si|wei|shen|you|xu|hai)\b/i;
const ASK_CITIES = /再放入\s*2|給出\s*2|给出\s*2|具體城市|具体城市|若要精確比較目的地|若要精确比较目的地/;

function customerHeading(value: string): string {
  return value
    .replace(/^Chart basis$/i, "What matters")
    .replace(/^Timing and rhythm$/i, "Timing")
    .replace(/^Practical action$/i, "What to do next")
    .replace(/^Relationship conditions$/i, "What to look for")
    .replace(/^Direct conclusion$/i, "Bottom line");
}

/** Remove engine notes, specialist terminology and acceptance language before copy reaches a customer. */
export function customerCopy(value: string): string {
  const text = customerHeading(String(value ?? "").trim())
    .replace(/[，,；;]\s*不再用通用性格句代替答案/g, "。")
    .replace(/[，,；;]\s*不把它包裝成必然事件或保證日期/g, "。")
    .replace(/[，,；;]\s*不把它包装成必然事件或保证日期/g, "。");

  const cleaned = (text.match(/[^。！？.!?\n]+[。！？.!?]?/g) ?? [text])
    .map((part) => part.trim())
    .filter((part) => part && !INTERNAL_SENTENCE.test(part) && !ENGLISH_TECHNICAL_SENTENCE.test(part))
    .join(/[A-Za-z]/.test(text) ? " " : "")
    .replace(/。{2,}/g, "。")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!cleaned && ASK_CITIES.test(text)) {
    return "先按第 1 页已经点名的目的地订主行程，不要再补城市。";
  }
  return cleaned;
}

export function customerDirectAnswer(question: string, answer: string): string {
  let text = String(answer ?? "").trim();
  const quotedQuestion = String(question ?? "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (quotedQuestion) {
    text = text.replace(
      new RegExp(`^你[問问](?:的是)?[「“\"]?${quotedQuestion}[」”\"]?[。．.]?\\s*`),
      "",
    );
  }
  text = text.replace(/^先(?:直接)?回答(?:時間|时间)?[：:]\s*/, "");
  return customerCopy(text) || "先从眼前最能确认的一件事开始，再结合现实条件决定下一步。";
}

export function customerParagraphs(value: string): string[] {
  const text = customerCopy(value);
  return (text.match(/[^。！？!?]+[。！？!?]?/g) ?? [text])
    .map((part) => part.trim())
    .filter(Boolean);
}

export function customerDocument(value: string): string {
  return String(value ?? "")
    .split("\n")
    .map((line) => customerCopy(line))
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
