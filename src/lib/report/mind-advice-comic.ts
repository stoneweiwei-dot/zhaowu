import type { AnalysisResult } from "@/lib/bazi/types";

export type MindAdviceComicScene = "everyday" | "relationship" | "body" | "action" | "self";

export type MindAdviceComic = {
  scene: MindAdviceComicScene;
  zh: string;
  en: string;
  gallerySymbol: string;
  galleryAssetPath: string;
  galleryMeaning: string;
};

export function buildMindAdviceComic(result: AnalysisResult): MindAdviceComic {
  const { kind } = result.reading;
  const q = result.question;

  if (kind === "love" || /感情|關係|关系|伴侶|伴侣|婚姻|戀愛|恋爱|relationship|partner|love|marriage/i.test(q)) {
    return {
      scene: "relationship",
      zh: "關係不是用來證明自己值得被愛。靠近時真誠，該退時守住邊界。",
      en: "A relationship is not proof that you are worthy of love. Be open when closeness is mutual, and keep your boundaries when it is time to step back.",
      gallerySymbol: "無盡結",
      galleryAssetPath: "/emblems/modern-endless-knot-emblem.svg",
      galleryMeaning: "交叉引用圖庫中的無盡結：象徵連結存在，但連結不等於無限纏繞。",
    };
  }

  if (kind === "health" || /健康|身體|身体|睡眠|焦慮|焦虑|health|body|sleep|stress|anxiety/i.test(q)) {
    return {
      scene: "body",
      zh: "平靜不是沒有不適，而是先照顧自己，不讓焦慮替你做全部判斷。",
      en: "Calm does not mean having no discomfort. Look after yourself first, and do not let anxiety make every decision for you.",
      gallerySymbol: "葫蘆",
      galleryAssetPath: "/emblems/modern-gourd-emblem.svg",
      galleryMeaning: "交叉引用圖庫中的葫蘆：借其收攝、養護之意，提醒先安頓身體與日常節律。",
    };
  }

  if (kind === "self" || kind === "past" || /自己|內耗|内耗|執念|执念|過去|过去|self|past|identity/i.test(q)) {
    return {
      scene: "self",
      zh: "煩惱仍會來，但你不必跟著它走。看見念頭，就多了一次重新選擇的機會。",
      en: "Difficult thoughts can still return, but you do not have to follow them. Noticing the thought gives you another chance to choose what happens next.",
      gallerySymbol: "蓮",
      galleryAssetPath: "/emblems/lotus-emblem.svg",
      galleryMeaning: "交叉引用圖庫中的蓮：象徵身在現實之中，仍可保留清明與自持。",
    };
  }

  if (["career", "money", "home", "timing", "choice"].includes(kind)) {
    return {
      scene: "action",
      zh: "很多答案不是等來的，而是在行動中找出來。先做一個能驗證的小步，再根據結果調整。",
      en: "Many answers become clear through action. Take one small testable step, then adjust from what actually happens.",
      gallerySymbol: "山",
      galleryAssetPath: "/emblems/mountain-emblem.svg",
      galleryMeaning: "交叉引用圖庫中的山：象徵先站穩，再決定下一步，不以焦躁代替方向。",
    };
  }

  return {
    scene: "everyday",
    zh: "修心不必離開日常。塞車、排隊、洗碗或事情受阻時，不被第一個情緒牽著走，就是功課。",
    en: "You do not need to leave ordinary life to become steadier. Traffic, queues, chores and setbacks are all places to notice the first emotion and choose what happens next.",
    gallerySymbol: "梧葉",
    galleryAssetPath: "/emblems/wutong-leaf-emblem.svg",
    galleryMeaning: "交叉引用圖庫中的梧葉：象徵回到日常節律，在普通生活裡安住自己。",
  };
}
