import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { openPayload, readCookie, sealPayload } from "./owner-session-cookie.js";

export const PASSKEY_CHALLENGE_COOKIE = "__Host-zhaowu_passkey_challenge";
const CHALLENGE_TTL_SECONDS = 300;
const RP_NAME = "昭梧";
// One stable, non-personal user handle: there is exactly one owner.
const OWNER_USER_ID = new TextEncoder().encode("zhaowu-owner");

function header(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
}

/** A Passkey is bound to this host; registering on one domain does not work on another. */
export function rpFromRequest(req) {
  const host = (header(req, "x-forwarded-host") || header(req, "host")).split(",")[0].trim().toLowerCase();
  if (!host) return null;
  return { rpID: host.replace(/:\d+$/, ""), origin: `https://${host}` };
}

function challengeCookie(purpose, challenge, options) {
  const value = sealPayload(purpose, { c: challenge }, { ...options, ttlSeconds: CHALLENGE_TTL_SECONDS });
  if (!value) throw new Error("PASSKEY_NOT_CONFIGURED");
  return `${PASSKEY_CHALLENGE_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${CHALLENGE_TTL_SECONDS}`;
}

export function clearPasskeyChallengeCookie() {
  return `${PASSKEY_CHALLENGE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function takeChallenge(req, purpose, options) {
  const payload = openPayload(purpose, readCookie(req, PASSKEY_CHALLENGE_COOKIE), options);
  return typeof payload?.c === "string" ? payload.c : "";
}

export async function passkeyRegistrationOptions(req, { existingCredentialIds = [], ...options } = {}) {
  const rp = rpFromRequest(req);
  if (!rp) throw new Error("PASSKEY_HOST_UNKNOWN");
  const registration = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: rp.rpID,
    userName: "owner",
    userDisplayName: "昭梧站主",
    userID: OWNER_USER_ID,
    attestationType: "none",
    excludeCredentials: existingCredentialIds.map((id) => ({ id })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });
  return { options: registration, cookie: challengeCookie("passkey-register", registration.challenge, options) };
}

export async function verifyPasskeyRegistration(req, body, options = {}) {
  const rp = rpFromRequest(req);
  const expectedChallenge = takeChallenge(req, "passkey-register", options);
  if (!rp || !expectedChallenge) throw new Error("PASSKEY_CHALLENGE_MISSING");
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: rp.origin,
    expectedRPID: rp.rpID,
    requireUserVerification: true,
  });
  if (!verification.verified || !verification.registrationInfo) throw new Error("PASSKEY_REGISTRATION_REJECTED");
  const { credential } = verification.registrationInfo;
  return {
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    signCount: credential.counter,
    transports: credential.transports ?? body?.response?.transports ?? [],
  };
}

export async function passkeyAuthenticationOptions(req, options = {}) {
  const rp = rpFromRequest(req);
  if (!rp) throw new Error("PASSKEY_HOST_UNKNOWN");
  const authentication = await generateAuthenticationOptions({ rpID: rp.rpID, userVerification: "required" });
  return { options: authentication, cookie: challengeCookie("passkey-login", authentication.challenge, options) };
}

/** `device` is the stored row for the credential the browser used: { credential_id, public_key, sign_count, transports }. */
export async function verifyPasskeyAuthentication(req, body, device, options = {}) {
  const rp = rpFromRequest(req);
  const expectedChallenge = takeChallenge(req, "passkey-login", options);
  if (!rp || !expectedChallenge) throw new Error("PASSKEY_CHALLENGE_MISSING");
  if (!device || device.revoked_at) throw new Error("PASSKEY_DEVICE_UNKNOWN");
  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: rp.origin,
    expectedRPID: rp.rpID,
    requireUserVerification: true,
    credential: {
      id: device.credential_id,
      publicKey: new Uint8Array(Buffer.from(device.public_key, "base64url")),
      counter: Number(device.sign_count) || 0,
      transports: device.transports ?? [],
    },
  });
  if (!verification.verified) throw new Error("PASSKEY_AUTHENTICATION_REJECTED");
  return { newCounter: verification.authenticationInfo.newCounter };
}
