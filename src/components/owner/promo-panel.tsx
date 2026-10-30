import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  PROMO_SYSTEMS,
  createPromoCode,
  listPromoCodes,
  promoErrorText,
  setPromoActive,
  updatePromoCode,
  type OwnerPromoCode,
  type PromoStatus,
  type PromoSystemId,
} from "@/lib/owner-promo-client";

const STATUS: Record<PromoStatus, { text: string; cls: string }> = {
  active: { text: "可兌換", cls: "border-wood/40 bg-wood/10 text-wood" },
  inactive: { text: "已停用", cls: "border-line bg-paper/60 text-ink-mute" },
  expired: { text: "已過期", cls: "border-cinnabar/40 bg-cinnabar/10 text-cinnabar" },
  exhausted: { text: "名額已滿", cls: "border-cinnabar/40 bg-cinnabar/10 text-cinnabar" },
};

const systemLabel = (id: PromoSystemId) => PROMO_SYSTEMS.find((s) => s.id === id)?.label ?? id;
const dateText = (iso: string | null) => iso
  ? `${new Date(iso).toLocaleString("zh-TW", { timeZone: "Australia/Sydney", hour12: false })}（悉尼時間）`
  : "永不過期";
const scopeText = (c: OwnerPromoCode) => c.systemId
  ? `指定系統・${systemLabel(c.systemId)}`
  : "任選系統（每次兌換解鎖一項）";

export function PromoPanel() {
  const [codes, setCodes] = useState<OwnerPromoCode[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<OwnerPromoCode | null>(null);
  const [copiedCode, setCopiedCode] = useState("");
  const [systemId, setSystemId] = useState<PromoSystemId | "">("");
  const [max, setMax] = useState("");
  const [days, setDays] = useState("");
  const [note, setNote] = useState("");
  const [customCode, setCustomCode] = useState("");

  const load = useCallback(async () => {
    setError("");
    try { setCodes(await listPromoCodes()); } catch (e) { setError(promoErrorText(e)); setCodes([]); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function run(task: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await task(); await load(); } catch (e) { setError(promoErrorText(e)); } finally { setBusy(false); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const maxCount = max.trim() === "" ? null : Number(max);
    if (maxCount !== null && (!Number.isInteger(maxCount) || maxCount < 1 || maxCount > 100000)) { setError("名額須為 1 至 100000 的整數，或留空代表不限名額。"); return; }
    const dayCount = days.trim() === "" ? null : Number(days);
    if (dayCount !== null && (!Number.isInteger(dayCount) || dayCount < 1 || dayCount > 1825)) { setError("有效天數須為 1 至 1825 的整數，或留空代表永不過期。"); return; }
    void run(async () => {
      const row = await createPromoCode({
        productId: "system",
        systemId: systemId === "" ? null : systemId,
        maxRedemptions: maxCount,
        expiresAt: dayCount === null ? null : new Date(Date.now() + dayCount * 86_400_000).toISOString(),
        note: note.trim(),
        ...(customCode.trim() ? { code: customCode.trim() } : {}),
      });
      setCreated(row); setCopiedCode(""); setNote(""); setCustomCode("");
    });
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setCopiedCode(text); } catch { setCopiedCode(""); }
  }

  const field = "min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink";
  const btn = "min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink-soft disabled:opacity-40";
  const activeCodes = codes?.filter((code) => code.status === "active") ?? [];
  const pastCodes = codes?.filter((code) => code.status !== "active") ?? [];

  function codeCard(code: OwnerPromoCode) {
    const expiryElapsed = code.expiresAt !== null && new Date(code.expiresAt).getTime() <= Date.now();
    const quotaReached = code.maxRedemptions !== null && code.redeemedCount >= code.maxRedemptions;
    const cannotReactivate = expiryElapsed || quotaReached;
    return (
      <li key={code.id} className="rounded-lg border border-line bg-paper/30 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="break-all font-mono text-base">{code.code}</span>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS[code.status].cls}`}>{STATUS[code.status].text}</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-ink-mute">{scopeText(code)}・已兌換 {code.redeemedCount}／{code.maxRedemptions ?? "不限"}・到期 {dateText(code.expiresAt)}</p>
        {code.note ? <p className="mt-1 text-xs text-ink-soft">{code.note}</p> : null}
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={() => void copy(code.code)}>{copiedCode === code.code ? "已複製" : "複製"}</button>
          <button type="button" disabled={busy || (!code.active && cannotReactivate)} className={btn} onClick={() => void run(() => setPromoActive(code.id, !code.active))}>{code.active ? "停用" : "重新啟用"}</button>
        </div>
        {cannotReactivate ? <p className="mt-2 text-xs leading-5 text-cinnabar">{[expiryElapsed ? "期限已過，請先延長期限" : "", quotaReached ? "名額已滿，請先增加名額" : ""].filter(Boolean).join("；")}。{!code.active ? "完成後才能重新啟用。" : "調整後才會恢復可兌換。"}</p> : null}
        <details className="mt-2 text-sm text-ink-soft">
          <summary className="min-h-11 cursor-pointer py-3 text-xs text-ink-mute">調整名額或期限</summary>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {code.maxRedemptions === null
              ? <span className="text-xs text-ink-mute">不限名額，無需加額</span>
              : <button type="button" disabled={busy} className={btn} onClick={() => void run(() => updatePromoCode(code.id, { maxRedemptions: code.maxRedemptions! + 1 }))}>名額 +1</button>}
            {code.expiresAt === null
              ? <span className="text-xs text-ink-mute">永不過期，無需延長</span>
              : <button type="button" disabled={busy} className={btn} onClick={() => void run(() => updatePromoCode(code.id, { expiresAt: new Date(Math.max(Date.now(), new Date(code.expiresAt!).getTime()) + 30 * 86_400_000).toISOString() }))}>延長 30 天</button>}
          </div>
        </details>
      </li>
    );
  }

  return (
    <div className="space-y-4">
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <h2 className="font-display text-xl">優惠碼</h2>
        <p className="mt-1 text-sm leading-6 text-ink-mute">先管理目前可用的碼；建立與舊紀錄需要時再展開。新碼預設任選系統、不限名額、永不過期；取得碼的人可重複兌換，請妥善保管。</p>
        <details className="mt-4 rounded-xl border border-line bg-paper/35 p-4">
          <summary className="min-h-11 cursor-pointer py-3 font-medium text-ink">建立新優惠碼</summary>
          <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">適用系統
              <select className={field} value={systemId} onChange={(e) => setSystemId(e.target.value as PromoSystemId | "")}>
                <option value="">任選系統（每次兌換解鎖一項）</option>
                {PROMO_SYSTEMS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <label className="text-sm">可兌換人數（留空＝不限）
              <input className={field} inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder="不限名額" />
            </label>
            <label className="text-sm">有效天數（留空＝永不過期）
              <input className={field} inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} placeholder="永不過期" />
            </label>
            <details className="sm:col-span-2 rounded-lg border border-line/70 px-3 py-2">
              <summary className="min-h-11 cursor-pointer py-3 text-sm text-ink-mute">進階：自訂碼與備註</summary>
              <div className="mt-3 grid gap-3">
                <label className="text-sm">備註（只有你看得到）
                  <input className={field} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：送給某某的八字" />
                </label>
                <label className="text-sm">自訂優惠碼（留空會自動產生）
                  <input className={field} maxLength={64} value={customCode} onChange={(e) => setCustomCode(e.target.value)} autoCapitalize="characters" autoCorrect="off" spellCheck={false} />
                </label>
              </div>
            </details>
            <div className="sm:col-span-2"><button type="submit" disabled={busy} className={btn}>{busy ? "處理中…" : "建立優惠碼"}</button></div>
          </form>
        </details>
        {error ? <p role="alert" className="mt-3 text-sm text-cinnabar">{error}</p> : null}
        {created ? (
          <div role="status" className="mt-4 rounded-lg border border-wood/40 bg-wood/10 p-4">
            <p className="text-sm">已建立。把這組碼交給客人：</p>
            <p className="mt-1 break-all font-mono text-xl tracking-wider">{created.code}</p>
            <p className="mt-1 text-xs text-ink-mute">{scopeText(created)}・名額 {created.maxRedemptions ?? "不限"}・到期 {dateText(created.expiresAt)}</p>
            <button type="button" className={`${btn} mt-3`} onClick={() => void copy(created.code)}>{copiedCode === created.code ? "已複製" : "複製優惠碼"}</button>
          </div>
        ) : null}
      </section>

      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg">可用優惠碼{codes ? `（${activeCodes.length}）` : ""}</h3>
          <button type="button" className={btn} disabled={busy} onClick={() => void load()}>重新整理</button>
        </div>
        {codes === null ? <p role="status" className="mt-3 text-sm text-ink-mute">載入中…</p> : activeCodes.length === 0 ? <p className="mt-3 text-sm text-ink-mute">目前沒有可用優惠碼。</p> : <ul className="mt-3 space-y-3">{activeCodes.map(codeCard)}</ul>}
        {pastCodes.length ? (
          <details className="mt-4 border-t border-line pt-3">
            <summary className="min-h-11 cursor-pointer py-3 text-sm text-ink-mute">舊紀錄（{pastCodes.length}）</summary>
            <ul className="mt-3 space-y-3">{pastCodes.map(codeCard)}</ul>
          </details>
        ) : null}
        <details className="mt-4 text-xs leading-6 text-ink-mute">
          <summary className="min-h-11 cursor-pointer py-3">規則說明</summary>
          <p className="mt-2">優惠碼只解鎖付費報告，與 Stripe 付款分開且不記金額。紀錄不刪除；停用只會擋住之後的新兌換。</p>
        </details>
      </section>
    </div>
  );
}
