/**
 * Canonical, zero-provider-cost prompt builder for ZHAOWU's Song-style beast imagery.
 * Art is an interpretation of an already determined quiz/chart archetype.
 * Never use images or prompts to derive a BaZi conclusion.
 */
export const SONG_BEAST_ART_VERSION = "ZW-SONG-BEAST-ART-v1.0-20261019";

export const SONG_BEAST_ARCHETYPES = [
  { id: "eagle", hant: "蒼鷹", hans: "苍鹰", en: "Azure Eagle", form: "真正的蒼鷹猛禽輪廓，鉤喙、銳目、寬展雙翼；不可畫成鳳凰或鹿" },
  { id: "wolf", hant: "蒼狼", hans: "苍狼", en: "Grey Wolf", form: "狼的長吻、厚頸、四足與沉穩群居守望姿態；不可套狐狸尖臉或羽翼" },
  { id: "fox", hant: "靈狐", hans: "灵狐", en: "Spirit Fox", form: "靈狐的細長吻、三角耳、柔長尾及輕盈狡黠身段；尾數少而自然，不畫成鹿形" },
  { id: "deer", hant: "玄鹿", hans: "玄鹿", en: "Mystic Deer", form: "鹿的修長腿、分枝角與溫潤眼神，枝角可融入松木筆意，姿態安靜" },
  { id: "leopard", hant: "玄豹", hans: "玄豹", en: "Dark Leopard", form: "豹子柔韌的貓科軀幹、低伏肩背、長尾及斑紋，警覺而不具攻擊海報感" },
  { id: "crane", hant: "玄鶴", hans: "玄鹤", en: "Mystic Crane", form: "真實鶴類的修長頸腿、細喙、整潔羽翼，立於水岸或松間，絕非人臉" },
  { id: "whale", hant: "靈鯨", hans: "灵鲸", en: "Spirit Whale", form: "完整鯨類流線身軀、尾鰭與深水氣息，可在雲海與水紋間浮游，不能長出鹿腿" },
  { id: "horse", hant: "天馬", hans: "天马", en: "Celestial Horse", form: "健朗馬首、四蹄、鬃毛與長尾，行於山間雲徑；若有翼，須符合翼馬而非套用麒麟" },
  { id: "azure-luan", hant: "青鸞", hans: "青鸾", en: "Azure Luan", form: "中國傳統鸞鳥的禽類頭喙、層次尾羽與青綠羽色，清逸飛翔，絕無四足鹿身" },
  { id: "vermilion-bird", hant: "朱雀", hans: "朱雀", en: "Vermilion Bird", form: "朱雀的長羽翼、赤赭丹砂色和鳥類身形，明而不燒、不畫成西方鳳凰鎧甲" },
  { id: "qilin", hant: "麒麟", hans: "麒麟", en: "Qilin", form: "依中國古畫麒麟造型融合鹿身、蹄、單角與鱗紋；仁獸溫和、紋理留白，不畫成西方獸龍" },
  { id: "bai-ze", hant: "白澤", hans: "白泽", en: "Bai Ze", form: "依傳統神獸白澤的祥瑞四足形態創作，白毛、明目、知辨氣質；不可與麒麟同臉同角同姿" },
  { id: "yinglong", hant: "應龍", hans: "应龙", en: "Yinglong", form: "中國傳統有翼應龍：修長龍軀、龍首、四爪與一對有結構的翼；切忌做成鹿或西方火龍" },
] as const;

export type SongBeastArchetype = typeof SONG_BEAST_ARCHETYPES[number]["id"];
export type SongBeastMode = "solo" | "companion" | "atlas";
export type SongBeastSelection = SongBeastArchetype | "original";
export const GUARDIAN_BEAST_ART_BY_ELEMENT = {
  "木": "azure-luan",
  "火": "vermilion-bird",
  "土": "qilin",
  "金": "bai-ze",
  "水": "yinglong",
} as const satisfies Record<string, SongBeastArchetype>;

/** Reused by both owner copy-prompt UI and the owner-only decree-image provider path. */
export const SONG_BEAST_VISUAL_DIRECTIVE = [
  "Use the current ZHAOWU Song-dynasty art language: Northern Song academy painting and gongbi, restrained azurite/malachite mineral pigment, finely layered ink-wash mountain distances, warm ivory xuan paper or silk texture, sparse pine trees and water.",
  "Strong asymmetrical composition with legible animal anatomy, meaningful negative space (roughly one third or more), readable foreground and distant mountains, fine ink linework, subtly restrained antique gold only at selected details.",
  "Poetic and contemplative, not a crowded xianxia fantasy-game poster. No full-black or midnight backdrop, neon light, glowing particles, gold glitter, ornate jewelry overload, throne, generic fantasy armor, photo-real CG, thick fog filter, anime card UI, copied reference composition or excessive collage.",
  "Produce one 9:16 upright art image with no generated letters, symbols posing as readable Chinese, typography, captions, fake seals, signatures or watermark. Exact tri-lingual text, dossier labels and STONE 原創 credit must be overlaid separately by the website.",
  "The selected beast must retain its own species-defining silhouette and unique scene; for an original creature, establish one coherent anatomy that stays consistent across every image. Do not reuse the same deer-fox face, antlers, wings, props, pose or landscape for other archetypes.",
].join(" ");

export function isSongBeastImageContext(text: string): boolean {
  return /本命[異异][獸兽]|命局瑞[獸兽]|守[護护][獸兽]|[靈灵][獸兽]|[神瑞异異][獸兽]|青[鸞鸾]|朱雀|麒麟|白[澤泽]|應龍|应龙|龍獸|龙兽|spirit[- ]?beast|guardian[- ]?beast|inner[- ]?animal|mythical[- ]?beast|qilin|bai[ -]?ze|yinglong/i.test(text);
}

export function buildSongBeastArtPrompt(input: {
  archetype: SongBeastSelection;
  mode?: SongBeastMode;
  personDescription?: string;
  originalName?: string;
  originalForm?: string;
}): string {
  const creature = SONG_BEAST_ARCHETYPES.find((item) => item.id === input.archetype);
  if (!creature && input.archetype !== "original") throw new Error("UNKNOWN_BEAST_ARCHETYPE");
  const identity = input.archetype === "original"
    ? `${(input.originalName ?? "").trim().slice(0, 80) || "原創本命異獸"}：${(input.originalForm ?? "").trim().slice(0, 350) || "根據指定性格與世界觀創造一種輪廓清晰、四肢／翼／尾有一致結構的獨立異獸，不能只是常見鹿狐麒麟拼貼"}`
    : `${creature!.hant}（${creature!.en}）：${creature!.form}`;
  const mode = input.mode ?? "solo";
  const personDescription = (input.personDescription ?? "").trim().slice(0, 200);
  const shot =
    mode === "companion"
      ? `主人與異獸同框：人物位於一側近景，異獸在中後景形成不同尺度，兩者有自然安靜的守望或陪行關係，主體不遮臉、不重疊肢體。人物設定：${personDescription || "一位身分不特定的成年人，素雅宋式衣冠，不宣稱像任何真人"}。若附參考肖像，尊重該參考；若未附照片，不得虛構為使用者真實容貌。`
      : mode === "atlas"
        ? "圖鑑插畫底稿：一張完整的異獸主視覺，左側少量細節特寫可以自然入畫，預留清楚的大片紙面供網站後期排版；畫中不生成任何文字、圖表欄框、假書法或多格資訊卡。學術／命理說明全由網站 HTML 另行排版。"
        : "異獸獨像：只出現這一隻異獸，禁止人物。山水作為尺度與氣韻背景，異獸不必置中，讓視線在山、水、雲與空白間流動。";
  return [
    `昭梧 ZHAOWU｜宋式本命異獸畫像｜${SONG_BEAST_ART_VERSION}`,
    `選定異獸：${identity}。原創異獸請維持同系列的輪廓、角翼肢體比例與象徵連貫；不可每張換一副身體。`,
    "畫幅：9:16 iPhone 直式。視覺主軸：北宋院畫工筆、宋人青綠山水、紙絹岩彩與淡墨。米白宣紙、石青石綠、天青淺赭、局部少量泥金；一景一獸，留白有構圖功能，遠山清晰可辨，不要整幅模糊。",
    shot,
    SONG_BEAST_VISUAL_DIRECTIVE,
    "此作品只是趣味原型或既有命理判定的象徵化轉譯；不能根據美術形象重新判斷八字喜用、格局、吉凶、生肖、心理疾病或命運。",
    "輸出僅一幅乾淨主畫，無框架式遊戲角色卡。後期由昭梧輸出層補上精確繁中／簡中／英文註解與 STONE 原創署名。",
  ].join("\n");
}
