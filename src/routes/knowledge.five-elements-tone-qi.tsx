import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/knowledge/five-elements-tone-qi")({
  component: FiveElementsToneQiArticle,
});

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

const ELEMENTS = [
  {
    key: "wood",
    glyph: "木",
    title: ["生長與疏通", "生长与疏通", "Growth and opening"],
    color: ["青／蒼", "青／苍", "Azure / green"],
    tone: ["角", "角", "Jue"],
    qi: ["風", "风", "Wind"],
    function: ["展開、規劃、推進", "展开、规划、推进", "Develop, plan and move forward"],
    practice: ["把卡住的事拆成一個可開始的小步驟。", "把卡住的事拆成一个可开始的小步骤。", "Break a stuck task into one small next step."],
    className: "border-wood/30 bg-wood/5",
  },
  {
    key: "fire",
    glyph: "火",
    title: ["啟動與表達", "启动与表达", "Initiation and expression"],
    color: ["赤／紅", "赤／红", "Red"],
    tone: ["徵", "徵", "Zhi"],
    qi: ["熱", "热", "Heat"],
    function: ["啟動、表達、回應", "启动、表达、回应", "Start, express and respond"],
    practice: ["為重要但一直延後的事，安排一段短而明確的開始時間。", "为重要但一直延后的事，安排一段短而明确的开始时间。", "Set a short, clear start time for something important that keeps being delayed."],
    className: "border-fire/30 bg-fire/5",
  },
  {
    key: "earth",
    glyph: "土",
    title: ["承載與整理", "承载与整理", "Capacity and organisation"],
    color: ["黃", "黄", "Yellow"],
    tone: ["宮", "宫", "Gong"],
    qi: ["濕", "湿", "Dampness"],
    function: ["整理、持續、承擔", "整理、持续、承担", "Organise, sustain and carry"],
    practice: ["固定一個簡單節奏，並刪掉一項超出承載力的承諾。", "固定一个简单节奏，并删掉一项超出承载力的承诺。", "Set one simple routine and remove one commitment beyond your capacity."],
    className: "border-earth/30 bg-earth/5",
  },
  {
    key: "metal",
    glyph: "金",
    title: ["取捨與界線", "取舍与边界", "Choice and boundaries"],
    color: ["白", "白", "White"],
    tone: ["商", "商", "Shang"],
    qi: ["燥", "燥", "Dryness"],
    function: ["界線、標準、收束", "边界、标准、收束", "Boundaries, standards and closure"],
    practice: ["替一件反覆消耗你的事寫下可執行的界線或停止條件。", "替一件反复消耗你的事写下可执行的边界或停止条件。", "Write one workable boundary or stopping condition for a recurring drain."],
    className: "border-metal/30 bg-metal/5",
  },
  {
    key: "water",
    glyph: "水",
    title: ["儲備與應變", "储备与应变", "Reserve and adaptation"],
    color: ["黑", "黑", "Black"],
    tone: ["羽", "羽", "Yu"],
    qi: ["寒", "寒", "Cold"],
    function: ["保留餘裕、觀察、調整", "保留余裕、观察、调整", "Keep reserves, observe and adapt"],
    practice: ["重要決定前先留出資訊、時間或金錢上的緩衝。", "重要决定前先留出信息、时间或金钱上的缓冲。", "Keep a time, information or money buffer before an important decision."],
    className: "border-water/30 bg-water/5",
  },
] as const;

function FiveElementsToneQiArticle() {
  const { locale } = useI18n();

  return (
    <main className="mx-auto max-w-3xl space-y-5 pb-16">
      <header className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <Link to="/knowledge" className="text-sm text-cinnabar">
          {tr(locale, "← 返回昭梧 · 知識庫", "← 返回昭梧 · 知识库", "← Back to Zhaowu Knowledge")}
        </Link>
        <p className="mt-5 text-xs tracking-[0.24em] text-cinnabar">
          {tr(locale, "昭梧 · 命理小知識", "昭梧 · 命理小知识", "ZHAOWU · BAZI KNOWLEDGE")}
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
          {tr(locale, "五行五色、五音與五氣：象義怎麼用，補益怎麼落地", "五行五色、五音与五气：象义怎么用，补益怎么落地", "Five Elements, Colours, Tones and Qi: Meaning and Practical Use")}
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-ink-soft">
          {tr(locale,
            "這些對應是傳統象義系統，用來理解不同的功能語言；它們不是物理測量值，也不會因穿某種顏色、聽某個音或擺放物件，就直接改變命局。",
            "这些对应是传统象义系统，用来理解不同的功能语言；它们不是物理测量值，也不会因穿某种颜色、听某个音或摆放物件，就直接改变命局。",
            "These are traditional symbolic correspondences for describing different functions. They are not physical measurements, and wearing a colour, hearing a tone or placing an object does not directly change a birth chart."
          )}
        </p>
      </header>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {tr(locale, "五行對應速讀", "五行对应速读", "Five correspondences")}
        </h2>
        <p className="mt-2 text-sm leading-7 text-ink-soft">
          {tr(locale,
            "五音依傳統宮、商、角、徵、羽名稱列出；五氣在此指風、熱、濕、燥、寒等氣候象義。不同典籍和語境中的「氣」不一定指同一件事。",
            "五音依传统宫、商、角、徵、羽名称列出；五气在此指风、热、湿、燥、寒等气候象义。不同典籍和语境中的“气”不一定指同一件事。",
            "The five tones use the traditional names Gong, Shang, Jue, Zhi and Yu. Here, the five qi means climate imagery—wind, heat, dampness, dryness and cold. The word qi can mean different things in different classical contexts."
          )}
        </p>
        <div className="mt-5 space-y-3">
          {ELEMENTS.map((item) => (
            <article key={item.key} className={`rounded-xl border p-4 ${item.className}`}>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper font-display text-2xl text-ink">
                  {item.glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl text-ink">
                    {item.glyph} · {tr(locale, item.title[0], item.title[1], item.title[2])}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">
                    {tr(locale, "色", "色", "Colour")}：{tr(locale, item.color[0], item.color[1], item.color[2])}
                    {" · "}{tr(locale, "音", "音", "Tone")}：{tr(locale, item.tone[0], item.tone[1], item.tone[2])}
                    {" · "}{tr(locale, "氣", "气", "Qi")}：{tr(locale, item.qi[0], item.qi[1], item.qi[2])}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    {tr(locale, "功能提示", "功能提示", "Function cue")}：{tr(locale, item.function[0], item.function[1], item.function[2])}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">
                    {tr(locale, "行動例子", "行动例子", "Example")}：{tr(locale, item.practice[0], item.practice[1], item.practice[2])}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {tr(locale, "「五氣」要分清語境", "“五气”要分清语境", "Read “five qi” in context")}
        </h2>
        <p className="mt-3 text-[15px] leading-8 text-ink-soft">
          {tr(locale,
            "《素問·陰陽應象大論》以風、熱、濕、燥、寒描述天候與五行象應；同篇也談五臟化氣而生情志。這裡列的是前一種氣候分類，不是對個人身體狀況的判定。古代臟腑對應是傳統醫學模型，不能拿來自行診斷或治療。",
            "《素问·阴阳应象大论》以风、热、湿、燥、寒描述天候与五行象应；同篇也谈五脏化气而生情志。这里列的是前一种气候分类，不是对个人身体状况的判定。古代脏腑对应是传统医学模型，不能拿来自行诊断或治疗。",
            "The Suwen chapter Yin-Yang Correspondences uses wind, heat, dampness, dryness and cold in its account of climate and Five-Phase correspondences. It also discusses emotions in a different passage about the organs. This page uses the climate sense, not a judgement about anyone's health. Historical organ mappings are a traditional medical model, not a basis for self-diagnosis or treatment."
          )}
        </p>
      </section>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {tr(locale, "真正的「補」：對準功能卡點，再練出改變", "真正的“补”：对准功能卡点，再练出改变", "What “support” means: train the blocked function")}
        </h2>
        <div className="mt-4 space-y-3 text-[15px] leading-8 text-ink-soft">
          <p>{tr(locale,
            "先由完整主鏈判斷某項功能是否真的不足、受阻或承載不住；五行字數少、沒有透干，不能單獨當成不足證據。未確認卡點時，不指定個人該補哪一行。",
            "先由完整主链判断某项功能是否真的不足、受阻或承载不住；五行字数少、没有透干，不能单独当成不足证据。未确认卡点时，不指定个人该补哪一行。",
            "First establish through the full analysis whether a function is actually weak, blocked or beyond capacity. A low element count or an absent visible stem is not enough. Without a confirmed bottleneck, this page does not prescribe an element for an individual."
          )}</p>
          <p>{tr(locale,
            "再把相關象義翻成一個可做的行動，並設定一至四週可觀察的指標。上方例子只是通用練習，不代表你的命盤結論；網站完整報告中的「五行功能訓練」才會依已判定的功能選出當前重點。",
            "再把相关象义翻成一个可做的行动，并设定一至四周可观察的指标。上方例子只是通用练习，不代表你的命盘结论；网站完整报告中的“五行功能训练”才会依已判定的功能选出当前重点。",
            "Translate the relevant function into one doable action and a marker you can observe over one to four weeks. The examples above are generic, not a reading of your chart. The report's Five-Element Functional Training block selects a current focus from the analysed functions."
          )}</p>
          <p>{tr(locale,
            "顏色、音樂、季節、材質與環境可以作為記憶提示或審美選擇；不把它們當成改命、治療、補用神或保證效果的方法。",
            "颜色、音乐、季节、材质与环境可以作为记忆提示或审美选择；不把它们当成改命、治疗、补用神或保证效果的方法。",
            "Colour, music, seasons, materials and surroundings can serve as reminders or aesthetic choices. They are not methods for changing fate, treating illness, supplying a useful element or guaranteeing an outcome."
          )}</p>
        </div>
        <a href="/#analysisForm" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-cinnabar/25 bg-paper px-4 py-2 text-sm text-cinnabar">
          {tr(locale, "查看命盤與功能訓練", "查看命盘与功能训练", "Open chart and functional training")} →
        </a>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {tr(locale, "來源與使用邊界", "来源与使用边界", "Sources and limits")}
        </h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">
          {tr(locale,
            "以下原典用來核對象義來源，不代表其中的醫理主張已由現代科學證實。",
            "以下原典用来核对象义来源，不代表其中的医理主张已由现代科学证实。",
            "These primary texts document the traditional correspondences; they do not establish their medical claims as scientifically proven."
          )}
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-6">
          <li><a className="break-words text-cinnabar underline" href="https://ctext.org/huangdi-neijing/yin-yang-ying-xiang-da-lun/zh" target="_blank" rel="noreferrer">{tr(locale, "《黃帝內經·素問·陰陽應象大論》", "《黄帝内经·素问·阴阳应象大论》", "Huangdi Neijing, Suwen, “Yin-Yang Correspondences”")}</a></li>
          <li><a className="break-words text-cinnabar underline" href="https://ctext.org/huangdi-neijing/shun-qi-yi-ri-fen-wei/zh" target="_blank" rel="noreferrer">{tr(locale, "《黃帝內經·靈樞·順氣一日分為四時》", "《黄帝内经·灵枢·顺气一日分为四时》", "Huangdi Neijing, Lingshu, “Qi Corresponding to the Four Seasons of a Day”")}</a></li>
          <li><a className="break-words text-cinnabar underline" href="https://ctext.org/han-shu/lv-li-zhi/zh" target="_blank" rel="noreferrer">{tr(locale, "《漢書·律曆志》", "《汉书·律历志》", "Book of Han, “Treatise on Pitch-Pipes and Calendar”")}</a></li>
        </ul>
      </section>

      <footer className="flex justify-between gap-3">
        <Link to="/knowledge" className="inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink">
          {tr(locale, "← 返回知識庫", "← 返回知识库", "← Back to Knowledge")}
        </Link>
        <a href="/#analysisForm" className="inline-flex min-h-11 items-center rounded-full bg-pine px-4 py-2 text-sm text-white">
          {tr(locale, "開始分析", "开始分析", "Start an analysis")}
        </a>
      </footer>
    </main>
  );
}
