export type Element = "木" | "火" | "土" | "金" | "水";
export type Gender = "male" | "female" | "unspecified";
export type RelationPref = "any" | "hetero" | "same" | "unset";
export type ZiPolicy = "midnight" | "late";
export type QuestionKind =
  | "career"
  | "love"
  | "money"
  | "health"
  | "choice"
  | "timing"
  | "self"
  | "past"
  | "home";

export type HiddenStem = {
  gan: string;
  shiShen: string;
  element: Element;
};

export type Pillar = {
  key: "year" | "month" | "day" | "time";
  label: string;
  gan: string;
  zhi: string;
  ganZhi: string;
  nayin: string;
  shiShenGan: string;
  hide: HiddenStem[];
  diShi: string;
  xunKong: string;
  ganElement: Element;
  zhiElement: Element;
};

export type DayunPeriod = {
  ganZhi: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  current: boolean;
};

export type CityHit = {
  name: string;
  country: string;
  display: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type AnalyzeInput = {
  question: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timeUnknown: boolean;
  gender: Gender;
  relation: RelationPref;
  city: CityHit;
  liveCity?: CityHit | null;
  ziPolicy: ZiPolicy;
  useTrueSolar: boolean;
};

export type ElementScores = Record<Element, number>;

export type Strength = {
  tendency: string;
  summary: string;
  deLing: boolean;
  deDi: boolean;
  deShi: boolean;
};

export type Chart = {
  pillars: Pillar[];
  dayMaster: string;
  dayMasterElement: Element;
  monthBranch: string;
  lunarDate: string;
  civilStamp: string;
  trueSolarStamp: string;
  timezone: string;
  cityLabel: string;
  liveCityLabel: string | null;
  longitude: number;
  hemisphere: "N" | "S";
  ziPolicy: ZiPolicy;
  usedTrueSolar: boolean;
  timeUnknown: boolean;
  gender: Gender;
  elements: ElementScores;
  elementPercents: ElementScores;
  strength: Strength;
  useful: Element[];
  drain: Element[];
  dayun: DayunPeriod[];
  currentDayun: DayunPeriod | null;
  currentYear: string;
  taiyuan: string;
  minggong: string;
  provenance: string;
};

export type LifeGuide = {
  colors: string[];
  avoidColors: string[];
  directions: { favor: string[]; rest: string[] };
  hours: { favor: string[]; drain: string[] };
  pet: string;
};

export type Reading = {
  kind: QuestionKind;
  directAnswer: string;
  rhythm: string;
  work: string;
  love: string;
  money: string;
  body: string;
  home: string;
  action: string;
  decree: string;
  lastLine: string;
  guide: LifeGuide;
};

export type AnalysisResult = {
  id: string;
  question: string;
  chart: Chart;
  reading: Reading;
  createdAt: string;
  methodProtocol?: import("@/lib/core/types").MethodProtocol;
  palm?: import("@/lib/core/types").PalmReading | null;
};

export type SavedReport = {
  id: string;
  question: string;
  cityLabel: string;
  dayMaster: string;
  ganZhiLine: string;
  createdAt: string;
  hasFullReport: boolean;
};
