import { dayGanzhi } from "@/lib/bazi/calendar";
import { stemElement, type WuXing } from "@/lib/element-colors";
import type { Locale } from "@/lib/i18n";

export type DailyColorId =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "aqua"
  | "purple"
  | "pink"
  | "brown"
  | "black"
  | "white"
  | "grey"
  | "gold"
  | "silver";

export type DailyColorCopy = {
  name: string;
  colorsLabel: string;
  keywords: string;
  wantLabel: string;
  core: string;
  suitable: readonly string[];
  less: string;
  reminder: string;
};

export type DailyColorState = {
  id: DailyColorId;
  ink: string;
  swatches: readonly string[];
  element?: WuXing;
  copy: Record<Locale, DailyColorCopy>;
};

const copy = (
  hant: DailyColorCopy,
  hans: DailyColorCopy,
  en: DailyColorCopy,
): Record<Locale, DailyColorCopy> => ({ "zh-Hant": hant, "zh-Hans": hans, en });

export const DAILY_COLOR_STATES: readonly DailyColorState[] = [
  {
    id: "red",
    element: "火",
    ink: "#a93b32",
    swatches: ["#b8322c", "#cf4b3f", "#8f201d"],
    copy: copy(
      { name: "紅色", colorsLabel: "朱紅・深紅・暖紅", keywords: "行動・生命力・勇氣", wantLabel: "想往前", core: "紅色常被用來象徵行動、熱情、勇氣、意志與生命力。", suitable: ["需要鼓起勇氣", "想提高存在感", "工作需要快速決斷", "感覺疲倦、缺乏動力", "推動停滯已久的事", "守住立場與界線"], less: "如果已經急躁、憤怒、競爭心過強，或事情需要耐心溝通，就把紅色比例降一點；可配藍、綠或白。", reminder: "不要只是在心裡想。現在，往前一步。" },
      { name: "红色", colorsLabel: "朱红・深红・暖红", keywords: "行动・生命力・勇气", wantLabel: "想往前", core: "红色常被用来象征行动、热情、勇气、意志与生命力。", suitable: ["需要鼓起勇气", "想提高存在感", "工作需要快速决断", "感觉疲倦、缺乏动力", "推动停滞已久的事", "守住立场与界线"], less: "如果已经急躁、愤怒、竞争心过强，或事情需要耐心沟通，就把红色比例降一点；可配蓝、绿或白。", reminder: "不要只是在心里想。现在，往前一步。" },
      { name: "Red", colorsLabel: "Vermilion · deep red · warm red", keywords: "Action · vitality · courage", wantLabel: "Need momentum", core: "Red is often used as a symbol of action, vitality, courage, will and visible presence.", suitable: ["Build courage", "Be more visible", "Make a timely decision", "Move through low energy", "Restart something stalled", "Hold a clear boundary"], less: "Use less when you are already irritable, angry or overly competitive, or when the situation needs patience. Blue, green or white can soften the cue.", reminder: "Do not leave it only in your head. Take one step forward." },
    ),
  },
  {
    id: "orange",
    ink: "#b9652f",
    swatches: ["#d06a2d", "#e58b45", "#bf5c27"],
    copy: copy(
      { name: "橘色", colorsLabel: "橘・柑橘・暖杏", keywords: "創造力・機會・社交", wantLabel: "想打開局面", core: "橘色結合行動感與明亮感，常被用來象徵創造力、樂趣、新機會與社交能量。", suitable: ["開始新工作或新計畫", "需要創意和點子", "參加聚會或認識新朋友", "突破沉悶與停滯", "嘗試新事物", "增加親和力與活力"], less: "如果已經過度興奮、注意力分散，或同時開了太多事情，就少一點橘色；可換深藍、棕或深綠幫助收斂。", reminder: "不用等到完美，先允許自己開始。" },
      { name: "橙色", colorsLabel: "橙・柑橘・暖杏", keywords: "创造力・机会・社交", wantLabel: "想打开局面", core: "橙色结合行动感与明亮感，常被用来象征创造力、乐趣、新机会与社交能量。", suitable: ["开始新工作或新计划", "需要创意和点子", "参加聚会或认识新朋友", "突破沉闷与停滞", "尝试新事物", "增加亲和力与活力"], less: "如果已经过度兴奋、注意力分散，或同时开了太多事情，就少一点橙色；可换深蓝、棕或深绿帮助收敛。", reminder: "不用等到完美，先允许自己开始。" },
      { name: "Orange", colorsLabel: "Orange · citrus · warm apricot", keywords: "Creativity · opportunity · social energy", wantLabel: "Open things up", core: "Orange is often used to represent creativity, play, new opportunities and social energy.", suitable: ["Start a new project", "Generate ideas", "Meet new people", "Break a dull routine", "Try something unfamiliar", "Bring more warmth into a room"], less: "Use less when you are already overstimulated, scattered or starting too many things. Deep blue, brown or dark green can add structure.", reminder: "You do not need perfect conditions. Let yourself begin." },
    ),
  },
  {
    id: "yellow",
    ink: "#aa842c",
    swatches: ["#e4bd45", "#f0d879", "#c99c2c"],
    copy: copy(
      { name: "黃色", colorsLabel: "明黃・麥黃・淡金黃", keywords: "思考・表達・清晰", wantLabel: "想看清楚", core: "黃色常與陽光、意識、學習、專注、溝通與樂觀相連。", suitable: ["考試、讀書或準備簡報", "寫作、教學或公開表達", "整理複雜資訊", "讓心情明亮一點", "提升自信與可見度", "釐清困惑已久的問題"], less: "如果思緒已經很多、反覆分析、睡眠不足或精神過度活躍，就少一點黃色；藍、棕或深綠更適合把注意力拉回來。", reminder: "你不需要知道所有答案，只需要先看清下一步。" },
      { name: "黄色", colorsLabel: "明黄・麦黄・淡金黄", keywords: "思考・表达・清晰", wantLabel: "想看清楚", core: "黄色常与阳光、意识、学习、专注、沟通与乐观相连。", suitable: ["考试、读书或准备简报", "写作、教学或公开表达", "整理复杂信息", "让心情明亮一点", "提升自信与可见度", "厘清困惑已久的问题"], less: "如果思绪已经很多、反复分析、睡眠不足或精神过度活跃，就少一点黄色；蓝、棕或深绿更适合把注意力拉回来。", reminder: "你不需要知道所有答案，只需要先看清下一步。" },
      { name: "Yellow", colorsLabel: "Bright yellow · wheat · pale gold", keywords: "Thinking · expression · clarity", wantLabel: "Need clarity", core: "Yellow is often linked with awareness, learning, focus, communication and an optimistic tone.", suitable: ["Study or prepare a presentation", "Write, teach or speak publicly", "Organise complex information", "Lift the tone of the day", "Be more visible", "Clarify a persistent question"], less: "Use less when your mind is already racing, you are over-analysing or sleep-deprived. Blue, brown or deep green can feel more settling.", reminder: "You do not need every answer. See the next step clearly." },
    ),
  },
  {
    id: "green",
    element: "木",
    ink: "#356c50",
    swatches: ["#2f704e", "#579267", "#9dbb8d"],
    copy: copy(
      { name: "綠色", colorsLabel: "松綠・草綠・玉綠", keywords: "成長・修復・豐盛", wantLabel: "想穩定成長", core: "綠色與自然、成長、更新、平衡和資源累積的意象相連。", suitable: ["處理金錢、收入與工作機會", "開始長期計畫", "身心需要休息與修復", "恢復生活穩定感", "讓關係健康成長", "耐心照顧正在萌芽的事"], less: "如果「等待時機」已經變成拖延，或一直舒服卻沒有進展，就不要只停在綠色；加一點紅或橘提醒自己採取行動。", reminder: "真正的成長不一定很快，但它需要持續。" },
      { name: "绿色", colorsLabel: "松绿・草绿・玉绿", keywords: "成长・修复・丰盛", wantLabel: "想稳定成长", core: "绿色与自然、成长、更新、平衡和资源积累的意象相连。", suitable: ["处理金钱、收入与工作机会", "开始长期计划", "身心需要休息与修复", "恢复生活稳定感", "让关系健康成长", "耐心照顾正在萌芽的事"], less: "如果“等待时机”已经变成拖延，或一直舒服却没有进展，就不要只停在绿色；加一点红或橙提醒自己采取行动。", reminder: "真正的成长不一定很快，但它需要持续。" },
      { name: "Green", colorsLabel: "Pine green · leaf green · jade green", keywords: "Growth · repair · abundance", wantLabel: "Grow steadily", core: "Green is associated with nature, renewal, balance, resources and gradual growth.", suitable: ["Review money or work opportunities", "Begin a long-term plan", "Rest and recover", "Restore everyday stability", "Support a relationship's healthy growth", "Care for something still developing"], less: "Use less when 'waiting for the right time' has turned into delay. Add red or orange when cultivation also needs action.", reminder: "Real growth does not have to be fast, but it does need continuity." },
    ),
  },
  {
    id: "blue",
    element: "水",
    ink: "#315f82",
    swatches: ["#315f82", "#4f7fa2", "#91adc2"],
    copy: copy(
      { name: "藍色", colorsLabel: "深藍・霧藍・靛藍", keywords: "平靜・溝通・真實", wantLabel: "想冷靜表達", core: "藍色常與平靜、智慧、專注、清楚溝通與真實相連。", suitable: ["需要冷靜溝通", "處理衝突或誤會", "參加正式會議", "讓情緒穩定下來", "專注完成工作", "真實表達但不想過度激烈"], less: "如果已經很退縮、情緒低落、不敢表達，或一直壓低存在感，就少一點藍色；紅、橘或黃能補上可見度與行動。", reminder: "真正的平靜，不是沉默，而是清楚地說出真實。" },
      { name: "蓝色", colorsLabel: "深蓝・雾蓝・靛蓝", keywords: "平静・沟通・真实", wantLabel: "想冷静表达", core: "蓝色常与平静、智慧、专注、清楚沟通与真实相连。", suitable: ["需要冷静沟通", "处理冲突或误会", "参加正式会议", "让情绪稳定下来", "专注完成工作", "真实表达但不想过度激烈"], less: "如果已经很退缩、情绪低落、不敢表达，或一直压低存在感，就少一点蓝色；红、橙或黄能补上可见度与行动。", reminder: "真正的平静，不是沉默，而是清楚地说出真实。" },
      { name: "Blue", colorsLabel: "Deep blue · mist blue · indigo", keywords: "Calm · communication · truth", wantLabel: "Speak calmly", core: "Blue is often associated with calm, wisdom, focus, clear communication and truth.", suitable: ["Have a calm conversation", "Work through conflict", "Attend a formal meeting", "Settle emotional noise", "Focus on a task", "Say what is true without escalating"], less: "Use less when you are already withdrawn, low or hiding your needs. Red, orange or yellow can add visibility and movement.", reminder: "Real calm is not silence. It is saying what is true with clarity." },
    ),
  },
  {
    id: "aqua",
    ink: "#3d8585",
    swatches: ["#4c9995", "#73b5ad", "#a7d2ca"],
    copy: copy(
      { name: "水藍／藍綠", colorsLabel: "水藍・湖綠・青碧", keywords: "流動・釋放・柔和表達", wantLabel: "想鬆開卡點", core: "水藍與藍綠介於平靜和修復之間，適合作為流動、釋放與柔和表達的象徵。", suitable: ["情緒卡住需要慢慢釋放", "溫和但誠實的對話", "需要休息與喘息空間", "正處於人生轉換期", "讓創意自然流動", "練習不要過度控制結果"], less: "如果已經缺乏方向、做事容易飄走，或需要快速做出明確決定，就少一點水藍；深藍、棕或紅能增加結構。", reminder: "不是所有事情都需要用力，有些改變需要允許。" },
      { name: "水蓝／蓝绿色", colorsLabel: "水蓝・湖绿・青碧", keywords: "流动・释放・柔和表达", wantLabel: "想松开卡点", core: "水蓝与蓝绿色介于平静和修复之间，适合作为流动、释放与柔和表达的象征。", suitable: ["情绪卡住需要慢慢释放", "温和但诚实的对话", "需要休息与喘息空间", "正处于人生转换期", "让创意自然流动", "练习不要过度控制结果"], less: "如果已经缺乏方向、做事容易飘走，或需要快速做出明确决定，就少一点水蓝；深蓝、棕或红能增加结构。", reminder: "不是所有事情都需要用力，有些改变需要允许。" },
      { name: "Aqua / Teal", colorsLabel: "Aqua · teal · blue-green", keywords: "Flow · release · gentle expression", wantLabel: "Release pressure", core: "Aqua and teal sit between calm and renewal, making them useful symbols for flow, release and gentler expression.", suitable: ["Ease a stuck feeling", "Have a gentle but honest conversation", "Create breathing room", "Move through a transition", "Let ideas flow", "Loosen excessive control"], less: "Use less when you already feel directionless or need a crisp decision. Deep blue, brown or red can add structure.", reminder: "Not every change needs force. Some changes need permission." },
    ),
  },
  {
    id: "purple",
    ink: "#725286",
    swatches: ["#6f4b80", "#8c6aa0", "#b39ac0"],
    copy: copy(
      { name: "紫色", colorsLabel: "深紫・葡萄紫・煙紫", keywords: "直覺・智慧・精神世界", wantLabel: "想向內聽", core: "紫色常被用來象徵神祕、直覺、智慧、夢境、精神性與內在轉化。", suitable: ["占卜、冥想或儀式", "需要靈感與創意", "傾聽直覺", "探索夢境與潛意識", "進行內在整理", "面對身份或生命階段轉化"], less: "如果今天主要是帳單、開會、行政、整理房間或大量現實瑣事，就少一點紫色；棕、深綠或黑更適合接地。", reminder: "直覺可以指引方向，但最後仍需要由你採取行動。" },
      { name: "紫色", colorsLabel: "深紫・葡萄紫・烟紫", keywords: "直觉・智慧・精神世界", wantLabel: "想向内听", core: "紫色常被用来象征神秘、直觉、智慧、梦境、精神性与内在转化。", suitable: ["占卜、冥想或仪式", "需要灵感与创意", "倾听直觉", "探索梦境与潜意识", "进行内在整理", "面对身份或生命阶段转化"], less: "如果今天主要是账单、开会、行政、整理房间或大量现实琐事，就少一点紫色；棕、深绿或黑更适合接地。", reminder: "直觉可以指引方向，但最后仍需要由你采取行动。" },
      { name: "Purple", colorsLabel: "Deep purple · grape · smoky violet", keywords: "Intuition · wisdom · inner world", wantLabel: "Listen inward", core: "Purple is often used to symbolise intuition, mystery, wisdom, dreams and inner transformation.", suitable: ["Meditate or do a ritual", "Find creative inspiration", "Listen inward", "Explore dreams", "Do inner reflection", "Mark a personal transition"], less: "Use less when the day is mostly bills, meetings, admin or practical chores. Brown, deep green or black can feel more grounding.", reminder: "Intuition can point to a direction; you still have to act." },
    ),
  },
  {
    id: "pink",
    ink: "#a86678",
    swatches: ["#ce8097", "#e4a5b5", "#f0c7cf"],
    copy: copy(
      { name: "粉紅色", colorsLabel: "乾燥玫瑰・霧粉・淡粉", keywords: "愛・溫柔・情緒修復", wantLabel: "想柔和一點", core: "粉紅色不只代表浪漫，也常用來象徵友情、自我照顧、同理心、希望與情緒修復。", suitable: ["練習對自己溫柔", "修復受傷情緒", "進行柔和溝通", "增加親近感", "接納自己的脆弱", "找回玩心與希望"], less: "如果正在討好別人、逃避衝突，或因害怕被討厭而不敢設定界線，就不要只靠粉紅；黑、深藍或紅能提醒界線。", reminder: "你可以溫柔，也可以堅定。" },
      { name: "粉红色", colorsLabel: "干燥玫瑰・雾粉・淡粉", keywords: "爱・温柔・情绪修复", wantLabel: "想柔和一点", core: "粉红色不只代表浪漫，也常用来象征友情、自我照顾、同理心、希望与情绪修复。", suitable: ["练习对自己温柔", "修复受伤情绪", "进行柔和沟通", "增加亲近感", "接纳自己的脆弱", "找回玩心与希望"], less: "如果正在讨好别人、逃避冲突，或因害怕被讨厌而不敢设定界线，就不要只靠粉红；黑、深蓝或红能提醒界线。", reminder: "你可以温柔，也可以坚定。" },
      { name: "Pink", colorsLabel: "Dusty rose · mist pink · pale pink", keywords: "Care · gentleness · emotional repair", wantLabel: "Need softness", core: "Pink can symbolise care, friendship, empathy, hope and emotional repair as much as romance.", suitable: ["Treat yourself more gently", "Recover after an emotional hit", "Have a softer conversation", "Create closeness", "Accept vulnerability", "Bring back play and hope"], less: "Use less when gentleness has become people-pleasing or conflict avoidance. Black, deep blue or red can cue stronger boundaries.", reminder: "You can be gentle and firm at the same time." },
    ),
  },
  {
    id: "brown",
    element: "土",
    ink: "#75583f",
    swatches: ["#76563d", "#9a7655", "#b79a79"],
    copy: copy(
      { name: "棕色", colorsLabel: "深棕・茶棕・土棕", keywords: "接地・秩序・現實行動", wantLabel: "想落地完成", core: "棕色與土地、穩定、安全、支持、秩序與 Grounding／接地的意象相連。", suitable: ["處理帳單與財務", "整理家務或工作空間", "跑行政流程", "制訂可執行計畫", "感覺焦慮、空轉或不踏實", "回到規律生活"], less: "如果已被責任壓得喘不過氣，生活只剩義務與現實，就少一點棕色；橘、黃或紫能補回樂趣與想像。", reminder: "把能量放回今天真正能完成的事情。" },
      { name: "棕色", colorsLabel: "深棕・茶棕・土棕", keywords: "接地・秩序・现实行动", wantLabel: "想落地完成", core: "棕色与土地、稳定、安全、支持、秩序与 Grounding／接地的意象相连。", suitable: ["处理账单与财务", "整理家务或工作空间", "跑行政流程", "制订可执行计划", "感觉焦虑、空转或不踏实", "回到规律生活"], less: "如果已被责任压得喘不过气，生活只剩义务与现实，就少一点棕色；橙、黄或紫能补回乐趣与想象。", reminder: "把能量放回今天真正能完成的事情。" },
      { name: "Brown", colorsLabel: "Deep brown · tea brown · earth brown", keywords: "Grounding · order · practical action", wantLabel: "Get grounded", core: "Brown is associated with earth, stability, support, order and practical grounding.", suitable: ["Handle bills or finances", "Tidy a home or workspace", "Do admin", "Make an executable plan", "Interrupt anxious spinning", "Return to a steady routine"], less: "Use less when responsibility has become heavy and life feels like obligation only. Orange, yellow or purple can bring back play and imagination.", reminder: "Put your energy back into what can actually be completed today." },
    ),
  },
  {
    id: "black",
    ink: "#25292a",
    swatches: ["#17191a", "#303334", "#4a4d4e"],
    copy: copy(
      { name: "黑色", colorsLabel: "墨黑・炭黑・玄黑", keywords: "保護・界線・結束", wantLabel: "想收回界線", core: "黑色在色彩象徵裡不等於邪惡；它常被用來表達保護、隔離、界線、結束與收回注意力。", suitable: ["建立明確界線", "前往人多或刺激混亂的場合", "結束不再適合的習慣或關係", "專注且不想受干擾", "面對壓力或強勢人物", "收回分散在外的注意力"], less: "如果已經封閉、孤立、防備心過強，或覺得世界沒有希望，就少一點黑色；白、粉、黃或綠能留下連結空間。", reminder: "拒絕不適合的事物，也是一種保護自己的魔法。" },
      { name: "黑色", colorsLabel: "墨黑・炭黑・玄黑", keywords: "保护・界线・结束", wantLabel: "想收回界线", core: "黑色在色彩象征里不等于邪恶；它常被用来表达保护、隔离、界线、结束与收回注意力。", suitable: ["建立明确界线", "前往人多或刺激混乱的场合", "结束不再适合的习惯或关系", "专注且不想受干扰", "面对压力或强势人物", "收回分散在外的注意力"], less: "如果已经封闭、孤立、防备心过强，或觉得世界没有希望，就少一点黑色；白、粉、黄或绿能留下连接空间。", reminder: "拒绝不适合的事物，也是一种保护自己的魔法。" },
      { name: "Black", colorsLabel: "Ink black · charcoal · deep black", keywords: "Protection · boundaries · endings", wantLabel: "Set a boundary", core: "Black does not mean evil here; it is often used to represent protection, boundaries, endings and reclaiming attention.", suitable: ["Set a clear boundary", "Enter a crowded or overstimulating space", "End a habit or relationship that no longer fits", "Protect focus", "Deal with pressure or a forceful person", "Pull scattered attention back"], less: "Use less when you are already closed off, isolated or overly defensive. White, pink, yellow or green can leave more room for connection.", reminder: "Saying no to what does not fit can be a form of protection." },
    ),
  },
  {
    id: "white",
    ink: "#8b806d",
    swatches: ["#fffdf5", "#f4f1e7", "#e9e5d9"],
    copy: copy(
      { name: "白色", colorsLabel: "象牙白・月白・暖白", keywords: "淨化・清晰・重新開始", wantLabel: "想重新整理", core: "白色常被用來象徵淨化、祝福、清晰、簡化與重新開始。", suitable: ["開始新的階段", "整理混亂情緒", "清理過去的殘留感", "簡化生活", "不知道今天選什麼顏色", "為新的意圖保留空間"], less: "如果正在追求完美、害怕犯錯，或想把複雜情緒快速「清乾淨」，就少一點白色；大地色、粉紅或綠色更能提醒接納。", reminder: "清空不是否定過去，而是為新的可能保留位置。" },
      { name: "白色", colorsLabel: "象牙白・月白・暖白", keywords: "净化・清晰・重新开始", wantLabel: "想重新整理", core: "白色常被用来象征净化、祝福、清晰、简化与重新开始。", suitable: ["开始新的阶段", "整理混乱情绪", "清理过去的残留感", "简化生活", "不知道今天选什么颜色", "为新的意图保留空间"], less: "如果正在追求完美、害怕犯错，或想把复杂情绪快速“清干净”，就少一点白色；大地色、粉红或绿色更能提醒接纳。", reminder: "清空不是否定过去，而是为新的可能保留位置。" },
      { name: "White", colorsLabel: "Ivory · moon white · warm white", keywords: "Clearing · clarity · restart", wantLabel: "Reset gently", core: "White is often used to represent clearing, blessing, simplicity, clarity and a fresh start.", suitable: ["Begin a new phase", "Sort through emotional clutter", "Release residue from the past", "Simplify the day", "Choose a neutral starting colour", "Make room for a new intention"], less: "Use less when a wish for clarity has turned into perfectionism or fear of mistakes. Earth tones, pink or green can cue acceptance.", reminder: "Clearing space does not deny the past; it makes room for what comes next." },
    ),
  },
  {
    id: "grey",
    ink: "#656a6b",
    swatches: ["#777d7c", "#9ba09e", "#c6c7c3"],
    copy: copy(
      { name: "灰色", colorsLabel: "石灰・霧灰・銀灰", keywords: "中立・過渡・降噪", wantLabel: "想先觀察", core: "灰色適合象徵中立、過渡、暫停反應與降低刺激。", suitable: ["處理需要客觀判斷的事情", "不想被外界過度注意", "處於兩個階段之間", "觀察而不是立刻表態", "降低環境刺激", "從情緒中退一步"], less: "如果已經沒有方向、缺乏動力，或習慣隱藏自己的需求，就少一點灰色；黃、紅或綠能重新帶回方向與生命感。", reminder: "暫時不知道答案沒有關係，但不要永遠停留在等待裡。" },
      { name: "灰色", colorsLabel: "石灰・雾灰・银灰", keywords: "中立・过渡・降噪", wantLabel: "想先观察", core: "灰色适合象征中立、过渡、暂停反应与降低刺激。", suitable: ["处理需要客观判断的事情", "不想被外界过度注意", "处于两个阶段之间", "观察而不是立刻表态", "降低环境刺激", "从情绪中退一步"], less: "如果已经没有方向、缺乏动力，或习惯隐藏自己的需求，就少一点灰色；黄、红或绿能重新带回方向与生命感。", reminder: "暂时不知道答案没有关系，但不要永远停留在等待里。" },
      { name: "Grey", colorsLabel: "Stone grey · mist grey · silver grey", keywords: "Neutrality · transition · noise reduction", wantLabel: "Observe first", core: "Grey can represent neutrality, transition, pausing a reaction and reducing stimulation.", suitable: ["Make an objective judgement", "Keep a lower profile", "Move between two stages", "Observe before responding", "Reduce visual or social stimulation", "Step back from an emotion"], less: "Use less when you already lack direction, motivation or visibility. Yellow, red or green can bring back movement and definition.", reminder: "It is fine not to know yet. Just do not stay in waiting forever." },
    ),
  },
  {
    id: "gold",
    element: "金",
    ink: "#a78132",
    swatches: ["#c9a348", "#e1c77d", "#a88332"],
    copy: copy(
      { name: "金色", colorsLabel: "古金・暖金・淡金", keywords: "成就・自信・太陽能量", wantLabel: "想讓自己被看見", core: "金色常與成功、成就、自信、繁榮、價值感與太陽意象相連。", suitable: ["慶祝自己的成果", "爭取升遷或重要機會", "展現領導力", "提醒自己看見自身價值", "發表作品或公開亮相", "提升氣勢與可見度"], less: "如果已過度在意成就、比較、輸贏或外界認可，就少一點金色；綠、粉或棕能把價值感拉回生活本身。", reminder: "允許自己發光，不需要先得到所有人的同意。" },
      { name: "金色", colorsLabel: "古金・暖金・淡金", keywords: "成就・自信・太阳能量", wantLabel: "想让自己被看见", core: "金色常与成功、成就、自信、繁荣、价值感与太阳意象相连。", suitable: ["庆祝自己的成果", "争取升迁或重要机会", "展现领导力", "提醒自己看见自身价值", "发表作品或公开亮相", "提升气势与可见度"], less: "如果已过度在意成就、比较、输赢或外界认可，就少一点金色；绿、粉或棕能把价值感拉回生活本身。", reminder: "允许自己发光，不需要先得到所有人的同意。" },
      { name: "Gold", colorsLabel: "Antique gold · warm gold · pale gold", keywords: "Achievement · confidence · solar energy", wantLabel: "Be more visible", core: "Gold is often linked with achievement, confidence, prosperity, value and solar symbolism.", suitable: ["Celebrate a result", "Ask for a promotion or opportunity", "Lead visibly", "Remember your own value", "Publish or present work", "Bring more presence into the room"], less: "Use less when achievement, comparison or external approval has become the whole measure of worth. Green, pink or brown can rebalance the cue.", reminder: "Let yourself shine without waiting for everyone's permission." },
    ),
  },
  {
    id: "silver",
    ink: "#77818b",
    swatches: ["#a9afb3", "#c9cccd", "#818b93"],
    copy: copy(
      { name: "銀色", colorsLabel: "月銀・冷銀・霧銀", keywords: "月亮・夢境・內在感受", wantLabel: "想聽見感受", core: "銀色常與月亮、直覺、夢境、反思、接收與內在感受的象徵相連。", suitable: ["記錄夢境", "冥想或月亮儀式", "理解自己的情緒", "提升觀察力與感受力", "面對內在轉變", "安靜等待答案浮現"], less: "如果已經非常敏感、容易被環境影響，或反覆沉浸在情緒裡，就少一點銀色；棕、紅或深綠能幫助回到現實。", reminder: "感受是一封信，但你仍需要決定如何回應。" },
      { name: "银色", colorsLabel: "月银・冷银・雾银", keywords: "月亮・梦境・内在感受", wantLabel: "想听见感受", core: "银色常与月亮、直觉、梦境、反思、接收与内在感受的象征相连。", suitable: ["记录梦境", "冥想或月亮仪式", "理解自己的情绪", "提升观察力与感受力", "面对内在转变", "安静等待答案浮现"], less: "如果已经非常敏感、容易被环境影响，或反复沉浸在情绪里，就少一点银色；棕、红或深绿能帮助回到现实。", reminder: "感受是一封信，但你仍需要决定如何回应。" },
      { name: "Silver", colorsLabel: "Moon silver · cool silver · mist silver", keywords: "Moon · dreams · inner feeling", wantLabel: "Listen inward", core: "Silver is often linked with lunar symbolism, dreams, reflection, receptivity and inner feeling.", suitable: ["Record dreams", "Meditate or do a moon ritual", "Understand an emotion", "Observe more carefully", "Move through an inner transition", "Wait quietly for an answer to form"], less: "Use less when you are already highly sensitive, easily affected by the environment or stuck in rumination. Brown, red or deep green can bring you back to action.", reminder: "A feeling is a letter. You still decide how to reply." },
    ),
  },
];

const BY_ID: Record<DailyColorId, DailyColorState> = Object.fromEntries(
  DAILY_COLOR_STATES.map((state) => [state.id, state]),
) as Record<DailyColorId, DailyColorState>;

const ELEMENT_TO_ID: Record<WuXing, DailyColorId> = {
  木: "green",
  火: "red",
  土: "brown",
  金: "gold",
  水: "blue",
};

export function dailyColorById(id: DailyColorId): DailyColorState {
  return BY_ID[id];
}

export function dailyColorByElement(element: WuXing): DailyColorState {
  return BY_ID[ELEMENT_TO_ID[element]];
}

export type DailyColorAlmanacRef = {
  date: Date;
  ganzhi: string;
  dayStem: string;
  element: WuXing | null;
  recommendedId: DailyColorId;
};

export function dailyColorAlmanacRef(now = new Date()): DailyColorAlmanacRef {
  const ganzhi = dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const dayStem = ganzhi.slice(0, 1);
  const element = stemElement(dayStem);
  return {
    date: now,
    ganzhi,
    dayStem,
    element,
    recommendedId: element ? ELEMENT_TO_ID[element] : "brown",
  };
}

export function formatDailyColorDate(date: Date, locale: Locale): string {
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }
  const weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][date.getDay()];
  return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日 · " + weekday;
}

export const DAILY_COLOR_PAGE = {
  "zh-Hant": {
    title: "昭梧 · 今日色意",
    compactTitle: "今日色意",
    subtitle: "不是問哪個顏色最幸運，而是問：今天的我，需要被提醒成為什麼樣的人？",
    todaySuit: "黃曆輕參考",
    openFull: "查看完整十四色指南",
    back: "返回昭梧",
    pick: "先選你現在最需要的狀態",
    core: "核心象徵",
    suitable: "適合現在",
    less: "什麼時候少一點",
    reminder: "今日提醒",
    almanacNote: "上方只用今日日干五行提供一個輕量參考色；它不是喜用神，也不是幸運色。",
    userNote: "你的真實狀態與個人色彩記憶優先；你可以隨時改選，不必跟黃曆參考走。",
    boundary: "Color Magic 沒有唯一、絕對的對照表。不同文化與系統會有不同解讀；昭梧把顏色當成聚焦意圖與自我觀察的象徵工具，不宣稱顏色本身會帶來固定結果。",
  },
  "zh-Hans": {
    title: "昭梧 · 今日色意",
    compactTitle: "今日色意",
    subtitle: "不是问哪个颜色最幸运，而是问：今天的我，需要被提醒成为什么样的人？",
    todaySuit: "黄历轻参考",
    openFull: "查看完整十四色指南",
    back: "返回昭梧",
    pick: "先选你现在最需要的状态",
    core: "核心象征",
    suitable: "适合现在",
    less: "什么时候少一点",
    reminder: "今日提醒",
    almanacNote: "上方只用今日日干五行提供一个轻量参考色；它不是喜用神，也不是幸运色。",
    userNote: "你的真实状态与个人色彩记忆优先；你可以随时改选，不必跟黄历参考走。",
    boundary: "Color Magic 没有唯一、绝对的对照表。不同文化与系统会有不同解读；昭梧把颜色当成聚焦意图与自我观察的象征工具，不宣称颜色本身会带来固定结果。",
  },
  en: {
    title: "ZHAOWU · COLOUR INTENT",
    compactTitle: "Colour Intent",
    subtitle: "Do not ask which colour is luckiest. Ask: what quality do I need to remember today?",
    todaySuit: "Light almanac cue",
    openFull: "Open the full 14-colour guide",
    back: "Back to Zhaowu",
    pick: "Choose the state you need most right now",
    core: "Core symbol",
    suitable: "Useful now",
    less: "Use less when",
    reminder: "Today's reminder",
    almanacNote: "The daily cue only maps today's day-stem element to one reference colour. It is not a favourable-element judgement or a lucky colour.",
    userNote: "Your real state and personal associations come first. You can choose a different colour at any time.",
    boundary: "Colour Magic has no single universal correspondence chart. Meanings vary across cultures and systems. ZHAOWU uses colour as a symbolic tool for attention and intention, not as a claim that a colour produces a fixed outcome.",
  },
} as const;
