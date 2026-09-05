export const ZHAOWU_REASONING_ENGINE_STANDBY = {
  id: "ZW-REASONING-ENGINE-STANDBY-1.0",
  status: "standby" as const,
  enabled: false,
  activationPhrase: "啟動所有後台待命指令",
  protections: [
    "不得在 activationPhrase 出現前接入任何 production runtime。",
    "不得改動現有八字、紫微、七政、一掌經、西洋占星、D60、auth、Supabase、報告或 routing 行為。",
    "啟動時必須先比對 main 最新狀態，再逐模組接線與回歸測試；不得直接 merge 舊分支而覆蓋新修改。",
    "任何推論必須保留支持證據、反證、未知條件與可推翻點。",
  ],
  modules: [
    "從格／化格／專旺真假前置閘門",
    "地支動態關係裁決器",
    "命理推論 Evidence Graph",
    "古籍規則條件／排除條件 Registry",
    "不可事後改寫的預測回測 Ledger",
  ],
} as const;

export * from "./types";
export * from "./transformation-gate";
export * from "./relation-arbitrator";
export * from "./evidence-graph";
export * from "./classical-rule-registry";
export * from "./prediction-ledger";
