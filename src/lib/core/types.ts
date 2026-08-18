export type MethodStatus = "已執行" | "資料未接入" | "本題不啟用";

export type MethodItem = {
  name: string;
  role: "主判" | "專項";
  status: MethodStatus;
  strength: string;
  bound: string;
};

export type MethodProtocol = {
  version: "ZW-METHOD-1.1";
  mode: "deterministic-zero-ai";
  primary: MethodItem;
  selected: MethodItem[];
  routingReason: string;
  excluded: string[];
  performance: {
    aiCalls: 0;
    externalCalls: 0;
    maxMethods: 4;
    prebuiltAtRequestCreation: true;
  };
};

export type DaoName = "佛道" | "仙道" | "人道" | "修羅道" | "鬼道" | "畜生道";

export type PalmPalace = {
  key: "year" | "month" | "day" | "time";
  label: string;
  lifeLabel: string;
  range: string;
  zhi: string;
  star: string;
  dao: DaoName;
  verse: string;
  meaning: string;
};

export type PalmReading = {
  version: "ZW-PALM-1.0";
  ready: boolean;
  missing: string[];
  forward: boolean | null;
  lunarLabel: string;
  palaces: PalmPalace[];
  latest: PalmPalace | null;
  firstSentence: string;
  cause: string;
  fruit: string;
  seed: string;
  minggongNote: string;
  boundary: string;
};
