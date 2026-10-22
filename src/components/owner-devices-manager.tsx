import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  listOwnerDevices,
  passkeySupported,
  readOwnerSessionKind,
  registerThisDevice,
  revokeOwnerDevice,
  type OwnerDevice,
} from "@/lib/auth/passkey-client";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(locale === "en" ? "en-AU" : locale === "zh-Hans" ? "zh-CN" : "zh-TW");
}

function errorText(code: string, locale: Locale) {
  switch (code) {
    case "PASSKEY_CANCELLED": return tr(locale, "已取消。", "已取消。", "Cancelled.");
    case "OWNER_PASSWORD_REQUIRED": return tr(locale, "加入新裝置必須用站主密碼登入，請先登出再用密碼登入。", "加入新设备必须用站主密码登录，请先登出再用密码登录。", "Adding a device needs a password sign-in. Sign out and sign in with the password first.");
    case "DEVICE_LIMIT_REACHED": return tr(locale, "最多 5 台受信任裝置，請先撤銷一台。", "最多 5 台受信任设备，请先撤销一台。", "Up to 5 trusted devices. Revoke one first.");
    case "DEVICE_EXISTS": return tr(locale, "這支手機已經加入過了（或曾被撤銷，無法再次加入）。", "这支手机已经加入过了（或曾被撤销，无法再次加入）。", "This phone is already registered, or was revoked and cannot be added again.");
    default: return tr(locale, "操作失敗，請稍後再試。", "操作失败，请稍后再试。", "That did not work. Try again shortly.");
  }
}

export function OwnerDevicesManager({ locale }: { locale: Locale }) {
  const [devices, setDevices] = useState<OwnerDevice[] | null>(null);
  const [kind, setKind] = useState<"secret" | "device" | null>(null);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [items, sessionKind] = await Promise.all([listOwnerDevices(), readOwnerSessionKind()]);
      setDevices(items);
      setKind(sessionKind);
    } catch (error) {
      setDevices([]);
      setMessage(errorText(error instanceof Error ? error.message : "", locale));
    }
  }, [locale]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function onRegister() {
    setBusy(true);
    setMessage(null);
    try {
      await registerThisDevice(label.trim() || tr(locale, "我的手機", "我的手机", "My phone"));
      setLabel("");
      setMessage(tr(locale, "已加入。之後在登入頁按「用 Face ID 登入」即可。", "已加入。之后在登录页按“用 Face ID 登录”即可。", "Added. Next time use “Sign in with Face ID” on the sign-in page."));
      await refresh();
    } catch (error) {
      setMessage(errorText(error instanceof Error ? error.message : "", locale));
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke(device: OwnerDevice) {
    if (!window.confirm(tr(locale, `撤銷「${device.label}」？撤銷後這支手機需要用密碼重新登入，且無法再加入。`, `撤销“${device.label}”？撤销后这支手机需要用密码重新登录，且无法再加入。`, `Revoke “${device.label}”? That phone will need the password again and cannot be added back.`))) return;
    setBusy(true);
    setMessage(null);
    try {
      await revokeOwnerDevice(device.id);
      await refresh();
    } catch (error) {
      setMessage(errorText(error instanceof Error ? error.message : "", locale));
    } finally {
      setBusy(false);
    }
  }

  const active = (devices ?? []).filter((device) => !device.revoked_at);
  const revoked = (devices ?? []).filter((device) => device.revoked_at);

  return (
    <section data-owner-devices className="seal-border rounded-2xl bg-cream/88 p-4 sm:p-5">
      <h2 className="font-display text-xl">{tr(locale, "受信任裝置", "受信任设备", "Trusted devices")}</h2>
      <p className="mt-2 text-sm leading-7 text-ink-soft">
        {tr(locale,
          "加入後，這支手機可以用 Face ID 直接登入站主後台，90 天內不必輸入密碼。遺失手機時在這裡撤銷即可，約一分鐘內失效。用 Face ID 登入時無法上傳音樂與發布主題皮膚（需要密碼）。",
          "加入后，这支手机可以用 Face ID 直接登录站主后台，90 天内不必输入密码。遗失手机时在这里撤销即可，约一分钟内失效。用 Face ID 登录时无法上传音乐与发布主题皮肤（需要密码）。",
          "Once added, this phone signs in to the owner console with Face ID for 90 days. If a phone is lost, revoke it here; it stops working within about a minute. Music upload and theme-skin publishing still need the password.")}
      </p>

      {devices === null ? <p role="status" className="mt-4 text-sm">{tr(locale, "載入中…", "加载中…", "Loading…")}</p> : null}

      {active.length ? (
        <ul className="mt-4 space-y-2">
          {active.map((device) => (
            <li key={device.id} className="flex items-center justify-between gap-3 rounded-xl border border-line/70 p-3">
              <span className="min-w-0">
                <strong className="block truncate">{device.label}</strong>
                <small className="text-ink-mute">
                  {tr(locale, "加入於", "加入于", "Added")} {formatDate(device.created_at, locale)}
                  {device.last_used_at ? ` · ${tr(locale, "最近使用", "最近使用", "Last used")} ${formatDate(device.last_used_at, locale)}` : ""}
                </small>
              </span>
              <button type="button" disabled={busy} onClick={() => void onRevoke(device)} className="min-h-11 shrink-0 rounded-lg border border-line px-4">{tr(locale, "撤銷", "撤销", "Revoke")}</button>
            </li>
          ))}
        </ul>
      ) : devices ? <p className="mt-4 text-sm text-ink-mute">{tr(locale, "還沒有受信任裝置。", "还没有受信任设备。", "No trusted devices yet.")}</p> : null}

      {revoked.length ? <p className="mt-3 text-xs text-ink-mute">{tr(locale, `已撤銷 ${revoked.length} 台。`, `已撤销 ${revoked.length} 台。`, `${revoked.length} revoked.`)}</p> : null}

      <div className="mt-5 border-t border-line/60 pt-4">
        {!passkeySupported() ? (
          <p className="text-sm text-ink-mute">{tr(locale, "這個瀏覽器不支援 Passkey。", "这个浏览器不支持 Passkey。", "This browser does not support passkeys.")}</p>
        ) : kind !== "secret" ? (
          <p className="text-sm text-ink-mute">{tr(locale, "要加入這支手機，請先登出，改用站主密碼登入。", "要加入这支手机，请先登出，改用站主密码登录。", "To add this phone, sign out and sign in with the owner password first.")}</p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={label}
              maxLength={40}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={tr(locale, "這支手機的名稱（例如 iPhone 店裡）", "这支手机的名称（例如 iPhone 店里）", "Name for this phone (e.g. Shop iPhone)")}
              className="min-h-11 flex-1 rounded-lg border border-line bg-paper px-3"
              aria-label={tr(locale, "裝置名稱", "设备名称", "Device name")}
            />
            <button type="button" disabled={busy} onClick={() => void onRegister()} className="min-h-11 rounded-lg bg-cinnabar px-5 text-cream disabled:opacity-60">
              {tr(locale, "把這支手機加入受信任裝置", "把这支手机加入受信任设备", "Add this phone")}
            </button>
          </div>
        )}
        {message ? <p role="status" className="mt-3 text-sm text-cinnabar">{message}</p> : null}
      </div>
    </section>
  );
}
