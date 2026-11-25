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

const DIET_COLORS = [
  {
    key: "wood",
    glyph: "木",
    color: ["綠（青）", "绿（青）", "Green (azure)"],
    organ: ["肝", "肝", "Liver"],
    foods: [
      "菠菜、西蘭花、青瓜、青椒、羽衣甘藍、菜心、芥蘭、青豆、牛油果、奇異果、青蘋果",
      "菠菜、西兰花、黄瓜、青椒、羽衣甘蓝、菜心、芥兰、青豆、牛油果、猕猴桃、青苹果",
      "Spinach, broccoli, cucumber, green pepper, kale, choy sum, Chinese broccoli, green beans, avocado, kiwi, green apple",
    ],
    tip: [
      "任何一餐加一碟灼青菜或一份沙律，綠色幾乎不會缺。",
      "任何一餐加一碟焯青菜或一份沙拉，绿色几乎不会缺。",
      "Add a plate of blanched greens or a salad to any meal and green is almost never missing.",
    ],
  },
  {
    key: "fire",
    glyph: "火",
    color: ["紅（赤）", "红（赤）", "Red"],
    organ: ["心", "心", "Heart"],
    foods: [
      "番茄、紅椒、士多啤梨、西瓜、紅蘋果、紅蘿蔔（偏橙紅）、車厘子、紅棗、紅菜頭、石榴",
      "番茄、红椒、草莓、西瓜、红苹果、胡萝卜（偏橙红）、樱桃、红枣、红甜菜、石榴",
      "Tomato, red pepper, strawberry, watermelon, red apple, carrot (orange-red), cherry, red dates, beetroot, pomegranate",
    ],
    tip: [
      "意粉醬、番茄炒蛋、紅椒炒肉，一道菜就補到紅色。",
      "意面酱、番茄炒蛋、红椒炒肉，一道菜就补到红色。",
      "A pasta sauce, tomato and egg, or stir-fried red pepper with meat covers red in a single dish.",
    ],
  },
  {
    key: "earth",
    glyph: "土",
    color: ["黃橙（黃）", "黄橙（黄）", "Yellow / orange"],
    organ: ["脾胃", "脾胃", "Spleen and stomach"],
    foods: [
      "南瓜、粟米、黃椒、香蕉、橙、芒果、菠蘿、檸檬、甘筍、番薯、木瓜、雞蛋黃",
      "南瓜、玉米、黄椒、香蕉、橙子、芒果、菠萝、柠檬、胡萝卜、红薯、木瓜、蛋黄",
      "Pumpkin, corn, yellow pepper, banana, orange, mango, pineapple, lemon, carrot, sweet potato, papaya, egg yolk",
    ],
    tip: [
      "早餐加香蕉或橙，晚餐用南瓜湯或粟米當配菜，最省事。",
      "早餐加香蕉或橙子，晚餐用南瓜汤或玉米当配菜，最省事。",
      "A banana or orange at breakfast, pumpkin soup or corn as a side at dinner — the easiest way.",
    ],
  },
  {
    key: "metal",
    glyph: "金",
    color: ["白", "白", "White"],
    organ: ["肺", "肺", "Lung"],
    foods: [
      "白蘿蔔、椰菜花、菇類（白菇、杏鮑菇）、洋蔥、蒜頭、豆腐、淮山、蓮藕、梨、白桃",
      "白萝卜、花椰菜、菌菇（白蘑菇、杏鲍菇）、洋葱、蒜、豆腐、山药、莲藕、梨、白桃",
      "White radish, cauliflower, mushrooms (white button, king oyster), onion, garlic, tofu, Chinese yam, lotus root, pear, white peach",
    ],
    tip: [
      "菇類和豆腐很容易入菜 — 打邊爐、炒菜、煲湯都加一點。",
      "菌菇和豆腐很容易入菜——火锅、炒菜、煲汤都加一点。",
      "Mushrooms and tofu go into almost anything — hotpot, stir-fries and soups.",
    ],
  },
  {
    key: "water",
    glyph: "水",
    color: ["黑紫（黑）", "黑紫（黑）", "Black / purple"],
    organ: ["腎", "肾", "Kidney"],
    foods: [
      "黑豆、黑芝麻、紫茄子、紫椰菜、藍莓、提子、紫薯、黑木耳、海帶、紫米、無花果",
      "黑豆、黑芝麻、紫茄子、紫甘蓝、蓝莓、葡萄、紫薯、黑木耳、海带、紫米、无花果",
      "Black beans, black sesame, eggplant, red cabbage, blueberry, grapes, purple sweet potato, black wood ear, kelp, black rice, fig",
    ],
    tip: [
      "這色最常漏。早餐灑黑芝麻、甜品選藍莓、晚餐來碟蒜蓉茄子。",
      "这色最常漏。早餐撒黑芝麻、甜品选蓝莓、晚餐来碟蒜蓉茄子。",
      "The easiest colour to miss. Sprinkle black sesame at breakfast, pick blueberries for dessert, add garlic eggplant at dinner.",
    ],
  },
] as const;

const FIVE_TASTES = [
  {
    key: "wood",
    glyph: "木",
    taste: ["酸", "酸", "Sour"],
    organ: ["肝", "肝", "Liver"],
    examples: ["檸檬、醋、山楂", "柠檬、醋、山楂", "Lemon, vinegar, hawthorn"],
  },
  {
    key: "fire",
    glyph: "火",
    taste: ["苦", "苦", "Bitter"],
    organ: ["心", "心", "Heart"],
    examples: ["苦瓜", "苦瓜", "Bitter melon"],
  },
  {
    key: "earth",
    glyph: "土",
    taste: ["甘（甜）", "甘（甜）", "Sweet"],
    organ: ["脾", "脾", "Spleen"],
    examples: ["南瓜、番薯", "南瓜、红薯", "Pumpkin, sweet potato"],
  },
  {
    key: "metal",
    glyph: "金",
    taste: ["辛", "辛", "Pungent"],
    organ: ["肺", "肺", "Lung"],
    examples: ["薑、蒜", "姜、蒜", "Ginger, garlic"],
  },
  {
    key: "water",
    glyph: "水",
    taste: ["鹹", "咸", "Salty"],
    organ: ["腎", "肾", "Kidney"],
    examples: ["海帶、黑豆", "海带、黑豆", "Kelp, black beans"],
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
        <a href="/#birth-form" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-cinnabar/25 bg-paper px-4 py-2 text-sm text-cinnabar">
          {tr(locale, "查看命盤", "查看命盘", "Open chart")} →
        </a>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {tr(locale, "五色飲食與五味：把對應吃進日常", "五色饮食与五味：把对应吃进日常", "Five colours and five tastes: eating the correspondences")}
        </h2>
        <p className="mt-3 text-[15px] leading-8 text-ink-soft">
          {tr(locale,
            "下面這份五色飲食對照，把檢查表的方法放進五行對應裡：先看一週裡哪一色最常漏，再對照自己命盤裡真正需要支援的那一行去補。一週 2–3 餐有意識地吃到那一色就夠，不用每一餐齊五色。先說清楚：缺字不等於有病，八字裡某一行字數少，不能單獨當成不足的證據；要不要補、補哪一行，由完整命局（月令、調候、格局、病藥）判斷，這張表不能代替喜用神的判斷。",
            "下面这份五色饮食对照，把检查表的方法放进五行对应里：先看一周里哪一色最常漏，再对照自己命盘里真正需要支援的那一行去补。一周 2–3 餐有意识地吃到那一色就够，不用每一餐齐五色。先说清楚：缺字不等于有病，八字里某一行字数少，不能单独当成不足的证据；要不要补、补哪一行，由完整命局（月令、调候、格局、病药）判断，这张表不能代替喜用神的判断。",
            "The five-colour food guide below brings the checklist method into the correspondence table: first see which colour you miss most often in a week, then match it to the element your chart genuinely needs supported. Two to three deliberate meals a week covering that colour is enough; not every meal needs all five colours. One caution first: a low element count is not a diagnosis. Whether an element needs support, and which one, is judged from the whole chart — month command, climate, structure and remedy — and this table does not replace a useful-element judgement."
          )}
        </p>

        <h3 className="mt-6 font-display text-xl text-ink">
          {tr(locale, "五色對照與食物", "五色对照与食物", "Five colours, foods to reach for")}
        </h3>
        <div className="mt-3">
          {DIET_COLORS.map((item) => (
            <div key={item.key} className="border-t border-line py-3 first:border-t-0 first:pt-0">
              <p className="text-sm leading-6 text-ink">
                <strong className="font-display text-base">{item.glyph} · {tr(locale, item.color[0], item.color[1], item.color[2])}</strong>
                {" — "}{tr(locale, item.organ[0], item.organ[1], item.organ[2])}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">
                {tr(locale, "食物", "食物", "Foods")}：{tr(locale, item.foods[0], item.foods[1], item.foods[2])}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">
                {tr(locale, "上場提示", "上场提示", "Serving idea")}：{tr(locale, item.tip[0], item.tip[1], item.tip[2])}
              </p>
            </div>
          ))}
        </div>

        <h3 className="mt-6 font-display text-xl text-ink">
          {tr(locale, "三步用法", "三步用法", "How to use it, in three steps")}
        </h3>
        <div className="mt-3 space-y-3 text-[15px] leading-8 text-ink-soft">
          <p>{tr(locale,
            "吃到就勾 — 每色每天約一拳頭或一小碗，吃到該顏色的蔬果、豆類或菇類，就在當天那格打勾。怎樣算吃到？新鮮、冷凍或煮熟的都可以；果汁、果醬和炸物不計。",
            "吃到就勾——每色每天约一拳头或一小碗，吃到该颜色的蔬果、豆类或菌菇，就在当天那格打勾。怎样算吃到？新鲜、冷冻或煮熟的都可以；果汁、果酱和炸物不计。",
            "Tick it when you eat it — about a fistful or a small bowl of that colour a day, from vegetables, fruit, beans or mushrooms, and the day's box is ticked. Fresh, frozen or cooked all count; juice, jam and fried food do not."
          )}</p>
          <p>{tr(locale,
            "缺色就補 — 晚餐前看一眼今天還缺哪一色，湯、沙律、水果或配菜補一份就好。第一週先做到每天 3 色，習慣後再挑戰每天 5 色、全週 30 格以上。",
            "缺色就补——晚餐前看一眼今天还缺哪一色，汤、沙拉、水果或配菜补一份就好。第一周先做到每天 3 色，习惯后再挑战每天 5 色、全周 30 格以上。",
            "Fill the gap — check before dinner which colour is still missing today and add one soup, salad, fruit or side. Aim for three colours a day in the first week, then work toward five a day and 30 boxes or more across the week."
          )}</p>
          <p>{tr(locale,
            "週日回顧 — 數一數全週勾數（滿分 35 格），圈出最常漏的一色，下週買菜先買那一色。買菜時每色先買 2 種，少量多款，比大量單一更易吃完；冷凍蔬菜和冷凍莓果一樣計，忙的日子靠它們救場。漏勾不是失敗 — 表格是幫你看見缺口，不是考試。",
            "周日回顾——数一数全周勾数（满分 35 格），圈出最常漏的一色，下周买菜先买那一色。买菜时每色先买 2 种，少量多款，比大量单一更易吃完；冷冻蔬菜和冷冻莓果一样计，忙的日子靠它们救场。漏勾不是失败——表格是帮你看见缺口，不是考试。",
            "Sunday review — count the week's ticks (35 boxes in total), circle the colour you missed most, and buy that colour first next week. Buy two kinds per colour in small amounts rather than a lot of one thing; frozen vegetables and frozen berries count the same and save busy days. A missed tick is not a failure — the table is there to show the gap, not to grade you."
          )}</p>
          <p>{tr(locale,
            "配搭原則：一餐不用齊五色，一天齊就好。深色和淺色輪流吃，同一色裡也換不同食物，例如綠色不要每天只吃青瓜。外食時選有配菜的定食、湯粉加青菜、沙律加豆類，比單點一碟肉更容易齊色。",
            "配搭原则：一餐不用齐五色，一天齐就好。深色和浅色轮流吃，同一色里也换不同食物，例如绿色不要每天只吃黄瓜。外食时选有配菜的定食、汤粉加青菜、沙拉加豆类，比单点一碟肉更容易齐色。",
            "Pairing notes: one meal does not need all five colours — one day does. Alternate dark and light, and vary within a colour instead of eating cucumber for green every day. When eating out, a set meal with sides, noodle soup with greens, or a salad with beans covers colours more easily than a single plate of meat."
          )}</p>
        </div>

        <h3 className="mt-6 font-display text-xl text-ink">
          {tr(locale, "五味對照", "五味对照", "Five tastes")}
        </h3>
        <p className="mt-3 text-[15px] leading-8 text-ink-soft">
          {tr(locale,
            "五味是同一張對應表的另一面。傳統上認為，酸入木、苦入火、甘入土、辛入金、鹹入水；八字裡偏弱的那一行，可以用對應的味道微調飲食來輔助，命局均衡的，不用刻意去補。這是傳統說法，僅供參考，不是醫療建議；調整飲食之前，先諮詢專業人員。",
            "五味是同一张对应表的另一面。传统上认为，酸入木、苦入火、甘入土、辛入金、咸入水；八字里偏弱的那一行，可以用对应的味道微调饮食来辅助，命局均衡的，不用刻意去补。这是传统说法，仅供参考，不是医疗建议；调整饮食之前，先咨询专业人员。",
            "The five tastes are the other side of the same table. Traditionally, sour enters Wood, bitter enters Fire, sweet enters Earth, pungent enters Metal and salty enters Water. An element that is weak in a chart can be supported with small dietary adjustments in the matching taste; a balanced chart needs no deliberate supplementation. This is traditional teaching, for reference only, not medical advice; consult a professional before changing your diet."
          )}
        </p>
        <div className="mt-3">
          {FIVE_TASTES.map((item) => (
            <div key={item.key} className="border-t border-line py-3 first:border-t-0 first:pt-0">
              <p className="text-sm leading-6 text-ink">
                <strong className="font-display text-base">{item.glyph} · {tr(locale, item.taste[0], item.taste[1], item.taste[2])}</strong>
                {" — "}{tr(locale, item.organ[0], item.organ[1], item.organ[2])}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">
                {tr(locale, "例子", "例子", "Examples")}：{tr(locale, item.examples[0], item.examples[1], item.examples[2])}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm leading-7 text-ink-soft">
          {tr(locale,
            "註：本節是日常飲食整理工具，份量為實用估算，不是醫療或營養治療建議。如有長期病患、懷孕、食物過敏或正在服藥，請先諮詢醫生或註冊營養師，再按個人情況調整。五色方法整理自昭梧每週五色飲食檢查表（方法來源：Threads @danica1ii）；五味對應整理自裴晴（@peichin.oracle）Threads 貼文，按傳統說法轉述，未作權威背書。",
            "注：本节是日常饮食整理工具，份量为实用估算，不是医疗或营养治疗建议。如有长期病患、怀孕、食物过敏或正在服药，请先咨询医生或注册营养师，再按个人情况调整。五色方法整理自昭梧每周五色饮食检查表（方法来源：Threads @danica1ii）；五味对应整理自裴晴（@peichin.oracle）Threads 贴文，按传统说法转述，未作权威背书。",
            "Note: this section is a daily diet organiser; portions are practical estimates, not medical or nutritional therapy advice. If you have a long-term condition, are pregnant, have food allergies or take medication, consult a doctor or registered dietitian before adjusting your diet. The five-colour method is adapted from Zhaowu's weekly five-colour diet checklist (method source: Threads @danica1ii); the five-taste correspondences are adapted from a Threads post by Pei Qing (@peichin.oracle), retold as traditional teaching without endorsement as an authoritative source."
          )}
        </p>
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
        <a href="/#birth-form" className="inline-flex min-h-11 items-center rounded-full bg-pine px-4 py-2 text-sm text-white">
          {tr(locale, "開始分析", "开始分析", "Start an analysis")}
        </a>
      </footer>
    </main>
  );
}
