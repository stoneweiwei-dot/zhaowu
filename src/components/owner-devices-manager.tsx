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
    case "PASSKEY_TIMEOUT": return tr(locale, "驗證等待逾時，請重試；尚未變更受信任裝置。", "验证等待超时，请重试；尚未更改受信任设备。", "Authentication timed out. Try again; no trusted-device change was confirmed.");
    case "PASSKEY_CANCELLED": return tr(locale, "已取消。", "已取消。", "Cancelled.");
    case "OWNER_PASSWORD_REQUIRED": return tr(locale, "加入新裝置必須用站主密碼登入，請先登出再用密碼登入。", "加入新设备必须用站主密码登录，请先登出再用密码登录。", "Adding a device needs a password sign-in. Sign out and sign in with the password first.");
    case "DEVICE_LIMIT_REACHED": return tr(locale, "最多 5 台受信任裝置，請先撤銷一台。", "最多 5 台受信任设备，请先撤销一台。", "Up to 5 trusted devices. Revoke one first.");
    case "DEVICE_EXISTS": return tr(locale, "這支手機已經加入過了（或曾被撤銷，無法再次加入）。", "这支手机已经加入过了（或曾被撤销，无法再次加入）。", "This phone is already registered, or was revoked and cannot be added again.");
    case "OWNER_REQUIRED": return tr(locale, "站主登入已失效，請重新登入。", "站主登录已失效，请重新登录。", "Owner session expired. Please sign in again.");
    case "PASSKEY_BROWSER_BLOCKED": return tr(locale, "Face ID 驗證未完成。若目前在 ChatGPT 內建瀏覽器，請改用 iPhone Safari 開啟正式網站重試。", "Face ID 验证未完成。若在 ChatGPT 内置浏览器，请改用 iPhone Safari 打开正式网站重试。", "Face ID ceremony was not completed. If using an in-app browser, open the website in Safari.");
    case "PASSKEY_ALREADY_REGISTERED": return tr(locale, "此裝置已有該網站的通行密鑰，但伺服器尚未確認註冊。請勿反覆建立，先檢查 iPhone 的密碼／通行密鑰。", "此设备已有网站通行密钥，但服务器尚未确认注册。请先检查 iPhone 的密码／通行密钥。", "A local passkey already exists but is not confirmed by the server. Check iPhone Passwords before retrying.");
    case "BRIDGE_UNAUTHORIZED":
    case "BRIDGE_REQUIRED":
    case "BRIDGE_NOT_CONFIGURED":
    case "OWNER_EDGE_NOT_CONFIGURED":
      return tr(locale, "後台裝置橋接金鑰尚未同步，無法註冊 Face ID。請先修復 Vercel／Supabase 的伺服器驗證。", "后台设备桥接密钥尚未同步，无法注册 Face ID。请先修复 Vercel／Supabase 的服务器验证。", "The server-to-server device bridge is not configured consistently. Face ID enrollment is unavailable.");
    case "OWNER_UNAUTHORIZED": return tr(locale, "站主已登入，但 Supabase 後端不接受此站主驗證。必須同步後端站主驗證值，無須重設你的密碼。", "站主已登录，但 Supabase 后端不接受站主验证，须同步后端验证值，无须重设密码。", "Signed in, but Supabase rejected the owner proof. Sync the server-side owner verifier; do not reset your password.");
    case "OWNER_EDGE_HTTP_404": return tr(locale, "裝置服務網址返回 HTTP 404；請檢查 Production 的 Supabase 專案網址與 Edge Function 是否一致。", "设备服务网址返回 HTTP 404；请检查 Production Supabase 项目和 Edge Function。", "The device service returned HTTP 404; check the Production project URL and Edge Function.");
    case "OWNER_EDGE_HTTP_401":
    case "OWNER_EDGE_HTTP_403": return tr(locale, "裝置服務拒絕伺服器連線，需核對 Vercel／Supabase 的橋接授權。", "设备服务拒绝服务器连接，需要核对 Vercel／Supabase 的桥接授权。", "Device service rejected server authorization. Check the bridge configuration.");
    case "DEVICE_LIST_FAILED":
    case "DEVICE_CREATE_FAILED":
    case "OWNER_DATA_FAILED":
    case "SUPABASE_ENV_MISSING":
    case "OWNER_EDGE_HTTP_502":
    case "OWNER_EDGE_HTTP_503": return tr(locale, "Supabase 裝置服務錯誤；Face ID 尚未註冊，請勿反覆產生通行密鑰。", "Supabase 设备服务错误；Face ID 尚未注册，请勿重复建立通行密钥。", "Supabase device service error. Enrollment is not complete; do not repeatedly create passkeys.");
    case "PASSKEY_FAILED": return tr(locale, "裝置服務操作失敗；不是密碼輸入錯誤。請重試，若持續發生需要修復伺服器設定。", "设备服务操作失败；不是密码输入错误。请重试，若持续发生需要修复服务器设置。", "Device service failed; this is not a password entry error. Retry or check server configuration.");
    default: return tr(locale, "操作失敗，請稍後再試。", "操作失败，请稍后再试。", "That did not work. Try again shortly.");
  }
}

export function OwnerDevicesManager({ locale }: { locale: Locale }) {
  const [devices, setDevices] = useState<OwnerDevice[] | null>(null);
  const [deviceLoadFailed, setDeviceLoadFailed] = useState(false);
  const [kind, setKind] = useState<"secret" | "device" | null>(null);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // Device-list failures must never hide a verified password session.
    // In particular, a broken Edge bridge must not tell a signed-in owner to sign out.
    const [deviceResult, sessionResult] = await Promise.allSettled([
      listOwnerDevices(),
      readOwnerSessionKind(),
    ]);
    setKind(sessionResult.status === "fulfilled" ? sessionResult.value : null);
    if (deviceResult.status === "fulfilled") {
      setDevices(deviceResult.value);
      setDeviceLoadFailed(false);
    } else {
      setDevices([]);
      setDeviceLoadFailed(true);
      setMessage(errorText(deviceResult.reason instanceof Error ? deviceResult.reason.message : "", locale));
    }
  }, [locale]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function onRegister() {
    if (deviceLoadFailed) {
      setMessage(tr(locale, "裝置清單尚未成功連線；先按「重新讀取」，避免建立無法保存的通行密鑰。", "设备清单尚未成功连接；请先重试，避免建立无法保存的通行密钥。", "The device backend is offline. Retry loading before creating a passkey."));
      return;
    }
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

      {deviceLoadFailed ? (
        <div role="alert" className="mt-4 rounded-xl border border-cinnabar/30 bg-cinnabar/5 p-3 text-sm text-cinnabar-deep">
          <p>{tr(locale, "裝置清單暫時無法讀取，這不代表沒有受信任裝置，也不會取消你的登入。", "设备列表暂时无法读取，不代表没有受信任设备，也不会取消你的登录。", "Device list unavailable. This does not mean there are no trusted devices or that you were signed out.")}</p>
          <button type="button" disabled={busy} onClick={() => void refresh()} className="mt-2 min-h-11 rounded-lg border border-cinnabar/30 px-4">{tr(locale, "重新讀取", "重新读取", "Retry")}</button>
        </div>
      ) : null}

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
      ) : devices && !deviceLoadFailed ? <p className="mt-4 text-sm text-ink-mute">{tr(locale, "還沒有受信任裝置。", "还没有受信任设备。", "No trusted devices yet.")}</p> : null}

      {revoked.length ? <p className="mt-3 text-xs text-ink-mute">{tr(locale, `已撤銷 ${revoked.length} 台。`, `已撤销 ${revoked.length} 台。`, `${revoked.length} revoked.`)}</p> : null}

      <div className="mt-5 border-t border-line/60 pt-4">
        {!passkeySupported() ? (
          <p className="text-sm text-ink-mute">{tr(locale, "這個瀏覽器不支援 Passkey。", "这个浏览器不支持 Passkey。", "This browser does not support passkeys.")}</p>
        ) : kind === "device" ? (
          <p className="text-sm text-ink-mute">{tr(locale, "目前是 Face ID 登入；加入新裝置需要先登出，再用站主密碼登入。", "目前是 Face ID 登录；加入新设备需要先登出，再用站主密码登录。", "This is a Face ID session. Sign in with the owner password to add another device.")}</p>
        ) : kind === null ? (
          <p className="text-sm text-cinnabar-deep">{tr(locale, "目前無法確認登入方式。請重新整理頁面，不要先登出。", "目前无法确认登录方式。请刷新页面，不要先登出。", "Cannot verify the current sign-in method. Refresh the page without signing out.")}</p>
        ) : deviceLoadFailed ? (
          <p role="status" className="text-sm text-cinnabar-deep">{tr(locale, "後端裝置清單仍未連通，暫停新增 Face ID；請先按上方「重新讀取」。", "后端设备清单仍未连通，暂停新增 Face ID；请先点击上方「重新读取」。", "Device backend is still unavailable. Enrollment is paused until the retry succeeds.")}</p>
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
