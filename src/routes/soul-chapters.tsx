import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import {
  SOUL_CHAPTERS,
  CHAPTER_GROUPS,
  CHAPTER_DISCLAIMER,
  CHAPTER_TITLE_PROMPT,
  findChapter,
  type Locale,
} from "@/lib/soul-chapters-data";
import "@/soul-chapters.css";
import { SoulVolumeGallery } from "@/components/soul-volume-gallery";

export const Route = createFileRoute("/soul-chapters")({ component: SoulChaptersPage });

function useCopy(locale: Locale) {
  if (locale === "en") {
    return {
      kicker: "ZHAOWU · SOUL CHAPTERS",
      back: "Back home",
      chapterLabel: "Chapter",
      skyLabel: "Sky",
      landLabel: "Land",
      lineLabel: "Essence",
      readingLabel: "Reading",
      noteLabel: "Zhaowu note",
      tryLabel: "Try today",
      keywordsLabel: "Keywords",
      groupLabel: "Group",
      disclaimerTitle: "What this is — and isn't",
      sourceNote: "Original ZHAOWU narrative. Not affiliated with or certified by Michael Newton Institute or Michael Teachings.",
      pickHint: "Tap a chapter to read it in full. Your choice reflects how you feel now — not a fixed label.",
    };
  }
  if (locale === "zh-Hans") {
    return {
      kicker: "昭梧 · 灵阶十章",
      back: "返回首页",
      chapterLabel: "第",
      skyLabel: "在天",
      landLabel: "在地",
      lineLabel: "命象短句",
      readingLabel: "正文",
      noteLabel: "昭梧提示",
      tryLabel: "今天做一件事",
      keywordsLabel: "关键词",
      groupLabel: "组别",
      disclaimerTitle: "这是什么——以及不是什么",
      sourceNote: "昭梧原创叙事原型。与 Michael Newton Institute 或 Michael Teachings 无关联，未获其认证。",
      pickHint: "点击任一章可看完整内容。你的选择只反映此刻的状态——不是一个固定标签。",
    };
  }
  return {
    kicker: "昭梧 · 靈階十章",
    back: "返回首頁",
    chapterLabel: "第",
    skyLabel: "在天",
    landLabel: "在地",
    lineLabel: "命象短句",
    readingLabel: "正文",
    noteLabel: "昭梧提示",
    tryLabel: "今天做一件事",
    keywordsLabel: "關鍵詞",
    groupLabel: "組別",
    disclaimerTitle: "這是什麼——以及不是什麼",
    sourceNote: "昭梧原創敘事原型。與 Michael Newton Institute 或 Michael Teachings 無關聯，未獲其認證。",
    pickHint: "點擊任一章可看完整內容。你的選擇只反映此刻的狀態——不是一個固定標籤。",
  };
}

function SoulChaptersPage() {
  const { locale } = useI18n();
  const copy = useCopy(locale);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selected = selectedSlug ? findChapter(selectedSlug) : null;

  return (
    <main className="mx-auto max-w-3xl space-y-5 pb-16">
      {/* Header */}
      <header className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
        <p className="text-xs tracking-[0.24em] text-cinnabar">{copy.kicker}</p>
        <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">{CHAPTER_TITLE_PROMPT[locale]}</h1>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-ink-soft hover:text-ink">{copy.disclaimerTitle}</summary>
          <p className="mt-3 rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-7 text-ink-soft">
            {CHAPTER_DISCLAIMER[locale]}
          </p>
          <p className="mt-2 text-xs leading-6 text-ink-mute">{copy.sourceNote}</p>
        </details>
      </header>

      {/* One shared gallery route; separate Chinese and English art and narrative. */}
      <SoulVolumeGallery locale={locale} />

      {/* Chapter grid */}
      <section className="space-y-6">
        {CHAPTER_GROUPS[locale].map((group, index) => {
          const chapters = SOUL_CHAPTERS.filter(
            (c) => c.fields[locale].title !== "" && c.group === group.name
          );
          // For English, match by group range since group names differ
          const chaptersInGroup = chapters.length > 0
            ? chapters
            : SOUL_CHAPTERS.filter((c) => {
                const rangeNum = group.range.split("–");
                const start = parseInt(rangeNum[0], 10);
                const end = parseInt(rangeNum[1] || rangeNum[0], 10);
                return c.number >= start && c.number <= end;
              });

          return (
            <div key={group.name} id={`sc-chapter-volume-${index + 1}`}>
              <div className="sc-group-header">
                <h2 className="font-display text-lg text-ink">{group.name}</h2>
                <span className="text-xs text-ink-mute">{group.range}</span>
              </div>
              <div className="sc-chapter-grid">
                {chaptersInGroup.map((chapter) => {
                  const f = chapter.fields[locale];
                  const isActive = selectedSlug === chapter.slug;
                  return (
                    <button
                      key={chapter.slug}
                      className={`sc-chapter-card ${isActive ? "sc-chapter-card--active" : ""}`}
                      onClick={() => setSelectedSlug(isActive ? null : chapter.slug)}
                    >
                      <span className="sc-chapter-number">
                        {String(chapter.number).padStart(2, "0")}
                      </span>
                      <div className="sc-chapter-titles">
                        <strong className="sc-chapter-title">{f.title}</strong>
                        {locale !== "en" && <small className="sc-chapter-title-en">{f.titleEn}</small>}
                      </div>
                      <p className="sc-chapter-line">{f.line}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Selected chapter detail */}
      {selected && (
        <article className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8 sc-detail">
          <div className="sc-detail-header">
            <span className="sc-detail-number">{String(selected.number).padStart(2, "0")}</span>
            <div>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                {selected.fields[locale].title}
              </h2>
              {locale !== "en" && (
                <p className="text-sm text-ink-mute">{selected.fields[locale].titleEn}</p>
              )}
            </div>
          </div>

          <p className="mt-2 text-xs text-ink-mute">
            {copy.keywordsLabel}：{selected.keywords}
          </p>

          <div className="sc-detail-imagery">
            <div>
              <span className="sc-detail-label">{copy.skyLabel}</span>
              <p className="sc-detail-text">{selected.fields[locale].sky}</p>
            </div>
            <div>
              <span className="sc-detail-label">{copy.landLabel}</span>
              <p className="sc-detail-text">{selected.fields[locale].land}</p>
            </div>
          </div>

          <div className="sc-detail-line">
            <span className="sc-detail-label">{copy.lineLabel}</span>
            <p className="sc-detail-text sc-detail-quote">{selected.fields[locale].line}</p>
          </div>

          <div className="sc-detail-reading">
            <span className="sc-detail-label">{copy.readingLabel}</span>
            <p className="sc-detail-text">{selected.fields[locale].reading}</p>
          </div>

          <div className="sc-detail-note">
            <span className="sc-detail-label">{copy.noteLabel}</span>
            <p className="sc-detail-text">{selected.fields[locale].note}</p>
          </div>

          <div className="sc-detail-try">
            <span className="sc-detail-label">{copy.tryLabel}</span>
            <p className="sc-detail-text">{selected.fields[locale].tryToday}</p>
          </div>
        </article>
      )}

      {/* Hint */}
      <p className="text-center text-sm text-ink-mute sc-hint">{copy.pickHint}</p>

      {/* Back */}
      <div className="flex justify-center">
        <Link
          to="/"
          className="inline-flex min-h-12 items-center rounded-full border border-line bg-paper px-5 py-3 text-sm text-ink"
        >
          {copy.back}
        </Link>
      </div>
    </main>
  );
}
