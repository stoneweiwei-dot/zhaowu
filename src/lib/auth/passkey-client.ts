// Browser side of the owner Passkey flow. The server does all verification; this only talks WebAuthn and /api/owner-session.

export type OwnerDevice = { id: string; label: string; created_at?: string; last_used_at?: string | null; revoked_at?: string | null };

type ServerOptions = Record<string, any>;

function toBase64Url(buffer: ArrayBuffer | null | undefined) {
  if (!buffer) return undefined;
  let binary = "";
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - (normalized.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

export function passkeySupported() {
  return typeof window !== "undefined" && typeof window.PublicKeyCredential === "function" && Boolean(navigator.credentials?.create);
}

async function post(action: string, extra: Record<string, unknown> = {}) {
  const response = await fetch("/api/owner-session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, any>;
  if (!response.ok || body.ok === false) throw new Error(String(body.error || `HTTP_${response.status}`));
  return body;
}

function describeError(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "AbortError") return "PASSKEY_CANCELLED";
  // NotAllowedError includes denied/aborted ceremonies AND browser contexts that reject WebAuthn.
  // Keep it visible instead of misreporting a server credential failure.
  if (name === "NotAllowedError" || name === "SecurityError" || name === "NotSupportedError") return "PASSKEY_BROWSER_BLOCKED";
  if (name === "InvalidStateError") return "PASSKEY_ALREADY_REGISTERED";
  return error instanceof Error ? error.message : "PASSKEY_FAILED";
}

/** Face ID sign-in. Resolves when the server has set the device session cookie. */
export async function passkeySignIn() {
  try {
    const { options } = (await post("passkey.login.options")) as { options: ServerOptions };
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: fromBase64Url(options.challenge),
        rpId: options.rpId,
        timeout: options.timeout,
        userVerification: "required",
      },
    })) as PublicKeyCredential | null;
    if (!credential) throw new Error("PASSKEY_CANCELLED");
    const assertion = credential.response as AuthenticatorAssertionResponse;
    await post("passkey.login.verify", {
      response: {
        id: credential.id,
        rawId: toBase64Url(credential.rawId),
        type: credential.type,
        clientExtensionResults: credential.getClientExtensionResults(),
        response: {
          clientDataJSON: toBase64Url(assertion.clientDataJSON),
          authenticatorData: toBase64Url(assertion.authenticatorData),
          signature: toBase64Url(assertion.signature),
          userHandle: toBase64Url(assertion.userHandle),
        },
      },
    });
  } catch (error) {
    throw new Error(describeError(error));
  }
}

/** Adds this phone as a trusted device. Needs a password session; the server enforces that. */
export async function registerThisDevice(label: string) {
  try {
    const { options } = (await post("passkey.register.options")) as { options: ServerOptions };
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: fromBase64Url(options.challenge),
        rp: options.rp,
        user: { id: fromBase64Url(options.user.id), name: options.user.name, displayName: options.user.displayName },
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        attestation: "none",
        excludeCredentials: (options.excludeCredentials ?? []).map((item: { id: string }) => ({ type: "public-key" as const, id: fromBase64Url(item.id) })),
        authenticatorSelection: { residentKey: "required", userVerification: "required" },
      },
    })) as PublicKeyCredential | null;
    if (!credential) throw new Error("PASSKEY_CANCELLED");
    const attestation = credential.response as AuthenticatorAttestationResponse;
    await post("passkey.register.verify", {
      label,
      response: {
        id: credential.id,
        rawId: toBase64Url(credential.rawId),
        type: credential.type,
        clientExtensionResults: credential.getClientExtensionResults(),
        response: {
          clientDataJSON: toBase64Url(attestation.clientDataJSON),
          attestationObject: toBase64Url(attestation.attestationObject),
          transports: typeof attestation.getTransports === "function" ? attestation.getTransports() : [],
        },
      },
    });
  } catch (error) {
    throw new Error(describeError(error));
  }
}

export async function listOwnerDevices() {
  const body = await post("device.list");
  return (Array.isArray(body.items) ? body.items : []) as OwnerDevice[];
}

export async function revokeOwnerDevice(id: string) {
  await post("device.revoke", { id });
}

/** "secret" = signed in with the password, "device" = signed in with a Passkey, null = not signed in. */
export async function readOwnerSessionKind(): Promise<"secret" | "device" | null> {
  const response = await fetch("/api/owner-session", { method: "GET", credentials: "include", cache: "no-store" }).catch(() => null);
  if (!response?.ok) return null;
  const body = (await response.json().catch(() => ({}))) as { authenticated?: boolean; kind?: string };
  return body.authenticated && (body.kind === "secret" || body.kind === "device") ? body.kind : null;
}
