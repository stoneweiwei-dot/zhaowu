export const QUIZ_TOPICS = ["career", "love", "money", "health", "self", "other"] as const;
export type QuizTopic = (typeof QUIZ_TOPICS)[number];

export const QUIZ_STATES = ["stuck", "scattered", "confirming", "shifting"] as const;
export type QuizState = (typeof QUIZ_STATES)[number];

const TOPIC_MARK: Record<QuizTopic, { "zh-Hant": string; "zh-Hans": string; en: string; seed: string }> = {
  career: { "zh-Hant": "工作", "zh-Hans": "工作", en: "Work", seed: "工作" },
  love: { "zh-Hant": "感情", "zh-Hans": "感情", en: "Love", seed: "感情" },
  money: { "zh-Hant": "財務", "zh-Hans": "财务", en: "Money", seed: "錢" },
  health: { "zh-Hant": "健康", "zh-Hans": "健康", en: "Health", seed: "健康" },
  self: { "zh-Hant": "成長", "zh-Hans": "成长", en: "Growth", seed: "成長" },
  other: { "zh-Hant": "其他", "zh-Hans": "其他", en: "Other", seed: "" },
};

const STATE_MARK: Record<QuizState, { "zh-Hant": string; "zh-Hans": string; en: string }> = {
  stuck: {
    "zh-Hant": "卡住，想動又不敢動",
    "zh-Hans": "卡住，想动又不敢动",
    en: "Stuck — wanting to move, but not yet moving",
  },
  scattered: {
    "zh-Hant": "事情很多，不知先做哪件",
    "zh-Hans": "事情很多，不知先做哪件",
    en: "Too many threads, unclear what comes first",
  },
  confirming: {
    "zh-Hant": "心裡已有答案，只是想確認",
    "zh-Hans": "心里已有答案，只是想确认",
    en: "The answer is already there; I want it confirmed",
  },
  shifting: {
    "zh-Hant": "剛發生變化，需要重新站穩",
    "zh-Hans": "刚发生变化，需要重新站稳",
    en: "Something just changed; I need to find my footing",
  },
};

export function topicLabel(topic: QuizTopic, locale: "zh-Hant" | "zh-Hans" | "en") {
  return TOPIC_MARK[topic][locale];
}

export function stateLabel(state: QuizState, locale: "zh-Hant" | "zh-Hans" | "en") {
  return STATE_MARK[state][locale];
}

export function composeQuizQuestion(input: {
  question: string;
  topic?: QuizTopic | null;
  state?: QuizState | null;
  locale?: "zh-Hant" | "zh-Hans" | "en";
}): string {
  const locale = input.locale ?? "zh-Hant";
  const raw = input.question.trim();
  const topic = input.topic ?? null;
  const state = input.state ?? null;
  const seed = topic ? TOPIC_MARK[topic].seed : "";
  const topicText = topic ? topicLabel(topic, locale) : "";
  const stateText = state ? stateLabel(state, locale) : "";
  const head = [topicText, stateText].filter(Boolean).join("／");
  const body = head ? `【${head}】${raw}` : raw;
  if (seed && !body.includes(seed) && !raw.includes(seed)) {
    return `${seed}。${body}`;
  }
  return body;
}
