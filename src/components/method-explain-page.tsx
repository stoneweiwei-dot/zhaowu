import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  formatSharedBirthRecord,
  readSharedBirthRecord,
  sharedBirthFromUnknown,
  writeSharedBirthRecord,
  type SharedBirthRecord,
} from "@/lib/shared-birth";

type Copy = {
  title: string;
  hint: string;
};

export function MethodExplainPage({
  copies,
}: {
  copies: { "zh-Hant": Copy; "zh-Hans": Copy; en: Copy };
}) {
  const { locale } = useI18n();
  const { user } = useCurrentUserState();
  const copy = copies[locale];
  const [birth, setBirth] = useState<SharedBirthRecord | null>(null);

  useEffect(() => {
    const server = sharedBirthFromUnknown(user?.birthData);
    const next = server ?? readSharedBirthRecord();
    setBirth(next);
    if (server) writeSharedBirthRecord(server);
  }, [user?.id, user?.birthData]);

  const cta = locale === "en"
    ? {
        lead: "Birth details are kept as one shared Zhaowu record. This page does not ask you to enter them again.",
        ready: "Shared birth record ready",
        missing: "No shared birth record yet. Add it once in the Zi Ping BaZi section on the homepage.",
        action: "Edit birth record",
        add: "Add birth record once",
      }
    : locale === "zh-Hans"
      ? {
          lead: "出生资料由昭梧统一保存为一份共享记录。本页不会再让你重复填写。",
          ready: "已读取共享出生资料",
          missing: "目前还没有共享出生资料。请先在首页四柱八字分区填写一次。",
          action: "修改出生资料",
          add: "去填写一次出生资料",
        }
      : {
          lead: "出生資料由昭梧統一保存為一份共享記錄。本頁不會再讓你重複填寫。",
          ready: "已讀取共享出生資料",
          missing: "目前還沒有共享出生資料。請先在首頁四柱八字分區填寫一次。",
          action: "修改出生資料",
          add: "去填寫一次出生資料",
        };

  return (
    <main className="zhaowu-method-explain mx-auto max-w-2xl px-1 py-6">
      <section className="zhaowu-method-sheet rounded-2xl border border-line bg-cream/95 p-5 sm:p-7">
        <h1 className="font-display text-2xl sm:text-3xl">{copy.title}</h1>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.hint}</p>
        <p className="mt-4 text-sm leading-7 text-ink-mute">{cta.lead}</p>
        {birth ? (
          <div className="zhaowu-method-birth-ready">
            <span>{cta.ready}</span>
            <strong>{formatSharedBirthRecord(birth, locale)}</strong>
          </div>
        ) : (
          <p className="zhaowu-method-birth-missing">{cta.missing}</p>
        )}
        <a href="/#bazi" className="zhaowu-method-birth-action">
          {birth ? cta.action : cta.add}
        </a>
      </section>
    </main>
  );
}
