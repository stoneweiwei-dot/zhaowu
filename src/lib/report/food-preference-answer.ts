import type { AppLocale } from "@/lib/bazi/types";

/** Taste is a preference, not a diagnosis or an inference from a birth chart. */
export function foodPreferenceAnswer(question: string, locale: AppLocale = "zh-Hant") {
  if (!/(口味|味道|味覺|味觉|酸甜|甜鹹|甜咸|食物|飲食|饮食|吃什麼|吃什么|food|flavou?r|taste|diet)/i.test(question)) return null;
  // Treatment, allergies and clinical diet questions retain their medical boundary.
  if (/(過敏|过敏|疾病|糖尿病|痛風|痛风|潰瘍|溃疡|治療|治疗|藥|药|allerg|diabet|gout|ulcer|treat|medicin)/i.test(question)) return null;
  if (locale === "en") return {
    answer: "For a simple meal, choose a familiar staple, add a protein you enjoy such as tofu, eggs or fish, and include two vegetables. A birth chart cannot tell which foods suit your personal taste. Tell me two foods you like, one you avoid, and any allergy or diet limits, and I can suggest three meals.",
    nextAction: "Name two foods you like, one you avoid, and any allergy or dietary restrictions; I can suggest three meals.",
    detail: ["Fresh and tangy: citrus or berry flavours; sweet and rich: vanilla, cocoa or nut flavours. These are examples to compare, not chart-based recommendations.", "Separate flavour from texture: crisp, smooth and chewy foods can feel different even when they taste similar.", "Traditional food symbolism can be discussed as cultural imagery; it does not establish your personal taste or prescribe a diet."],
    route: "preference:food",
  };
  const hant = {
    answer: "如果你只是想先決定一餐，可以選平常會吃的主食，搭配豆腐、雞蛋、魚或其他你能吃的蛋白質，再加兩種蔬菜。八字不能判定你個人適合哪種食物。告訴我兩種愛吃、一種會避開的食物，以及過敏或飲食限制，我可以直接列三個餐點選項。",
    nextAction: "告訴我兩種愛吃、一種會避開的食物，以及過敏或飲食限制，我可以直接列三個餐點選項。",
    detail: ["清新酸香可拿柑橘、莓果風味比較；甜香濃郁可比較香草、可可或堅果風味。這些是口味例子，不是從命盤推算的推薦。", "口味與口感要分開：脆、滑、綿密、帶嚼勁，會影響喜好；同一種風味未必適合每一種口感。", "若想看傳統五味象徵，可以另作文化解讀；它不能證明你的味覺偏好，也不能代替飲食評估。"],
    route: "preference:food",
  };
  if (locale !== "zh-Hans") return hant;
  return {
    answer: "如果你只是想先决定一餐，可以选平常会吃的主食，搭配豆腐、鸡蛋、鱼或其他你能吃的蛋白质，再加两种蔬菜。八字不能判定你个人适合哪种食物。告诉我两种爱吃、一种会避开的食物，以及过敏或饮食限制，我可以直接列三个餐点选项。",
    nextAction: "列出两种你爱吃、一道你不喜欢的食物，并说明你想问实际口味，还是传统五味的文化象征。",
    detail: ["清新酸香可拿柑橘、莓果风味比较；甜香浓郁可比较香草、可可或坚果风味。这些是口味例子，不是从命盘推算的推荐。", "口味与口感要分开：脆、滑、绵密、带嚼劲，会影响喜好；同一种风味未必适合每一种口感。", "若想看传统五味象征，可以另作文化解读；它不能证明你的味觉偏好，也不能代替饮食评估。"],
    route: "preference:food",
  };
}
