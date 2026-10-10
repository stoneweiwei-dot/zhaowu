import { useEffect, useState } from "react";
import { useAuthState } from "@/lib/auth/provider";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { ownerData } from "@/lib/owner-data-client";
import { composeFocusedReport } from "@/lib/report/focused-report";
import { markReportCloudSaved, readLocalReports, saveLocalReport } from "@/lib/local-report-history";

export function ReportSaveStatus() {
  const result = useAppStore(s => s.current);
  const { user, isPending } = useAuthState();
  const { locale } = useI18n();
  const [state, setState] = useState<"local" | "saving" | "cloud" | "error" | "local-error">("local");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!result || isPending) return;
    let active = true;
    const localSaved = saveLocalReport(result);
    setState(localSaved ? "local" : "local-error");
    if (user?.isOwner) {
      if (readLocalReports().find(r => r.result.id === result.id)?.cloudSaved) { setState("cloud"); return; }
      setState("saving");
      void Promise.resolve().then(() => ownerData("report.save", { result, sections: composeFocusedReport(result) }))
        .then(() => { markReportCloudSaved(result.id); if (active) setState("cloud"); })
        .catch(() => { if (active) setState(localSaved ? "error" : "local-error"); });
    }
    return () => { active = false; };
  }, [result, user?.isOwner, isPending, attempt]);
  if (!result) return null;
  const en = locale === "en", hans = locale === "zh-Hans";
  const messages = en ? {
    local: "Saved on this device · Find it in My reports", saving: "Saving to the owner report archive…",
    cloud: "Saved to My reports and All reports", error: "Saved on this device. Cloud save failed; retry below.",
    "local-error": "This report could not be saved on this device. Keep this page open and retry.",
  } : hans ? {
    local: "已保存在本机，可从「我的报告」重看", saving: "正在保存到站主报告后台…",
    cloud: "已保存，可从「我的报告」或「所有人报告」重看", error: "已保存在本机；云端保存失败，请重试。",
    "local-error": "本机未能保存这份报告，请保留页面并重试。",
  } : {
    local: "已保存在本機，可從「我的報告」重看", saving: "正在保存到站主報告後台…",
    cloud: "已保存，可從「我的報告」或「所有人報告」重看", error: "已保存在本機；雲端保存失敗，請重試。",
    "local-error": "本機未能保存這份報告，請保留頁面並重試。",
  };
  return <p className="zw-report-save-status" role="status">{messages[state]}{state === "error" || state === "local-error" ? <button type="button" onClick={() => setAttempt(n => n + 1)}>{en ? "Retry saving" : hans ? "重新保存" : "重新保存"}</button> : null}</p>;
}
