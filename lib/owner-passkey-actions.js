import { ownerEdgeRequest } from "./owner-auth.js";
import {
  clearPasskeyChallengeCookie,
  passkeyAuthenticationOptions,
  passkeyRegistrationOptions,
  verifyPasskeyAuthentication,
  verifyPasskeyRegistration,
} from "./owner-passkey.js";
import { ownerDeviceSetCookie } from "./owner-session-cookie.js";

export const PASSKEY_ACTIONS = new Set([
  "passkey.login.options",
  "passkey.login.verify",
  "passkey.register.options",
  "passkey.register.verify",
  "device.list",
  "device.revoke",
]);

/** Sign-in actions run before anybody is authenticated; everything else needs the owner. */
export const isPublicPasskeyAction = (action) => action === "passkey.login.options" || action === "passkey.login.verify";

const reply = (status, body, cookies = []) => ({ status, body, cookies });
const refuse = (status, error) => reply(status, { ok: false, error });

const CLIENT_ERRORS = new Set([
  "PASSKEY_CHALLENGE_MISSING",
  "PASSKEY_REGISTRATION_REJECTED",
  "PASSKEY_AUTHENTICATION_REJECTED",
  "PASSKEY_DEVICE_UNKNOWN",
  "PASSKEY_HOST_UNKNOWN",
  "DEVICE_EXISTS",
  "DEVICE_LIMIT_REACHED",
  "DEVICE_NOT_FOUND",
  "INVALID_DEVICE",
  "INVALID_DEVICE_ID",
  "INVALID_CREDENTIAL_ID",
]);

function failure(error) {
  const message = error instanceof Error ? error.message : "";
  if (message === "PASSKEY_NOT_CONFIGURED" || message === "OWNER_EDGE_NOT_CONFIGURED") return refuse(503, message);
  if (CLIENT_ERRORS.has(message)) return refuse(message === "DEVICE_NOT_FOUND" ? 404 : message === "DEVICE_EXISTS" || message === "DEVICE_LIMIT_REACHED" ? 409 : 400, message);
  // Library errors can carry details about the response that was sent; never echo them.
  return refuse(400, "PASSKEY_FAILED");
}

/**
 * Runs one Passkey / device action.
 * Returns { status, body, cookies } where cookies are Set-Cookie header values.
 * `owner` is authenticateOwner()'s result (null for the public sign-in actions).
 */
export async function runPasskeyAction(action, payload, { req, owner, env = process.env, fetchImpl = fetch, cookieOptions = {} } = {}) {
  const edge = (name, body, auth) => ownerEdgeRequest(name, body, auth, env, fetchImpl);
  try {
    switch (action) {
      case "passkey.login.options": {
        const { options, cookie } = await passkeyAuthenticationOptions(req, { env, ...cookieOptions });
        return reply(200, { ok: true, options }, [cookie]);
      }
      case "passkey.login.verify": {
        const response = payload?.response;
        const credentialId = typeof response?.id === "string" ? response.id : "";
        if (!credentialId) return refuse(400, "PASSKEY_FAILED");
        const { device } = await edge("owner.device.credential", { credentialId }, null);
        const { newCounter } = await verifyPasskeyAuthentication(req, response, device, { env, ...cookieOptions });
        await edge("owner.device.touch", { id: device.id, signCount: newCounter }, null);
        const session = ownerDeviceSetCookie(device.id, { env, ...cookieOptions });
        if (!session) return refuse(503, "PASSKEY_NOT_CONFIGURED");
        return reply(200, { ok: true }, [session, clearPasskeyChallengeCookie()]);
      }
      case "passkey.register.options": {
        if (owner?.kind !== "secret") return refuse(403, "OWNER_PASSWORD_REQUIRED");
        const { options, cookie } = await passkeyRegistrationOptions(req, { env, ...cookieOptions });
        return reply(200, { ok: true, options }, [cookie]);
      }
      case "passkey.register.verify": {
        if (owner?.kind !== "secret") return refuse(403, "OWNER_PASSWORD_REQUIRED");
        const registered = await verifyPasskeyRegistration(req, payload?.response, { env, ...cookieOptions });
        const { item } = await edge("owner.device.create", { ...registered, label: payload?.label }, owner);
        return reply(200, { ok: true, item }, [clearPasskeyChallengeCookie()]);
      }
      case "device.list": {
        const { items } = await edge("owner.device.list", {}, owner);
        return reply(200, { ok: true, items });
      }
      case "device.revoke": {
        await edge("owner.device.revoke", { id: payload?.id }, owner);
        return reply(200, { ok: true });
      }
      default:
        return refuse(400, "ACTION_NOT_ALLOWED");
    }
  } catch (error) {
    return failure(error);
  }
}
