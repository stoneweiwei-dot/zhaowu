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

const systemLabel = (id: PromoSystemId | null) => PROMO_SYSTEMS.find((s) => s.id === id)?.label ?? "不限單一系統";
const dateText = (iso: string | null) => (iso ? new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false }) : "永不過期");
const scopeText = (c: OwnerPromoCode) => `單一系統・${systemLabel(c.systemId)}`;

export function PromoPanel() {
  const [codes, setCodes] = useState<OwnerPromoCode[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<OwnerPromoCode | null>(null);
  const [copied, setCopied] = useState(false);
  const [systemId, setSystemId] = useState<PromoSystemId | "">("bazi");
  const [max, setMax] = useState("1");
  const [days, setDays] = useState("30");
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
    const dayCount = days.trim() === "" ? null : Number(days);
    if (dayCount !== null && (!Number.isInteger(dayCount) || dayCount < 1 || dayCount > 1825)) { setError("有效天數須為 1 至 1825 的整數，或留空代表永不過期。"); return; }
    void run(async () => {
      const row = await createPromoCode({
        productId: "system",
        systemId: systemId === "" ? null : systemId,
        maxRedemptions: max.trim() === "" ? null : Number(max),
        expiresAt: dayCount === null ? null : new Date(Date.now() + dayCount * 86_400_000).toISOString(),
        note: note.trim(),
        ...(customCode.trim() ? { code: customCode.trim() } : {}),
      });
      setCreated(row); setCopied(false); setNote(""); setCustomCode("");
    });
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); }
  }

  const field = "min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink";
  const btn = "min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink-soft disabled:opacity-40";

  return (
    <div className="space-y-6">
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <h2 className="font-display text-xl">優惠碼</h2>
        <p className="mt-1 text-sm leading-6 text-ink-mute">兌換只解鎖付費報告，與 Stripe 付款完全分開、不記金額。這裡不能刪除優惠碼，已兌換的紀錄也不會被改動；停用只會擋住之後的新兌換。</p>
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">適用系統
            <select className={field} value={systemId} onChange={(e) => setSystemId(e.target.value as PromoSystemId | "")}>
              <option value="">不限（客人選哪個系統都可兌換一個）</option>
              {PROMO_SYSTEMS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <label className="text-sm">可兌換人數（留空＝不限）
            <input className={field} inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder="1" />
          </label>
          <label className="text-sm">有效天數（留空＝永不過期）
            <input className={field} inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} placeholder="30" />
          </label>
          <label className="text-sm sm:col-span-2">備註（只有你看得到）
            <input className={field} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：送給某某的八字" />
          </label>
          <label className="text-sm sm:col-span-2">自訂優惠碼（留空會自動產生，英數字與連字號）
            <input className={field} maxLength={64} value={customCode} onChange={(e) => setCustomCode(e.target.value)} autoCapitalize="characters" autoCorrect="off" spellCheck={false} />
          </label>
          <div className="sm:col-span-2"><button type="submit" disabled={busy} className={btn}>{busy ? "處理中…" : "建立優惠碼"}</button></div>
        </form>
        {error ? <p role="alert" className="mt-3 text-sm text-cinnabar">{error}</p> : null}
        {created ? (
          <div role="status" className="mt-4 rounded-lg border border-wood/40 bg-wood/10 p-4">
            <p className="text-sm">已建立。把這組碼交給客人：</p>
            <p className="mt-1 break-all font-mono text-xl tracking-wider">{created.code}</p>
            <p className="mt-1 text-xs text-ink-mute">{scopeText(created)}・名額 {created.maxRedemptions ?? "不限"}・到期 {dateText(created.expiresAt)}</p>
            <button type="button" className={`${btn} mt-3`} onClick={() => void copy(created.code)}>{copied ? "已複製" : "複製優惠碼"}</button>
          </div>
        ) : null}
      </section>

      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg">全部優惠碼{codes ? `（${codes.length}）` : ""}</h3>
          <button type="button" className={btn} disabled={busy} onClick={() => void load()}>重新整理</button>
        </div>
        {codes === null ? <p role="status" className="mt-3 text-sm text-ink-mute">載入中…</p> : codes.length === 0 ? <p className="mt-3 text-sm text-ink-mute">還沒有優惠碼。</p> : (
          <ul className="mt-3 space-y-3">
            {codes.map((c) => (
              <li key={c.id} className="rounded-lg border border-line bg-paper/30 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-all font-mono text-base">{c.code}</span>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS[c.status].cls}`}>{STATUS[c.status].text}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-ink-mute">{scopeText(c)}・已兌換 {c.redeemedCount}／{c.maxRedemptions ?? "不限"}・到期 {dateText(c.expiresAt)}</p>
                {c.note ? <p className="mt-1 text-xs text-ink-soft">{c.note}</p> : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" disabled={busy} className={btn} onClick={() => void run(() => setPromoActive(c.id, !c.active))}>{c.active ? "停用" : "啟用"}</button>
                  <button type="button" disabled={busy} className={btn} onClick={() => void run(() => updatePromoCode(c.id, { maxRedemptions: (c.maxRedemptions ?? c.redeemedCount) + 1 }))} title={c.maxRedemptions === null ? "目前不限名額；按下會改為有限名額" : undefined}>名額 +1</button>
                  <button type="button" disabled={busy} className={btn} onClick={() => void run(() => updatePromoCode(c.id, { expiresAt: new Date(Math.max(Date.now(), c.expiresAt ? new Date(c.expiresAt).getTime() : Date.now()) + 30 * 86_400_000).toISOString() }))}>延長 30 天</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
