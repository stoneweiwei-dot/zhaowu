import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  GUARDIAN_BEAST_ART_BY_ELEMENT,
  SONG_BEAST_ARCHETYPES,
  buildSongBeastArtPrompt,
  type SongBeastArchetype,
  type SongBeastMode,
} from "@/lib/song-beast-art-prompt";

/** Result-bound prompt, not an image provider call and not a second quiz result. */
export function SongBeastPromptDisclosure({
  locale, innerAnimal, guardianElement,
}: {
  locale: Locale;
  innerAnimal: SongBeastArchetype;
  guardianElement?: keyof typeof GUARDIAN_BEAST_ART_BY_ELEMENT;
}) {
  const [selection, setSelection] = useState<"inner" | "guardian">("inner");
  const [mode, setMode] = useState<SongBeastMode>("solo");
  const [status, setStatus] = useState("");
  const tx = (hant: string, hans: string, en: string) => locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
  const guardianBeast = guardianElement ? GUARDIAN_BEAST_ART_BY_ELEMENT[guardianElement] : null;
  const selectedBeast = selection === "guardian" && guardianBeast ? guardianBeast : innerAnimal;
  const beastName = SONG_BEAST_ARCHETYPES.find((item) => item.id === selectedBeast);
  const prompt = useMemo(() => buildSongBeastArtPrompt({ archetype: selectedBeast, mode }), [selectedBeast, mode]);
  return (
    <details className="rounded-xl border border-line bg-cream/95 p-4 sm:p-5" data-result-song-beast-prompt>
      <summary className="flex min-h-11 cursor-pointer items-center font-display text-lg text-ink">
        {tx("製作我的宋式異獸畫像", "制作我的宋式异兽画像", "Create a Song-style beast image prompt")}
      </summary>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        {tx("依這次測驗結果產生繪圖指令，可複製至繪圖工具。此處不會即時生成圖片；趣味動物與正式命局瑞獸仍各自獨立。",
          "根据本次测试结果生成绘图指令，可复制到绘图工具。这里不会即时生成图片；趣味动物与正式命局瑞兽仍各自独立。",
          "Copy a prompt based on your result for an image tool. This does not generate an image or change your chart.")}
      </p>
      {guardianBeast ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" aria-pressed={selection === "inner"} onClick={() => { setSelection("inner"); setStatus(""); }} className={`min-h-11 rounded-lg border px-3 text-sm ${selection === "inner" ? "border-[#315e50] bg-[#315e50] text-white" : "border-line bg-paper text-ink"}`}>
            {tx("內在動物", "内在动物", "Inner animal")}
          </button>
          <button type="button" aria-pressed={selection === "guardian"} onClick={() => { setSelection("guardian"); setStatus(""); }} className={`min-h-11 rounded-lg border px-3 text-sm ${selection === "guardian" ? "border-[#315e50] bg-[#315e50] text-white" : "border-line bg-paper text-ink"}`}>
            {tx("命局瑞獸", "命局瑞兽", "Chart guardian")}
          </button>
        </div>
      ) : null}
      <p className="mt-3 text-sm font-medium text-ink">{tx("異獸原型", "异兽原型", "Beast")}: {locale === "en" ? beastName?.en : locale === "zh-Hans" ? beastName?.hans : beastName?.hant}</p>
      <label className="mt-3 block text-sm text-ink">
        {tx("構圖", "构图", "Composition")}
        <select value={mode} onChange={(event) => { setMode(event.target.value as SongBeastMode); setStatus(""); }} className="mt-1 block min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base text-ink">
          <option value="solo">{tx("異獸獨像", "异兽独像", "Beast only")}</option>
          <option value="companion">{tx("與主人同框（需自行附照片）", "与主人同框（需自行附照片）", "With a person (supply photo separately)")}</option>
          <option value="atlas">{tx("宋式異獸圖鑑底稿", "宋式异兽图鉴底稿", "Song atlas illustration")}</option>
        </select>
      </label>
      <textarea readOnly aria-label={tx("宋式異獸生成指令", "宋式异兽生成指令", "Image prompt")} value={prompt} rows={6} className="mt-3 block w-full resize-y rounded-lg border border-line bg-paper p-3 text-sm leading-6 text-ink" />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void navigator.clipboard.writeText(prompt).then(() => setStatus(tx("已複製", "已复制", "Copied"))).catch(() => setStatus(tx("請手動選取並複製", "请手动选取并复制", "Select and copy manually")))} className="min-h-11 rounded-lg bg-[#315e50] px-4 text-sm text-white">
          {tx("複製指令", "复制指令", "Copy prompt")}
        </button>
        <span role="status" className="text-sm text-ink-soft">{status}</span>
      </div>
    </details>
  );
}
