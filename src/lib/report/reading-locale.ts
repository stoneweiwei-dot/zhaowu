import type { AppLocale, Reading } from "@/lib/bazi/types";

// Compatibility normalisation for older deterministic modules whose Chinese
// source text predates the public zh-Hant / zh-Hans locale split. New copy
// should still be authored per locale at its source.
const HANT_PHRASES: Array<[string, string]> = [
  ["命诰", "命誥"],
  ["信息", "資訊"],
  ["反复", "反覆"],
  ["质量", "品質"],
  ["复杂", "複雜"],
  ["重复", "重複"],
  ["恢复", "恢復"],
  ["复核", "覆核"],
  ["复盘", "復盤"],
  ["象征", "象徵"],
  ["关系", "關係"],
  ["位置里的", "位置裡的"],
  ["里的位置", "裡的位置"],
  ["后台", "後台"],
  ["里面", "裡面"],
  ["这里", "這裡"],
  ["那里", "那裡"],
  ["夜里", "夜裡"],
  ["心里", "心裡"],
];

const HANT_CHARS: Record<string, string> = {
  万: "萬", 与: "與", 专: "專", 业: "業", 东: "東", 两: "兩", 严: "嚴", 个: "個", 临: "臨", 为: "為",
  举: "舉", 义: "義", 习: "習", 书: "書", 买: "買", 乱: "亂", 争: "爭", 于: "於", 亏: "虧", 云: "雲",
  亚: "亞", 产: "產", 亲: "親", 仅: "僅", 从: "從", 仓: "倉", 仪: "儀", 们: "們", 优: "優", 会: "會",
  伪: "偽", 体: "體", 余: "餘", 价: "價", 众: "眾", 传: "傳", 伤: "傷", 伦: "倫", 侧: "側", 侣: "侶",
  侦: "偵", 侠: "俠", 俩: "倆", 俭: "儉", 债: "債", 倾: "傾", 偿: "償", 关: "關", 兴: "興", 养: "養",
  冲: "沖", 决: "決", 况: "況", 准: "準", 减: "減", 几: "幾", 击: "擊", 划: "劃", 则: "則", 刚: "剛",
  创: "創", 别: "別", 删: "刪", 剑: "劍", 动: "動", 务: "務", 势: "勢", 劳: "勞", 区: "區", 医: "醫",
  华: "華", 单: "單", 卖: "賣", 卫: "衛", 压: "壓", 县: "縣", 参: "參", 发: "發", 变: "變", 叠: "疊",
  叶: "葉", 号: "號", 后: "後", 吗: "嗎", 听: "聽", 启: "啟", 员: "員", 命: "命", 响: "響", 园: "園",
  围: "圍", 国: "國", 图: "圖", 圆: "圓", 场: "場", 坚: "堅", 坏: "壞", 块: "塊", 坛: "壇", 坟: "墳",
  垄: "壟", 垦: "墾", 执: "執", 报: "報", 墙: "牆", 声: "聲", 处: "處", 备: "備", 复: "復", 够: "夠", 写: "寫",
  头: "頭", 夹: "夾", 夺: "奪", 奋: "奮", 奖: "獎", 妇: "婦", 姜: "薑", 娱: "娛", 学: "學", 实: "實",
  审: "審", 宪: "憲", 宝: "寶", 将: "將", 对: "對", 导: "導", 尔: "爾", 尘: "塵", 层: "層", 岁: "歲",
  岗: "崗", 岛: "島", 岭: "嶺", 币: "幣", 帅: "帥", 师: "師", 帐: "帳", 带: "帶", 帮: "幫", 干: "干",
  库: "庫", 应: "應", 庙: "廟", 开: "開", 异: "異", 弃: "棄", 张: "張", 强: "強", 归: "歸", 当: "當", 继: "繼",
  录: "錄", 径: "徑", 忆: "憶", 忧: "憂", 怀: "懷", 态: "態", 总: "總", 恶: "惡", 悯: "憫", 惯: "慣",
  愿: "願", 戏: "戲", 户: "戶", 扩: "擴", 扫: "掃", 扬: "揚", 护: "護", 担: "擔", 择: "擇", 挡: "擋",
  损: "損", 据: "據", 授: "授", 换: "換", 揭: "揭", 搭: "搭", 携: "攜", 摄: "攝", 摆: "擺", 撑: "撐",
  效: "效", 数: "數", 断: "斷", 无: "無", 时: "時", 显: "顯", 晋: "晉", 晓: "曉", 晕: "暈", 晚: "晚",
  术: "術", 权: "權", 条: "條", 来: "來", 极: "極", 构: "構", 标: "標", 样: "樣", 档: "檔", 桥: "橋",
  检: "檢", 楼: "樓", 机: "機", 横: "橫", 欢: "歡", 步: "步", 残: "殘", 毕: "畢", 气: "氣", 汇: "匯",
  汉: "漢", 汤: "湯", 沟: "溝", 没: "沒", 泽: "澤", 洁: "潔", 测: "測", 济: "濟", 涡: "渦", 润: "潤",
  淀: "澱", 渐: "漸", 温: "溫", 湿: "濕", 满: "滿", 滤: "濾", 灾: "災", 炼: "煉", 烦: "煩", 热: "熱", 闷: "悶", 荡: "蕩",
  爱: "愛", 牵: "牽", 状: "狀", 独: "獨", 猫: "貓", 环: "環", 现: "現", 画: "畫", 疗: "療", 症: "症",
  监: "監", 盖: "蓋", 盘: "盤", 着: "著", 确: "確", 碍: "礙", 礼: "禮", 种: "種", 积: "積", 称: "稱",
  稳: "穩", 穷: "窮", 窝: "窩", 笔: "筆", 筛: "篩", 简: "簡", 类: "類", 粮: "糧", 约: "約", 级: "級",
  纪: "紀", 纯: "純", 纲: "綱", 纳: "納", 纵: "縱", 纷: "紛", 线: "線", 练: "練", 组: "組", 细: "細",
  终: "終", 结: "結", 绘: "繪", 给: "給", 统: "統", 续: "續", 缘: "緣", 编: "編", 缓: "緩", 缩: "縮", 输: "輸",
  缺: "缺", 罚: "罰", 罗: "羅", 职: "職", 联: "聯", 肤: "膚", 胜: "勝", 脑: "腦", 脱: "脫", 舍: "捨",
  艺: "藝", 节: "節", 范: "範", 荐: "薦", 药: "藥", 获: "獲", 营: "營", 落: "落", 虑: "慮", 虽: "雖",
  补: "補", 表: "表", 装: "裝", 见: "見", 规: "規", 观: "觀", 觉: "覺", 触: "觸", 计: "計", 认: "認",
  讨: "討", 让: "讓", 训: "訓", 议: "議", 讯: "訊", 记: "記", 讲: "講", 许: "許", 论: "論", 设: "設",
  证: "證", 评: "評", 识: "識", 诉: "訴", 诊: "診", 词: "詞", 试: "試", 该: "該", 详: "詳", 语: "語",
  误: "誤", 说: "說", 请: "請", 诸: "諸", 读: "讀", 调: "調", 谈: "談", 谓: "謂", 负: "負", 财: "財",
  责: "責", 败: "敗", 质: "質", 费: "費", 资: "資", 赋: "賦", 赖: "賴", 赚: "賺", 赛: "賽", 赞: "讚",
  赶: "趕", 赵: "趙", 践: "踐", 车: "車", 转: "轉", 轮: "輪", 软: "軟", 轻: "輕", 较: "較", 辅: "輔",
  边: "邊", 过: "過", 运: "運", 还: "還", 进: "進", 远: "遠", 违: "違", 连: "連", 迟: "遲", 适: "適", 载: "載",
  选: "選", 递: "遞", 逻: "邏", 遗: "遺", 邻: "鄰", 郑: "鄭", 酝: "醞", 释: "釋", 里: "里", 钟: "鐘",
  针: "針", 钱: "錢", 链: "鏈", 错: "錯", 锦: "錦", 门: "門", 问: "問", 间: "間", 阴: "陰", 阶: "階",
  际: "際", 随: "隨", 隐: "隱", 难: "難", 雾: "霧", 静: "靜", 须: "須", 顾: "顧", 领: "領", 风: "風",
  饭: "飯", 饮: "飲", 馆: "館", 验: "驗", 鱼: "魚", 鲜: "鮮", 鸟: "鳥", 鸣: "鳴", 龙: "龍", 齐: "齊",
  // 客戶答案常用、原表漏掉的字（僅新增，不改動既有對應）。
  内: "內", 题: "題", 拥: "擁", 协: "協", 达: "達", 旧: "舊", 杂: "雜", 酿: "釀", 绪: "緒", 经: "經", 弹: "彈", 项: "項", 预: "預", 馈: "饋", 视: "視", 诺: "諾", 并: "並", 维: "維", 竞: "競", 这: "這", 顺: "順", 键: "鍵", 办: "辦", 险: "險", 点: "點", 础: "礎", 属: "屬", 暂: "暫", 长: "長", 杀: "殺", 阳: "陽",
};

// Traditional → Simplified for display text that is authored once in Traditional.
// Reverses HANT_CHARS / HANT_PHRASES (1:1) and adds common Traditional characters those tables never needed.
// Prefer authoring a real zh-Hans string at the source; use this where a Traditional-only literal already exists.
const HANS_EXTRA: Record<string, string> = {
  併: "并", 駐: "驻", 裡: "里", 復: "复", 複: "复", 擔: "担", 據: "据", 撐: "撑", 換: "换", 擇: "择", 隨: "随", 離: "离",
  難: "难", 戰: "战", 陣: "阵", 麼: "么", 認: "认", 識: "识", 讀: "读", 記: "记", 設: "设", 許: "许", 訪: "访", 訊: "讯",
  訓: "训", 評: "评", 詞: "词", 話: "话", 該: "该", 詳: "详", 誠: "诚", 誤: "误", 說: "说", 課: "课", 調: "调", 談: "谈",
  論: "论", 護: "护", 變: "变", 讓: "让", 負: "负", 財: "财", 貨: "货", 貴: "贵", 費: "费", 質: "质", 賴: "赖", 贈: "赠",
  趕: "赶", 跡: "迹", 軟: "软", 轉: "转", 輕: "轻", 輪: "轮", 輯: "辑", 輸: "输", 農: "农", 遞: "递", 邊: "边", 郵: "邮",
  鄉: "乡", 醫: "医", 釋: "释", 鐘: "钟", 鑑: "鉴", 閉: "闭", 開: "开", 間: "间", 閱: "阅", 隊: "队", 階: "阶", 陸: "陆",
  際: "际", 隱: "隐", 雖: "虽", 雜: "杂", 電: "电", 韓: "韩", 頁: "页", 頂: "顶", 項: "项", 預: "预", 領: "领", 頭: "头",
  額: "额", 顯: "显", 風: "风", 飛: "飞", 駕: "驾", 驚: "惊", 髮: "发", 鬥: "斗", 鬧: "闹", 鵝: "鹅", 麗: "丽", 黨: "党",
  齡: "龄", 觀: "观", 靜: "静", 綠: "绿", 藍: "蓝", 銀: "银", 鋒: "锋", 溫: "温", 氣: "气", 體: "体", 時: "时", 見: "见",
};
const HANS_CHARS: Record<string, string> = {
  ...HANS_EXTRA,
  ...Object.fromEntries(Object.entries(HANT_CHARS).map(([simplified, traditional]) => [traditional, simplified])),
};
const HANS_PHRASES: Array<[string, string]> = HANT_PHRASES.map(([simplified, traditional]) => [traditional, simplified]);

export function toSimplifiedCustomerText(value: string): string {
  let text = String(value ?? "");
  for (const [traditional, simplified] of HANS_PHRASES) text = text.replaceAll(traditional, simplified);
  return [...text].map((character) => HANS_CHARS[character] ?? character).join("");
}

export function toTraditionalCustomerText(value: string): string {
  let text = String(value ?? "");
  for (const [source, target] of HANT_PHRASES) text = text.replaceAll(source, target);
  return [...text].map((character) => HANT_CHARS[character] ?? character).join("");
}

export function localizeReading(reading: Reading, locale?: AppLocale): Reading {
  if (locale !== "zh-Hant" && locale !== "zh-Hans") return reading;
  const hant = locale === "zh-Hans" ? toSimplifiedCustomerText : toTraditionalCustomerText;
  return {
    ...reading,
    directAnswer: hant(reading.directAnswer),
    rhythm: hant(reading.rhythm),
    work: hant(reading.work),
    love: hant(reading.love),
    money: hant(reading.money),
    body: hant(reading.body),
    home: hant(reading.home),
    action: hant(reading.action),
    decree: hant(reading.decree),
    lastLine: hant(reading.lastLine),
    guide: {
      ...reading.guide,
      colors: reading.guide.colors.map(hant),
      avoidColors: reading.guide.avoidColors.map(hant),
      directions: {
        favor: reading.guide.directions.favor.map(hant),
        rest: reading.guide.directions.rest.map(hant),
      },
      hours: {
        favor: reading.guide.hours.favor.map(hant),
        drain: reading.guide.hours.drain.map(hant),
      },
      pet: hant(reading.guide.pet),
    },
  };
}
