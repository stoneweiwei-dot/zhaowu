export type StandbyModuleState = "code-ready" | "instruction-ready" | "research-only";

export type StandbyModule = {
  id: string;
  title: string;
  state: StandbyModuleState;
  priority: "P0" | "P1" | "P2";
  runtimeEnabled: false;
  activationRule: string;
  constraints: readonly string[];
};

const ACTIVATE = "僅在站主明確說『啟動所有後台待命指令』後，重新基於當時最新 main 做衝突檢查、實作、測試、合併與 production 驗證。";

export const ZHAOWU_STANDBY_PROGRAM = {
  id: "ZW-STANDBY-PROGRAM-2026-09-05",
  runtimeEnabled: false,
  activationPhrase: "啟動所有後台待命指令",
  modules: [
    {
      id: "P0-TRANSFORMATION-GATE",
      title: "從格／化格／專旺真假前置閘門",
      state: "code-ready",
      priority: "P0",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["先判真假再入普通格局", "必要條件、排除條件、未知條件分列", "資料不足不得硬成格"],
    },
    {
      id: "P0-RELATION-ARBITRATOR",
      title: "地支動態刑沖合害破／三合三會裁決器",
      state: "code-ready",
      priority: "P0",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["靜態排序不可替代月令／透干／病藥／歲運", "合不等於化、沖不等於凶", "補半三合與衝突裁決"],
    },
    {
      id: "P0-EVIDENCE-GRAPH",
      title: "命理推論證據鏈 Evidence Graph",
      state: "code-ready",
      priority: "P0",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["每個現實結論可追溯", "支持、反證、必要條件與未知分開", "寫不出依據不得輸出高置信結論"],
    },
    {
      id: "P0-CLASSICAL-RULE-REGISTRY",
      title: "古籍規則來源庫與成格條件核驗",
      state: "code-ready",
      priority: "P0",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["古籍關鍵字命中不等於成格", "每條規則拆必要／排除／例外／來源", "來源不確定必須標記待核"],
    },
    {
      id: "P0-PREDICTION-LEDGER",
      title: "事件預測鎖定／反證／回測帳本",
      state: "code-ready",
      priority: "P0",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["預測發布後鎖定", "事後只能追加結果不能改原文", "命中／部分／未發生／無法判斷分開"],
    },
    {
      id: "P0-QA-BENCHMARK",
      title: "命理 QA Benchmark／已知錯誤回歸測試",
      state: "instruction-ready",
      priority: "P0",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["把已發現錯判變成 regression cases", "特殊格必測破格條件", "不同排盤軟體差異保留原始輸入"],
    },
    {
      id: "P1-JYOTISH",
      title: "完整印度吠陀占星 Jyotish",
      state: "instruction-ready",
      priority: "P1",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["D1 Rasi 為根", "Bhava 定落點、Moon 定主觀感受、Dasha 定階段、Transit 定觸發", "D9 高權重，專項 Vargas 不得越權", "D40/D45/D60 高敏感降權", "正式上線前必做外部排盤 benchmark"],
    },
    {
      id: "P1-CROSS-SYSTEM-MATRIX",
      title: "跨系統一致／補充／衝突矩陣",
      state: "instruction-ready",
      priority: "P1",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["八字、紫微、七政、西洋、Jyotish、一掌經保持獨立", "只顯示共識／新增／衝突／不可比較", "不得合成玄學總分"],
    },
    {
      id: "P1-RECTIFICATION",
      title: "30 題考時定刻候選比較器",
      state: "instruction-ready",
      priority: "P1",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["每題只測一件可驗證事件", "每答一題更新候選支持度", "區分力不足輸出無法可靠區分", "不得表演式神準"],
    },
    {
      id: "P1-BRANCH-KNOWLEDGE",
      title: "十二地支／三合三會／墓庫互動知識百科",
      state: "instruction-ready",
      priority: "P1",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["百科內容與個人命盤互相連結但不越權", "開庫不等於發財", "墓庫本氣、庫氣與十神分開"],
    },
    {
      id: "P2-HEMISPHERE-ENVIRONMENT",
      title: "南北半球／遷移環境適配 Experimental",
      state: "research-only",
      priority: "P2",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["出生四柱與月令不反轉", "環境另建後天適配層", "沒有事件樣本前不得升格成主判規則"],
    },
    {
      id: "P2-GENEALOGY-NAME",
      title: "姓氏族譜與姓名文化研究",
      state: "instruction-ready",
      priority: "P2",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["定位歷史／文化研究", "族譜支系不得混併", "一手資料優先且衝突須留痕", "不得把姓氏直接當命理因果"],
    },
    {
      id: "P2-YIZHANGJING-NARRATIVE",
      title: "一掌經前世因→今生果→來世願敘事深化",
      state: "instruction-ready",
      priority: "P2",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["保持文化象徵定位", "四宮先排後敘事", "可加入三世因果歌節奏但不寫成歷史事實"],
    },
    {
      id: "P2-SYMBOLIC-CULTURE-GUARD",
      title: "Starseed／童子／通靈／仙緣等文化象徵隔離層",
      state: "instruction-ready",
      priority: "P2",
      runtimeEnabled: false,
      activationRule: ACTIVATE,
      constraints: ["只能文化研究／心理象徵／藝術敘事", "不得參與 A/B 級事實可信度加權", "不得宣稱神佛轉世、宇宙身份或超自然能力已證實"],
    },
  ] satisfies StandbyModule[],
} as const;
