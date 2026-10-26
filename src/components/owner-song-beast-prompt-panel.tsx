import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  SONG_BEAST_ARCHETYPES,
  SONG_BEAST_ART_VERSION,
  buildSongBeastArtPrompt,
  type SongBeastSelection,
  type SongBeastMode,
} from "@/lib/song-beast-art-prompt";

/** Owner-only prompt authoring tool; does not call paid image providers or write Storage. */
export function OwnerSongBeastPromptPanel({ locale }: { locale: Locale }) {
  const [beast, setBeast] = useState<SongBeastSelection>("original");
  const [originalName, setOriginalName] = useState("");
  const [originalForm, setOriginalForm] = useState("");
  const [mode, setMode] = useState<SongBeastMode>("solo");
  const [person, setPerson] = useState("");
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const tx = (hant: string, hans: string, en: string) => locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
  const prompt = useMemo(
    () => buildSongBeastArtPrompt({ archetype: beast, mode, personDescription: person, originalName, originalForm }),
    [beast, mode, person, originalName, originalForm],
  );

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <details className="rounded-xl border border-line bg-cream/95 p-4 sm:p-5" data-song-beast-prompt data-prompt-version={SONG_BEAST_ART_VERSION}>
      <summary className="flex min-h-11 cursor-pointer items-center font-display text-lg text-ink">
        {tx("宋式本命異獸 · 生成指令", "宋式本命异兽 · 生成指令", "Song beast · Image prompt")}
      </summary>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        {tx("依現有內在動物／命局瑞獸原型自動組裝北宋畫院風格指令，複製後可交給圖片工具。這裡不呼叫付費模型，也不修改測驗或八字判定。",
          "根据现有内在动物／命局瑞兽原型自动组合北宋画院风格指令，复制后可交给绘图工具。这里不调用付费模型，也不修改测验或八字判断。",
          "Build a Northern Song artwork prompt from an existing quiz or chart archetype. Copy it to an image tool; no paid generation or chart changes happen here.")}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-ink" htmlFor="song-beast-archetype">
          {tx("異獸原型", "异兽原型", "Beast archetype")}
          <select id="song-beast-archetype" value={beast} onChange={(event) => { setBeast(event.target.value as SongBeastSelection); setStatus("idle"); }} className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base text-ink">
            <option value="original">{tx("原創本命異獸（自訂）", "原创本命异兽（自定义）", "Original beast (custom)")}</option>
            {SONG_BEAST_ARCHETYPES.map((entry) => <option key={entry.id} value={entry.id}>{locale === "en" ? entry.en : locale === "zh-Hans" ? entry.hans : entry.hant}</option>)}
          </select>
        </label>
        <label className="block text-sm text-ink" htmlFor="song-beast-mode">
          {tx("畫面構圖", "画面构图", "Composition")}
          <select id="song-beast-mode" value={mode} onChange={(event) => { setMode(event.target.value as SongBeastMode); setStatus("idle"); }} className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base text-ink">
            <option value="solo">{tx("異獸獨像", "异兽独像", "Beast alone")}</option>
            <option value="companion">{tx("人物與異獸同框", "人物与异兽同框", "Person and beast")}</option>
            <option value="atlas">{tx("圖鑑解說配圖", "图鉴解说配图", "Dossier illustration")}</option>
          </select>
        </label>
      </div>
      {beast === "original" ? (
        <div className="mt-3 grid gap-3">
          <label className="block text-sm text-ink" htmlFor="song-beast-original-name">{tx("原創異獸名稱（可選）", "原创异兽名称（可选）", "Original beast name (optional)")}
            <input id="song-beast-original-name" value={originalName} onChange={(event) => { setOriginalName(event.target.value); setStatus("idle"); }} maxLength={80} className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base text-ink" />
          </label>
          <label className="block text-sm text-ink" htmlFor="song-beast-original-form">{tx("外形與象徵（越具體越不會畫成同一隻）", "外形与象征（越具体越不会画成同一只）", "Morphology and symbolism")}
            <textarea id="song-beast-original-form" value={originalForm} onChange={(event) => { setOriginalForm(event.target.value); setStatus("idle"); }} maxLength={350} rows={3} placeholder={tx("例：白羽、蜿蜒水紋、層疊山骨；明確交代角、翼、足和尾如何連接", "例：白羽、蜿蜒水纹、层叠山骨；明确交代角、翼、足和尾如何连接", "Describe head, horns, wings, limbs and tail as one coherent creature.")} className="mt-1 block w-full rounded-lg border border-line bg-paper px-3 py-2 text-base text-ink" />
          </label>
        </div>
      ) : null}
      {mode === "companion" ? (
        <label className="mt-3 block text-sm text-ink" htmlFor="song-beast-person">
          {tx("人物描述（選填；需另附真人參考照才可要求相似）", "人物描述（选填；需另附真人参考照才可要求相似）", "Person description (optional; photo reference needed for resemblance)")}
          <input id="song-beast-person" value={person} onChange={(event) => { setPerson(event.target.value); setStatus("idle"); }} maxLength={200} placeholder={tx("例：成年男子，無鬍鬚，簡潔宋式衣冠", "例：成年男子，无胡须，简洁宋式衣冠", "e.g. adult man, clean shaven, simple Song-style robes")} className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base text-ink" />
        </label>
      ) : null}
      <label className="mt-4 block text-sm text-ink" htmlFor="song-beast-prompt-text">
        {tx("已組裝指令（可選取／複製）", "已组合指令（可选取／复制）", "Ready-to-copy prompt")}
        <textarea id="song-beast-prompt-text" readOnly value={prompt} rows={8} className="mt-1 block w-full resize-y rounded-lg border border-line bg-paper p-3 text-sm leading-6 text-ink" />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void copyPrompt()} className="min-h-11 rounded-lg bg-[#4a4035] px-5 text-sm font-medium text-white">
          {tx("複製生成指令", "复制生成指令", "Copy prompt")}
        </button>
        <span role="status" className="text-sm text-ink-soft">
          {status === "copied" ? tx("已複製", "已复制", "Copied") : status === "failed" ? tx("無法自動複製，請手動選取文字", "无法自动复制，请手动选取文字", "Select and copy the text manually") : SONG_BEAST_ART_VERSION}
        </span>
      </div>
    </details>
  );
}
