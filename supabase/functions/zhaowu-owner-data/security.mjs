import { createHash, timingSafeEqual } from "node:crypto";

const encoder = new TextEncoder();
const OWNER_KEY_SHA256 = "6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07";

function text(value) {
  return String(value ?? "").trim();
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function expectedHashBytes(expectedHash) {
  const value = text(expectedHash).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(value)) return new Uint8Array();
  return Uint8Array.from(value.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16));
}

function constantTimeEqual(actual, expected) {
  if (!(actual instanceof Uint8Array) || !(expected instanceof Uint8Array) || actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function isValidOwnerSecret(value, expectedHash = OWNER_KEY_SHA256) {
  const secret = text(value);
  if (secret.length < 8 || secret.length > 256) return false;
  const expected = expectedHashBytes(expectedHash);
  if (expected.length !== 32) return false;
  const actual = createHash("sha256").update(secret, "utf8").digest();
  return constantTimeEqual(actual, expected);
}

async function importHmacKey(secret, usage) {
  const value = text(secret);
  if (value.length < 32) throw new Error("SERVER_SECRET_NOT_CONFIGURED");
  return crypto.subtle.importKey("raw", encoder.encode(value), { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

async function hmacSign(value, secret) {
  const key = await importHmacKey(secret, "sign");
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

async function hmacVerify(value, signature, secret) {
  const key = await importHmacKey(secret, "verify");
  return crypto.subtle.verify("HMAC", key, signature, encoder.encode(value));
}

export function authorizeBridgeHeaders(headers, expectedSecret, expectedOwnerHash = OWNER_KEY_SHA256) {
  if (text(headers?.get?.("x-zhaowu-server-bridge")) !== "r146") {
    return { ok: false, status: 403, error: "BRIDGE_REQUIRED" };
  }
  const actual = text(headers?.get?.("x-zhaowu-bridge-secret"));
  const expected = text(expectedSecret);
  if (expected.length < 32) return { ok: false, status: 503, error: "BRIDGE_NOT_CONFIGURED" };
  if (actual.length !== expected.length) return { ok: false, status: 401, error: "BRIDGE_UNAUTHORIZED" };
  let diff = 0;
  for (let index = 0; index < actual.length; index += 1) diff |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  if (diff !== 0) return { ok: false, status: 401, error: "BRIDGE_UNAUTHORIZED" };

  const ownerSecret = text(headers?.get?.("x-zhaowu-owner-secret"));
  if (!isValidOwnerSecret(ownerSecret, expectedOwnerHash)) {
    return { ok: false, status: 401, error: "OWNER_UNAUTHORIZED" };
  }
  return { ok: true };
}

export async function createUploadTicket(fields, secret, nowSeconds = Math.floor(Date.now() / 1000), ttlSeconds = 7200) {
  const payload = {
    v: 1,
    bucket: text(fields.bucket),
    path: text(fields.path),
    category: text(fields.category),
    assetKey: text(fields.assetKey),
    contentType: text(fields.contentType).toLowerCase(),
    expectedSizeBytes: Number(fields.expectedSizeBytes),
    uploadType: text(fields.uploadType),
    issuedAt: nowSeconds,
    expiresAt: nowSeconds + Math.max(1, Math.min(7200, Number(ttlSeconds) || 7200)),
    nonce: text(fields.nonce) || crypto.randomUUID(),
  };
  if (!payload.bucket || !payload.path || !payload.contentType || !payload.uploadType || !Number.isSafeInteger(payload.expectedSizeBytes) || payload.expectedSizeBytes <= 0) {
    throw new Error("INVALID_UPLOAD_TICKET_FIELDS");
  }
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = toBase64Url(await hmacSign(encodedPayload, secret));
  return `${encodedPayload}.${signature}`;
}

export async function verifyUploadTicket(ticket, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  const parts = text(ticket).split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) throw new Error("UPLOAD_TICKET_INVALID");
  const signature = fromBase64Url(parts[1]);
  if (!(await hmacVerify(parts[0], signature, secret))) throw new Error("UPLOAD_TICKET_INVALID");
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[0])));
  } catch {
    throw new Error("UPLOAD_TICKET_INVALID");
  }
  if (payload?.v !== 1 || !payload.bucket || !payload.path || !payload.contentType || !payload.uploadType || !Number.isSafeInteger(payload.expectedSizeBytes)) {
    throw new Error("UPLOAD_TICKET_INVALID");
  }
  if (!Number.isSafeInteger(payload.expiresAt) || payload.expiresAt <= nowSeconds) throw new Error("UPLOAD_TICKET_EXPIRED");
  if (!Number.isSafeInteger(payload.issuedAt) || payload.issuedAt > nowSeconds + 60 || payload.expiresAt - payload.issuedAt > 7200) {
    throw new Error("UPLOAD_TICKET_INVALID");
  }
  return payload;
}

export function assertUploadTicketBinding(ticket, expected) {
  const fields = ["bucket", "path", "category", "assetKey", "contentType", "uploadType"];
  for (const field of fields) {
    if (text(ticket?.[field]) !== text(expected?.[field])) throw new Error(`UPLOAD_TICKET_BINDING_${field.toUpperCase()}`);
  }
  if (Number(ticket?.expectedSizeBytes) !== Number(expected?.expectedSizeBytes)) throw new Error("UPLOAD_TICKET_BINDING_SIZE");
  return true;
}

export function normalizeStorageObjectInfo(data) {
  if (!data || typeof data !== "object") throw new Error("UPLOADED_OBJECT_NOT_FOUND");
  const size = Number(data.size ?? data.metadata?.size);
  const contentType = text(
    data.contentType
      ?? data.content_type
      ?? data.metadata?.mimetype
      ?? data.metadata?.contentType
      ?? data.metadata?.["content-type"],
  ).toLowerCase();
  if (!Number.isSafeInteger(size) || size < 0) throw new Error("UPLOADED_OBJECT_METADATA_MISSING");
  if (!contentType) throw new Error("UPLOADED_OBJECT_METADATA_MISSING");
  return { size, contentType };
}

export function validateUploadedObject(info, ticket, options = {}) {
  const actual = normalizeStorageObjectInfo(info);
  const expectedType = text(ticket?.contentType).toLowerCase();
  const expectedSize = Number(ticket?.expectedSizeBytes);
  const maxSize = Number(options.maxSizeBytes ?? expectedSize);
  const allowedTypes = Array.isArray(options.allowedContentTypes)
    ? options.allowedContentTypes.map((item) => text(item).toLowerCase())
    : [expectedType];
  if (actual.contentType !== expectedType || !allowedTypes.includes(actual.contentType)) throw new Error("UPLOADED_OBJECT_MIME_MISMATCH");
  if (actual.size !== expectedSize) throw new Error("UPLOADED_OBJECT_SIZE_MISMATCH");
  if (!Number.isSafeInteger(maxSize) || maxSize <= 0 || actual.size > maxSize) throw new Error("UPLOADED_OBJECT_TOO_LARGE");
  return actual;
}
